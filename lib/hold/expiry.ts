import "server-only";

import { prisma } from "@/lib/prisma";
import { releaseHeldInventory } from "@/lib/inventory/reservations";

export async function cleanupExpiredHolds(): Promise<{ cleanedCount: number }> {
  const result = await reconcileExpiredHolds();
  return { cleanedCount: result.holds };
}

export async function reconcileInventoryFromExpiredHolds(): Promise<{ reconciledCount: number }> {
  const result = await reconcileExpiredHolds();
  return { reconciledCount: result.nights };
}

async function reconcileExpiredHolds(): Promise<{ holds: number; nights: number }> {
  const now = new Date();

  const expiredHolds = await prisma.hold.findMany({
    where: {
      expiresAt: { lt: now },
      consumedAt: null,
    },
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
      const current = await tx.hold.findFirst({
        where: { id: hold.id, expiresAt: { lt: now }, consumedAt: null },
        select: { id: true },
      });
      if (!current) continue;

      await releaseHeldInventory(tx, hold.nights);
      nights += hold.nights.length;

      await tx.holdNight.deleteMany({ where: { holdId: hold.id } });
      await tx.hold.delete({ where: { id: hold.id } });
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
