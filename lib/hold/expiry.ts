import "server-only";

import { prisma } from "@/lib/prisma";

export async function cleanupExpiredHolds(): Promise<{ cleanedCount: number }> {
  const now = new Date();

  const expiredHolds = await prisma.hold.findMany({
    where: {
      expiresAt: { lt: now },
      consumedAt: null,
    },
    select: { id: true },
  });

  if (expiredHolds.length === 0) {
    return { cleanedCount: 0 };
  }

  const holdIds = expiredHolds.map((h) => h.id);

  const result = await prisma.$transaction(async (tx) => {
    // Delete hold nights first (cascade would handle this, but explicit for clarity)
    await tx.holdNight.deleteMany({
      where: { holdId: { in: holdIds } },
    });

    // Delete the holds
    const deleted = await tx.hold.deleteMany({
      where: { id: { in: holdIds } },
    });

    // Audit log for each cleaned hold
    for (const holdId of holdIds) {
      await tx.auditLog.create({
        data: {
          action: "HOLD_EXPIRED_CLEANUP",
          entityType: "HOLD",
          entityId: holdId,
          metadata: { cleanedAt: now.toISOString() },
        },
      });
    }

    return deleted.count;
  }, { isolationLevel: "Serializable" });

  return { cleanedCount: result };
}

export async function reconcileInventoryFromExpiredHolds(): Promise<{ reconciledCount: number }> {
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
    return { reconciledCount: 0 };
  }

  const result = await prisma.$transaction(async (tx) => {
    let count = 0;
    for (const hold of expiredHolds) {
      for (const night of hold.nights) {
        // Decrement heldUnits for each night that was held
        await tx.inventoryDate.updateMany({
          where: {
            roomTypeId: night.roomTypeId,
            stayDate: night.stayDate,
            heldUnits: { gt: 0 },
          },
          data: {
            heldUnits: { decrement: 1 },
          },
        });
        count++;
      }

      // Delete hold nights and the hold itself
      await tx.holdNight.deleteMany({ where: { holdId: hold.id } });
      await tx.hold.delete({ where: { id: hold.id } });

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
    return count;
  }, { isolationLevel: "Serializable" });

  return { reconciledCount: result };
}
