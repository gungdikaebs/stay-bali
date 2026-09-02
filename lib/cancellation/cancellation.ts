import "server-only";

import { createHash } from "node:crypto";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { isEligibleForFullRefund } from "@/lib/booking/rules";
import { baliToday } from "@/lib/inventory/rules";
import { releaseBookedInventory } from "@/lib/inventory/reservations";
import { prisma } from "@/lib/prisma";
import {
  requestCancellationSchema,
  resolveCancellationSchema,
  type RequestCancellationInput,
  type ResolveCancellationInput,
} from "./schemas";

function cancellationResult(value: unknown) {
  if (
    value && typeof value === "object" &&
    "bookingId" in value && typeof value.bookingId === "string" &&
    "status" in value && typeof value.status === "string"
  ) {
    return { bookingId: value.bookingId, status: value.status };
  }
  return null;
}

export async function requestBookingCancellation(input: RequestCancellationInput) {
  const validated = requestCancellationSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER || actor.status !== UserStatus.ACTIVE) {
    throw new Error("Only the active Traveler who owns this booking can request cancellation.");
  }
  const requestHash = createHash("sha256").update(JSON.stringify({
    actorId: actor.id,
    bookingId: validated.bookingId,
    reason: validated.reason,
  })).digest("hex");

  return prisma.$transaction(async (tx) => {
    const previous = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "REQUEST_CANCELLATION", key: validated.idempotencyKey } },
    });
    if (previous) {
      if (previous.actorId !== actor.id || previous.request !== requestHash) {
        throw new Error("Cancellation key already used with a different request.");
      }
      const result = cancellationResult(previous.result);
      if (result) return result;
      throw new Error("Cancellation request is already being processed.");
    }

    const booking = await tx.booking.findUnique({
      where: { id: validated.bookingId },
      select: { id: true, userId: true, status: true, checkinDate: true, grandTotal: true },
    });
    if (!booking || booking.userId !== actor.id) throw new Error("Booking not found or access denied.");
    if (booking.status !== "CONFIRMED") throw new Error("Only a confirmed booking can be cancelled.");

    const eligibleForFullRefund = isEligibleForFullRefund(booking.checkinDate, baliToday());
    await tx.idempotencyRecord.create({
      data: { scope: "REQUEST_CANCELLATION", key: validated.idempotencyKey, actorId: actor.id, request: requestHash },
    });
    const claimed = await tx.booking.updateMany({
      where: { id: booking.id, status: "CONFIRMED" },
      data: { status: "CANCELLATION_REQUESTED" },
    });
    if (claimed.count !== 1) throw new Error("Booking status changed before cancellation could be requested.");
    const cancellation = await tx.cancellationRequest.create({
      data: {
        bookingId: booking.id,
        requesterId: actor.id,
        reason: validated.reason,
        eligibleForFullRefund,
        requestedRefundAmount: eligibleForFullRefund ? booking.grandTotal : 0,
      },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "CONFIRMED",
        nextStatus: "CANCELLATION_REQUESTED",
        actorId: actor.id,
        note: "Traveler submitted a cancellation request.",
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "CANCELLATION_REQUESTED",
        entityType: "CANCELLATION_REQUEST",
        entityId: cancellation.id,
        metadata: { bookingId: booking.id, eligibleForFullRefund },
      },
    });
    const result = { bookingId: booking.id, status: "CANCELLATION_REQUESTED" };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope: "REQUEST_CANCELLATION", key: validated.idempotencyKey } },
      data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}

