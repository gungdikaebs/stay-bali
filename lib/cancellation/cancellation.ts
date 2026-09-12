import "server-only";

import { createHash } from "node:crypto";
import type { CancellationRequestType, Prisma } from "@/generated/prisma/client";
import { PartnerStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getCancellationPreview } from "@/lib/booking/rules";
import { baliToday } from "@/lib/inventory/rules";
import { releaseBookedInventory } from "@/lib/inventory/reservations";
import { bookingEmailTopics, enqueueBookingEmail } from "@/lib/notification/events";
import { DemoPaymentAdapter } from "@/lib/payment/demo-adapter";
import { prisma } from "@/lib/prisma";
import { isCancellationEscalated } from "./rules";
import {
  cancelManualBookingSchema,
  requestCancellationExceptionSchema,
  requestPartnerCancellationSchema,
  resolveCancellationSchema,
  standardCancellationSchema,
  type CancelManualBookingInput,
  type RequestCancellationExceptionInput,
  type RequestPartnerCancellationInput,
  type ResolveCancellationInput,
  type StandardCancellationInput,
} from "./schemas";

function hashRequest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function cancellationResult(value: unknown) {
  if (
    value && typeof value === "object" &&
    "bookingId" in value && typeof value.bookingId === "string" &&
    "status" in value && typeof value.status === "string"
  ) return { bookingId: value.bookingId, status: value.status };
  return null;
}

async function findPrevious(
  tx: Prisma.TransactionClient,
  scope: string,
  key: string,
  actorId: string,
  requestHash: string,
) {
  const previous = await tx.idempotencyRecord.findUnique({
    where: { scope_key: { scope, key } },
  });
  if (!previous) return null;
  if (previous.actorId !== actorId || previous.request !== requestHash) {
    throw new Error("Cancellation key already used with a different request.");
  }
  const result = cancellationResult(previous.result);
  if (result) return result;
  throw new Error("Cancellation request is already being processed.");
}

async function completeApprovedCancellation(
  tx: Prisma.TransactionClient,
  input: {
    cancellationRequestId: string;
    bookingId: string;
    bookingCode: string;
    previousStatus: "CANCELLATION_REQUESTED";
    actorId: string | null;
    refundAmount: number;
    resolutionNote: string;
    nights: { roomTypeId: string; stayDate: Date }[];
  },
) {
  await releaseBookedInventory(tx, input.nights);
  let finalStatus: "CANCELLED" | "REFUNDED";

  if (input.refundAmount > 0) {
    const refundResult = await new DemoPaymentAdapter().refund({
      bookingReference: input.bookingCode,
      amount: input.refundAmount,
      currency: "IDR",
    });
    await tx.booking.update({ where: { id: input.bookingId }, data: { status: "REFUND_PENDING" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: input.bookingId,
        previousStatus: input.previousStatus,
        nextStatus: "REFUND_PENDING",
        actorId: input.actorId,
        note: `${input.resolutionNote} Demo refund processing started.`,
      },
    });
    await tx.refundRecord.create({
      data: {
        bookingId: input.bookingId,
        cancellationRequestId: input.cancellationRequestId,
        processedById: null,
        amount: input.refundAmount,
        currency: "IDR",
        reference: refundResult.providerReference,
        note: "Automatically recorded by the portfolio demo refund adapter.",
      },
    });
    await tx.booking.update({ where: { id: input.bookingId }, data: { status: "REFUNDED" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: input.bookingId,
        previousStatus: "REFUND_PENDING",
        nextStatus: "REFUNDED",
        actorId: input.actorId,
        note: "Portfolio demo refund completed automatically.",
      },
    });
    finalStatus = "REFUNDED";
  } else {
    await tx.booking.update({ where: { id: input.bookingId }, data: { status: "CANCELLED" } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: input.bookingId,
        previousStatus: input.previousStatus,
        nextStatus: "CANCELLED",
        actorId: input.actorId,
        note: input.resolutionNote,
      },
    });
    finalStatus = "CANCELLED";
  }

  await tx.cancellationRequest.update({
    where: { id: input.cancellationRequestId },
    data: {
      status: "APPROVED",
      resolutionNote: input.resolutionNote,
      resolvedById: input.actorId,
      resolvedAt: new Date(),
    },
  });
  await enqueueBookingEmail(tx, {
    bookingId: input.bookingId,
    topic: finalStatus === "REFUNDED" ? bookingEmailTopics.refunded : bookingEmailTopics.cancelled,
    dedupeKey: input.cancellationRequestId,
  });
  return finalStatus;
}

