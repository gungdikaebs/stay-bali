import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { releaseBookedInventory } from "@/lib/inventory/reservations";
import { prisma } from "@/lib/prisma";

type CleanupExpiredBookingsOptions = {
  now?: Date;
  batchSize?: number;
};

export async function expireBookingIfPastDue(
  tx: Prisma.TransactionClient,
  bookingId: string,
  now: Date,
): Promise<{ expired: boolean; nights: number }> {
  const booking = await tx.booking.findFirst({
    where: {
      id: bookingId,
      status: { in: ["PENDING_PAYMENT", "PAYMENT_FAILED"] },
      paymentExpiresAt: { lte: now },
    },
    select: {
      status: true,
      paymentExpiresAt: true,
      nights: { select: { roomTypeId: true, stayDate: true } },
    },
  });
  if (!booking) return { expired: false, nights: 0 };

  const claimed = await tx.booking.updateMany({
    where: {
      id: bookingId,
      status: booking.status,
      paymentExpiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });
  if (claimed.count !== 1) return { expired: false, nights: 0 };

  await releaseBookedInventory(tx, booking.nights);
  await tx.bookingStatusHistory.create({
    data: {
      bookingId,
      previousStatus: booking.status,
      nextStatus: "EXPIRED",
      note: "Payment window expired.",
    },
  });
  await tx.auditLog.create({
    data: {
      action: "BOOKING_EXPIRED",
      entityType: "BOOKING",
      entityId: bookingId,
      metadata: {
        paymentExpiresAt: booking.paymentExpiresAt?.toISOString() ?? null,
        expiredAt: now.toISOString(),
        nightsCount: booking.nights.length,
      },
    },
  });

  return { expired: true, nights: booking.nights.length };
}

export async function cleanupExpiredPaymentBookings(
  options: CleanupExpiredBookingsOptions = {},
): Promise<{ expiredCount: number; releasedNights: number }> {
  const now = options.now ?? new Date();
  const batchSize = options.batchSize ?? 100;
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    throw new Error("Expiry batch size must be an integer between 1 and 500.");
  }

  const candidates = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING_PAYMENT", "PAYMENT_FAILED"] },
      paymentExpiresAt: { lte: now },
    },
    orderBy: [{ paymentExpiresAt: "asc" }, { id: "asc" }],
    take: batchSize,
    select: { id: true },
  });

  let expiredCount = 0;
  let releasedNights = 0;

  for (const candidate of candidates) {
    const result = await prisma.$transaction(
      (tx) => expireBookingIfPastDue(tx, candidate.id, now),
      { isolationLevel: "Serializable" },
    );

    if (result.expired) {
      expiredCount += 1;
      releasedNights += result.nights;
    }
  }

  return { expiredCount, releasedNights };
}
