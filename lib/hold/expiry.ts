import "server-only";

import { prisma } from "@/lib/prisma";
import { releaseHeldInventory } from "@/lib/inventory/reservations";

type ExpiredHoldOptions = {
  now?: Date;
  batchSize?: number;
};

export async function cleanupExpiredHolds(
  options: ExpiredHoldOptions = {},
): Promise<{ cleanedCount: number }> {
  const result = await reconcileExpiredHolds(options);
  return { cleanedCount: result.holds };
}

export async function reconcileInventoryFromExpiredHolds(
  options: ExpiredHoldOptions = {},
): Promise<{ reconciledCount: number }> {
  const result = await reconcileExpiredHolds(options);
  return { reconciledCount: result.nights };
}

async function reconcileExpiredHolds(
  options: ExpiredHoldOptions,
): Promise<{ holds: number; nights: number }> {
  const now = options.now ?? new Date();
  const batchSize = options.batchSize ?? 100;
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    throw new Error("Expiry batch size must be an integer between 1 and 500.");
  }

  const expiredHolds = await prisma.hold.findMany({
    where: {
      expiresAt: { lt: now },
      consumedAt: null,
    },
    orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
    take: batchSize,
    select: {
      id: true,
      nights: {
        select: {
          roomTypeId: true,
          stayDate: true,
        },
      },
    },
  });

  if (expiredHolds.length === 0) {
    return { holds: 0, nights: 0 };
  }

  const result = await prisma.$transaction(async (tx) => {
    let holds = 0;
    let nights = 0;
    for (const hold of expiredHolds) {
      const claimed = await tx.hold.deleteMany({
        where: { id: hold.id, expiresAt: { lt: now }, consumedAt: null },
      });
      if (claimed.count !== 1) continue;

      await releaseHeldInventory(tx, hold.nights);
      nights += hold.nights.length;
      holds++;

      await tx.auditLog.create({
        data: {
          action: "HOLD_RECONCILED",
          entityType: "HOLD",
          entityId: hold.id,
          metadata: {
            nightsCount: hold.nights.length,
            reconciledAt: now.toISOString(),
          },
        },
      });
    }
    return { holds, nights };
  }, { isolationLevel: "Serializable" });

  return result;
}