export async function confirmStandardCancellation(input: StandardCancellationInput) {
  const validated = standardCancellationSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER || actor.status !== UserStatus.ACTIVE) {
    throw new Error("Only the active Traveler who owns this booking can cancel it.");
  }
  const scope = "STANDARD_CANCELLATION";
  const requestHash = hashRequest({ actorId: actor.id, bookingId: validated.bookingId });

  return prisma.$transaction(async (tx) => {
    const previous = await findPrevious(tx, scope, validated.idempotencyKey, actor.id, requestHash);
    if (previous) return previous;
    const booking = await tx.booking.findUnique({
      where: { id: validated.bookingId },
      select: {
        id: true, bookingCode: true, userId: true, source: true, status: true,
        freeCancellationUntil: true, refundAmountBeforeDeadline: true,
        refundAmountAfterDeadline: true, nights: { select: { roomTypeId: true, stayDate: true } },
      },
    });
    if (!booking || booking.userId !== actor.id || booking.source !== "ONLINE") {
      throw new Error("Booking not found or access denied.");
    }
    if (booking.status !== "CONFIRMED") throw new Error("Only a confirmed booking can be cancelled.");
    const preview = getCancellationPreview({ ...booking, today: baliToday() });
    await tx.idempotencyRecord.create({
      data: { scope, key: validated.idempotencyKey, actorId: actor.id, request: requestHash },
    });
    const claimed = await tx.booking.updateMany({
      where: { id: booking.id, status: "CONFIRMED" },
      data: { status: "CANCELLATION_REQUESTED" },
    });
    if (claimed.count !== 1) throw new Error("Booking status changed before cancellation could be completed.");
    const cancellation = await tx.cancellationRequest.create({
      data: {
        bookingId: booking.id,
        requesterId: actor.id,
        type: "STANDARD",
        reason: "Traveler confirmed the published cancellation terms.",
        eligibleForFullRefund: preview.eligibleForFullRefund,
        requestedRefundAmount: preview.refundAmount,
      },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "CONFIRMED",
        nextStatus: "CANCELLATION_REQUESTED",
        actorId: actor.id,
        note: "Traveler confirmed the standard cancellation terms.",
      },
    });
    const finalStatus = await completeApprovedCancellation(tx, {
      cancellationRequestId: cancellation.id,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      previousStatus: "CANCELLATION_REQUESTED",
      actorId: actor.id,
      refundAmount: preview.refundAmount,
      resolutionNote: preview.eligibleForFullRefund
        ? "Cancelled automatically within the free-cancellation window."
        : "Cancelled automatically after the free-cancellation deadline without refund.",
      nights: booking.nights,
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "CANCELLATION_AUTO_RESOLVED",
        entityType: "CANCELLATION_REQUEST",
        entityId: cancellation.id,
        metadata: { bookingId: booking.id, refundAmount: preview.refundAmount, finalStatus },
      },
    });
    const result = { bookingId: booking.id, status: finalStatus };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope, key: validated.idempotencyKey } }, data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}

export async function requestCancellationException(input: RequestCancellationExceptionInput) {
  const validated = requestCancellationExceptionSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER || actor.status !== UserStatus.ACTIVE) {
    throw new Error("Only the active Traveler who owns this booking can request an exception.");
  }
  return createPendingRequest({
    actorId: actor.id,
    actorRole: "TRAVELER",
    bookingId: validated.bookingId,
    reason: validated.reason,
    idempotencyKey: validated.idempotencyKey,
    type: "POLICY_EXCEPTION",
  });
}

export async function requestPartnerCancellation(input: RequestPartnerCancellationInput) {
  const validated = requestPartnerCancellationSchema.parse(input);
  const actor = await getCurrentUser();
  if (
    !actor || actor.role !== UserRole.PARTNER || actor.status !== UserStatus.ACTIVE ||
    actor.partnerProfile?.status !== PartnerStatus.ACTIVE
  ) throw new Error("Only an active Partner can request this cancellation.");
  return createPendingRequest({
    actorId: actor.id,
    actorRole: "PARTNER",
    partnerProfileId: actor.partnerProfile.id,
    bookingId: validated.bookingId,
    reason: validated.reason,
    idempotencyKey: validated.idempotencyKey,
    type: "PARTNER_INITIATED",
  });
}

