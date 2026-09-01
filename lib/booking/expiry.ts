import "server-only";

import { releaseBookedInventory } from "@/lib/inventory/reservations";
import { prisma } from "@/lib/prisma";

type CleanupExpiredBookingsOptions = {
  now?: Date;
  batchSize?: number;
};

export async function cleanupExpiredPendingBookings(
  options: CleanupExpiredBookingsOptions = {},
): Promise<{ expiredCount: number; releasedNights: number }> {
  const now = options.now ?? new Date();
  const batchSize = options.batchSize ?? 100;
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    throw new Error("Expiry batch size must be an integer between 1 and 500.");
  }

  const candidates = await prisma.booking.findMany({
    where: {
      status: "PENDING_PAYMENT",
      paymentExpiresAt: { lte: now },
    },
    orderBy: [{ paymentExpiresAt: "asc" }, { id: "asc" }],
    take: batchSize,
    select: { id: true },
  });

  let expiredCount = 0;
  let releasedNights = 0;

  for (const candidate of candidates) {
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.booking.updateMany({
        where: {
          id: candidate.id,
          status: "PENDING_PAYMENT",
          paymentExpiresAt: { lte: now },
        },
        data: { status: "EXPIRED" },
      });
      if (claimed.count !== 1) return { expired: false, nights: 0 };

      const booking = await tx.booking.findUniqueOrThrow({
        where: { id: candidate.id },
        select: {
          paymentExpiresAt: true,
          nights: { select: { roomTypeId: true, stayDate: true } },
        },
      });

      await releaseBookedInventory(tx, booking.nights);
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: candidate.id,
          previousStatus: "PENDING_PAYMENT",
          nextStatus: "EXPIRED",
          note: "Payment window expired.",
        },
      });
      await tx.auditLog.create({
        data: {
          action: "BOOKING_EXPIRED",
          entityType: "BOOKING",
          entityId: candidate.id,
          metadata: {
            paymentExpiresAt: booking.paymentExpiresAt?.toISOString() ?? null,
            expiredAt: now.toISOString(),
            nightsCount: booking.nights.length,
          },
        },
      });

      return { expired: true, nights: booking.nights.length };
    }, { isolationLevel: "Serializable" });

    if (result.expired) {
      expiredCount += 1;
      releasedNights += result.nights;
    }
  }

  return { expiredCount, releasedNights };
}
