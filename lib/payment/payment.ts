import "server-only";

import { createHash } from "node:crypto";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { expireBookingIfPastDue } from "@/lib/booking/expiry";
import { prisma } from "@/lib/prisma";
import { DemoPaymentAdapter } from "./demo-adapter";
import { simulatePaymentSchema, type SimulatePaymentInput } from "./schemas";

type SimulatedPaymentResult = {
  bookingId: string;
  bookingStatus: "CONFIRMED" | "PAYMENT_FAILED";
  attemptReference: string;
};

export async function simulateBookingPayment(
  input: SimulatePaymentInput,
): Promise<SimulatedPaymentResult> {
  const validated = simulatePaymentSchema.parse(input);
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER || actor.status !== UserStatus.ACTIVE) {
    throw new Error("Only the active Traveler who owns this booking can pay.");
  }

  const requestHash = createHash("sha256")
    .update(JSON.stringify({
      actorId: actor.id,
      bookingId: validated.bookingId,
      outcome: validated.outcome,
    }))
    .digest("hex");
  const adapter = new DemoPaymentAdapter();
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: validated.bookingId },
      select: {
        id: true,
        bookingCode: true,
        userId: true,
        grandTotal: true,
        status: true,
        paymentExpiresAt: true,
      },
    });
    if (!booking || booking.userId !== actor.id) {
      throw new Error("Booking not found or access denied.");
    }

    const previousAttempt = await tx.paymentAttempt.findUnique({
      where: {
        bookingId_idempotencyKey: {
          bookingId: booking.id,
          idempotencyKey: validated.idempotencyKey,
        },
      },
    });
    if (previousAttempt) {
      if (previousAttempt.requestHash !== requestHash) {
        throw new Error("Payment key already used with a different request.");
      }
      return {
        kind: "paid" as const,
        bookingId: booking.id,
        bookingStatus: previousAttempt.status === "SUCCEEDED"
          ? "CONFIRMED" as const
          : "PAYMENT_FAILED" as const,
        attemptReference: previousAttempt.providerReference,
      };
    }

    if (
      booking.paymentExpiresAt &&
      booking.paymentExpiresAt.getTime() <= now.getTime() &&
      (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED")
    ) {
      await expireBookingIfPastDue(tx, booking.id, now);
      return { kind: "expired" as const };
    }
    if (booking.status !== "PENDING_PAYMENT" && booking.status !== "PAYMENT_FAILED") {
      throw new Error("This booking is no longer awaiting payment.");
    }
    if (!booking.paymentExpiresAt) {
      throw new Error("This booking does not have an online payment window.");
    }

    if (booking.status === "PAYMENT_FAILED") {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "PENDING_PAYMENT" },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          previousStatus: "PAYMENT_FAILED",
          nextStatus: "PENDING_PAYMENT",
          actorId: actor.id,
          note: "Traveler retried the demo payment.",
        },
      });
    }

    const providerResult = await adapter.charge({
      bookingReference: booking.bookingCode,
      amount: booking.grandTotal,
      currency: "IDR",
      outcome: validated.outcome,
    });
    if (
      providerResult.bookingReference !== booking.bookingCode ||
      providerResult.amount !== booking.grandTotal ||
      providerResult.currency !== "IDR"
    ) {
      throw new Error("Demo payment response did not match the booking snapshot.");
    }

    const nextStatus = providerResult.status === "SUCCEEDED"
      ? "CONFIRMED" as const
      : "PAYMENT_FAILED" as const;
    const attempt = await tx.paymentAttempt.create({
      data: {
        bookingId: booking.id,
        actorId: actor.id,
        idempotencyKey: validated.idempotencyKey,
        requestHash,
        provider: "DEMO",
        providerReference: providerResult.providerReference,
        amount: booking.grandTotal,
        currency: "IDR",
        status: providerResult.status,
        failureCode: providerResult.failureCode,
        resolvedAt: providerResult.resolvedAt,
      },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: nextStatus },
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "PENDING_PAYMENT",
        nextStatus,
        actorId: actor.id,
        note: providerResult.status === "SUCCEEDED"
          ? "Payment approved by the portfolio demo adapter."
          : "Payment declined by the portfolio demo adapter.",
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "DEMO_PAYMENT_RESOLVED",
        entityType: "PAYMENT_ATTEMPT",
        entityId: attempt.id,
        metadata: {
          bookingId: booking.id,
          providerReference: attempt.providerReference,
          amount: attempt.amount,
          currency: attempt.currency,
          status: attempt.status,
        },
      },
    });

    return {
      kind: "paid" as const,
      bookingId: booking.id,
      bookingStatus: nextStatus,
      attemptReference: attempt.providerReference,
    };
  }, { isolationLevel: "Serializable" });

  if (result.kind === "expired") throw new Error("Payment window expired.");
  return result;
}