async function createPendingRequest(input: {
  actorId: string;
  actorRole: "TRAVELER" | "PARTNER";
  partnerProfileId?: string;
  bookingId: string;
  reason: string;
  idempotencyKey: string;
  type: Exclude<CancellationRequestType, "STANDARD">;
}) {
  const scope = input.type === "POLICY_EXCEPTION" ? "CANCELLATION_EXCEPTION" : "PARTNER_CANCELLATION";
  const requestHash = hashRequest(input);
  return prisma.$transaction(async (tx) => {
    const previous = await findPrevious(tx, scope, input.idempotencyKey, input.actorId, requestHash);
    if (previous) return previous;
    const booking = await tx.booking.findUnique({
      where: { id: input.bookingId },
      select: {
        id: true, userId: true, source: true, status: true, grandTotal: true,
        freeCancellationUntil: true, refundAmountBeforeDeadline: true,
        refundAmountAfterDeadline: true,
        roomType: { select: { property: { select: { ownerPartnerId: true } } } },
      },
    });
    const ownsBooking = input.actorRole === "TRAVELER"
      ? booking?.userId === input.actorId && booking?.source === "ONLINE"
      : booking?.roomType.property.ownerPartnerId === input.partnerProfileId && booking?.source === "ONLINE";
    if (!booking || !ownsBooking) throw new Error("Booking not found or access denied.");
    if (booking.status !== "CONFIRMED") throw new Error("Only a confirmed booking can be cancelled.");
    const preview = getCancellationPreview({ ...booking, today: baliToday() });
    if (input.type === "POLICY_EXCEPTION" && preview.eligibleForFullRefund) {
      throw new Error("This booking can be cancelled automatically with a full refund.");
    }
    await tx.idempotencyRecord.create({
      data: { scope, key: input.idempotencyKey, actorId: input.actorId, request: requestHash },
    });
    const claimed = await tx.booking.updateMany({
      where: { id: booking.id, status: "CONFIRMED" }, data: { status: "CANCELLATION_REQUESTED" },
    });
    if (claimed.count !== 1) throw new Error("Booking status changed before cancellation could be requested.");
    const cancellation = await tx.cancellationRequest.create({
      data: {
        bookingId: booking.id,
        requesterId: input.actorId,
        type: input.type,
        reason: input.reason,
        eligibleForFullRefund: input.type === "PARTNER_INITIATED",
        requestedRefundAmount: booking.grandTotal,
      },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "CONFIRMED",
        nextStatus: "CANCELLATION_REQUESTED",
        actorId: input.actorId,
        note: input.type === "POLICY_EXCEPTION"
          ? "Traveler requested an exception to the cancellation policy."
          : "Partner requested cancellation of an online booking.",
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "CANCELLATION_EXCEPTION_REQUESTED",
        entityType: "CANCELLATION_REQUEST",
        entityId: cancellation.id,
        metadata: { bookingId: booking.id, type: input.type },
      },
    });
    await enqueueBookingEmail(tx, {
      bookingId: booking.id, topic: bookingEmailTopics.cancellationRequested, dedupeKey: cancellation.id,
    });
    const result = { bookingId: booking.id, status: "CANCELLATION_REQUESTED" };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope, key: input.idempotencyKey } }, data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}

export async function cancelManualBooking(input: CancelManualBookingInput) {
  const validated = cancelManualBookingSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.status !== UserStatus.ACTIVE || (actor.role !== UserRole.ADMIN && actor.role !== UserRole.PARTNER)) {
    throw new Error("Only an authorized operator can cancel a manual booking.");
  }
  if (actor.role === UserRole.PARTNER && actor.partnerProfile?.status !== PartnerStatus.ACTIVE) {
    throw new Error("Only an active Partner can cancel a manual booking.");
  }
  const scope = "CANCEL_MANUAL_BOOKING";
  const requestHash = hashRequest({ actorId: actor.id, ...validated });
  return prisma.$transaction(async (tx) => {
    const previous = await findPrevious(tx, scope, validated.idempotencyKey, actor.id, requestHash);
    if (previous) return previous;
    const booking = await tx.booking.findUnique({
      where: { id: validated.bookingId },
      select: {
        id: true, bookingCode: true, source: true, status: true,
        nights: { select: { roomTypeId: true, stayDate: true } },
        roomType: { select: { property: { select: { ownerPartnerId: true } } } },
      },
    });
    if (
      !booking || booking.source !== "MANUAL" ||
      (actor.role === UserRole.PARTNER && booking.roomType.property.ownerPartnerId !== actor.partnerProfile?.id)
    ) throw new Error("Booking not found or access denied.");
    if (booking.status !== "CONFIRMED") throw new Error("Only a confirmed manual booking can be cancelled.");
    await tx.idempotencyRecord.create({
      data: { scope, key: validated.idempotencyKey, actorId: actor.id, request: requestHash },
    });
    const claimed = await tx.booking.updateMany({
      where: { id: booking.id, status: "CONFIRMED" }, data: { status: "CANCELLATION_REQUESTED" },
    });
    if (claimed.count !== 1) throw new Error("Booking status changed before cancellation could be completed.");
    const cancellation = await tx.cancellationRequest.create({
      data: {
        bookingId: booking.id, requesterId: actor.id, type: "PARTNER_INITIATED",
        reason: validated.reason, eligibleForFullRefund: false, requestedRefundAmount: 0,
      },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "CONFIRMED",
        nextStatus: "CANCELLATION_REQUESTED",
        actorId: actor.id,
        note: "Authorized operator started cancellation of a manual reservation.",
      },
    });
    const finalStatus = await completeApprovedCancellation(tx, {
      cancellationRequestId: cancellation.id,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      previousStatus: "CANCELLATION_REQUESTED",
      actorId: actor.id,
      refundAmount: 0,
      resolutionNote: `Manual reservation cancelled by an authorized operator. ${validated.reason}`,
      nights: booking.nights,
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id, action: "MANUAL_BOOKING_CANCELLED", entityType: "BOOKING",
        entityId: booking.id, metadata: { reason: validated.reason },
      },
    });
    const result = { bookingId: booking.id, status: finalStatus };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope, key: validated.idempotencyKey } }, data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}