export async function resolveCancellationRequest(input: ResolveCancellationInput) {
  const validated = resolveCancellationSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.ADMIN || actor.status !== UserStatus.ACTIVE) {
    throw new Error("Only an active Admin can resolve cancellation requests.");
  }
  const requestHash = createHash("sha256").update(JSON.stringify({
    actorId: actor.id,
    cancellationRequestId: validated.cancellationRequestId,
    decision: validated.decision,
    resolutionNote: validated.resolutionNote,
    refundReference: validated.refundReference ?? null,
  })).digest("hex");

  return prisma.$transaction(async (tx) => {
    const previous = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "RESOLVE_CANCELLATION", key: validated.idempotencyKey } },
    });
    if (previous) {
      if (previous.actorId !== actor.id || previous.request !== requestHash) {
        throw new Error("Resolution key already used with a different request.");
      }
      const result = cancellationResult(previous.result);
      if (result) return result;
      throw new Error("Cancellation resolution is already being processed.");
    }

    const cancellation = await tx.cancellationRequest.findUnique({
      where: { id: validated.cancellationRequestId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            grandTotal: true,
            nights: { select: { roomTypeId: true, stayDate: true } },
          },
        },
      },
    });
    if (!cancellation || cancellation.status !== "PENDING") {
      throw new Error("Cancellation request is no longer pending.");
    }
    if (cancellation.booking.status !== "CANCELLATION_REQUESTED") {
      throw new Error("Booking is no longer awaiting a cancellation decision.");
    }
    if (
      validated.decision === "APPROVE" &&
      cancellation.eligibleForFullRefund &&
      (!validated.refundReference || validated.refundReference.length < 4)
    ) {
      throw new Error("A manual refund reference is required for a full refund.");
    }

    await tx.idempotencyRecord.create({
      data: { scope: "RESOLVE_CANCELLATION", key: validated.idempotencyKey, actorId: actor.id, request: requestHash },
    });
    let finalStatus: "CONFIRMED" | "CANCELLED" | "REFUNDED";

    if (validated.decision === "REJECT") {
      await tx.booking.update({ where: { id: cancellation.booking.id }, data: { status: "CONFIRMED" } });
      await tx.bookingStatusHistory.create({
        data: { bookingId: cancellation.booking.id, previousStatus: "CANCELLATION_REQUESTED", nextStatus: "CONFIRMED", actorId: actor.id, note: validated.resolutionNote },
      });
      finalStatus = "CONFIRMED";
    } else if (cancellation.eligibleForFullRefund) {
      await tx.booking.update({ where: { id: cancellation.booking.id }, data: { status: "REFUND_PENDING" } });
      await tx.bookingStatusHistory.create({
        data: { bookingId: cancellation.booking.id, previousStatus: "CANCELLATION_REQUESTED", nextStatus: "REFUND_PENDING", actorId: actor.id, note: "Cancellation approved; manual refund recorded." },
      });
      await releaseBookedInventory(tx, cancellation.booking.nights);
      await tx.refundRecord.create({
        data: {
          bookingId: cancellation.booking.id,
          cancellationRequestId: cancellation.id,
          processedById: actor.id,
          amount: cancellation.booking.grandTotal,
          currency: "IDR",
          reference: validated.refundReference!,
          note: validated.resolutionNote,
        },
      });
      await tx.booking.update({ where: { id: cancellation.booking.id }, data: { status: "REFUNDED" } });
      await tx.bookingStatusHistory.create({
        data: { bookingId: cancellation.booking.id, previousStatus: "REFUND_PENDING", nextStatus: "REFUNDED", actorId: actor.id, note: validated.resolutionNote },
      });
      finalStatus = "REFUNDED";
    } else {
      await tx.booking.update({ where: { id: cancellation.booking.id }, data: { status: "CANCELLED" } });
      await releaseBookedInventory(tx, cancellation.booking.nights);
      await tx.bookingStatusHistory.create({
        data: { bookingId: cancellation.booking.id, previousStatus: "CANCELLATION_REQUESTED", nextStatus: "CANCELLED", actorId: actor.id, note: validated.resolutionNote },
      });
      finalStatus = "CANCELLED";
    }

    await tx.cancellationRequest.update({
      where: { id: cancellation.id },
      data: {
        status: validated.decision === "APPROVE" ? "APPROVED" : "REJECTED",
        resolutionNote: validated.resolutionNote,
        resolvedById: actor.id,
        resolvedAt: new Date(),
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "CANCELLATION_RESOLVED",
        entityType: "CANCELLATION_REQUEST",
        entityId: cancellation.id,
        metadata: { bookingId: cancellation.booking.id, decision: validated.decision, finalStatus },
      },
    });
    const result = { bookingId: cancellation.booking.id, status: finalStatus };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope: "RESOLVE_CANCELLATION", key: validated.idempotencyKey } },
      data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}