export async function resolveCancellationRequest(input: ResolveCancellationInput) {
  const validated = resolveCancellationSchema.parse(input);
  const actor = await getCurrentUser();
  const activePartner = actor?.role === UserRole.PARTNER && actor.partnerProfile?.status === PartnerStatus.ACTIVE;
  if (!actor || actor.status !== UserStatus.ACTIVE || (actor.role !== UserRole.ADMIN && !activePartner)) {
    throw new Error("Only an authorized cancellation reviewer can resolve this request.");
  }
  const scope = "RESOLVE_CANCELLATION";
  const requestHash = hashRequest({ actorId: actor.id, ...validated });
  return prisma.$transaction(async (tx) => {
    const previous = await findPrevious(tx, scope, validated.idempotencyKey, actor.id, requestHash);
    if (previous) return previous;
    const cancellation = await tx.cancellationRequest.findUnique({
      where: { id: validated.cancellationRequestId },
      include: {
        booking: {
          select: {
            id: true, bookingCode: true, status: true,
            nights: { select: { roomTypeId: true, stayDate: true } },
            roomType: { select: { property: { select: { ownerPartnerId: true } } } },
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
    if (actor.role === UserRole.PARTNER && (
      cancellation.type !== "POLICY_EXCEPTION" ||
      cancellation.booking.roomType.property.ownerPartnerId !== actor.partnerProfile?.id
    )) throw new Error("Cancellation request not found or access denied.");
    if (
      actor.role === UserRole.ADMIN &&
      cancellation.type === "POLICY_EXCEPTION" &&
      !isCancellationEscalated(cancellation.createdAt)
    ) throw new Error("Cancellation request not found or access denied.");
    await tx.idempotencyRecord.create({
      data: { scope, key: validated.idempotencyKey, actorId: actor.id, request: requestHash },
    });
    let finalStatus: "CONFIRMED" | "CANCELLED" | "REFUNDED";
    if (validated.decision === "REJECT") {
      await tx.booking.update({ where: { id: cancellation.booking.id }, data: { status: "CONFIRMED" } });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: cancellation.booking.id, previousStatus: "CANCELLATION_REQUESTED",
          nextStatus: "CONFIRMED", actorId: actor.id, note: validated.resolutionNote,
        },
      });
      await tx.cancellationRequest.update({
        where: { id: cancellation.id },
        data: { status: "REJECTED", resolutionNote: validated.resolutionNote, resolvedById: actor.id, resolvedAt: new Date() },
      });
      finalStatus = "CONFIRMED";
    } else {
      finalStatus = await completeApprovedCancellation(tx, {
        cancellationRequestId: cancellation.id,
        bookingId: cancellation.booking.id,
        bookingCode: cancellation.booking.bookingCode,
        previousStatus: "CANCELLATION_REQUESTED",
        actorId: actor.id,
        refundAmount: cancellation.requestedRefundAmount,
        resolutionNote: validated.resolutionNote,
        nights: cancellation.booking.nights,
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: actor.id, action: "CANCELLATION_RESOLVED", entityType: "CANCELLATION_REQUEST",
        entityId: cancellation.id,
        metadata: { bookingId: cancellation.booking.id, decision: validated.decision, type: cancellation.type, finalStatus },
      },
    });
    const result = { bookingId: cancellation.booking.id, status: finalStatus };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope, key: validated.idempotencyKey } }, data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}
