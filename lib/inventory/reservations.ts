import "server-only";

import type { Prisma } from "@/generated/prisma/client";

type InventoryNight = {
  roomTypeId: string;
  stayDate: Date;
};

async function loadSellableInventory(
  transaction: Prisma.TransactionClient,
  roomTypeId: string,
  stayDates: Date[],
) {
  const room = await transaction.roomType.findFirst({
    where: {
      id: roomTypeId,
      archivedAt: null,
      isActive: true,
      property: {
        archivedAt: null,
        status: "PUBLISHED",
      },
    },
    select: {
      id: true,
      name: true,
      basePrice: true,
      totalUnits: true,
      adultCapacity: true,
      childCapacity: true,
      property: {
        select: {
          ownerPartnerId: true,
          name: true,
          cancellationPolicy: true,
        },
      },
    },
  });
  if (!room) throw new Error("Room type is no longer available.");

  await transaction.inventoryDate.createMany({
    data: stayDates.map((stayDate) => ({ roomTypeId, stayDate })),
    skipDuplicates: true,
  });

  const inventory = await transaction.inventoryDate.findMany({
    where: { roomTypeId, stayDate: { in: stayDates } },
    orderBy: { stayDate: "asc" },
  });
  if (inventory.length !== stayDates.length) {
    throw new Error("Inventory could not be prepared for every stay date.");
  }

  for (const night of inventory) {
    const capacity = night.totalUnitsOverride ?? room.totalUnits;
    if (night.stopSell || night.heldUnits + night.bookedUnits >= capacity) {
      throw new Error("This stay is no longer available for the selected dates.");
    }
  }

  return { room, inventory };
}

export async function reserveHeldInventory(
  transaction: Prisma.TransactionClient,
  roomTypeId: string,
  stayDates: Date[],
) {
  const result = await loadSellableInventory(transaction, roomTypeId, stayDates);
  for (const stayDate of stayDates) {
    await transaction.inventoryDate.update({
      where: { roomTypeId_stayDate: { roomTypeId, stayDate } },
      data: { heldUnits: { increment: 1 } },
    });
  }
  return result;
}

export async function reserveBookedInventory(
  transaction: Prisma.TransactionClient,
  roomTypeId: string,
  stayDates: Date[],
) {
  const result = await loadSellableInventory(transaction, roomTypeId, stayDates);
  for (const stayDate of stayDates) {
    await transaction.inventoryDate.update({
      where: { roomTypeId_stayDate: { roomTypeId, stayDate } },
      data: { bookedUnits: { increment: 1 } },
    });
  }
  return result;
}

export async function consumeHeldInventory(
  transaction: Prisma.TransactionClient,
  nights: InventoryNight[],
) {
  for (const night of nights) {
    const updated = await transaction.inventoryDate.updateMany({
      where: {
        roomTypeId: night.roomTypeId,
        stayDate: night.stayDate,
        heldUnits: { gt: 0 },
      },
      data: {
        heldUnits: { decrement: 1 },
        bookedUnits: { increment: 1 },
      },
    });
    if (updated.count !== 1) {
      throw new Error("Held inventory is inconsistent. Please create a fresh quote.");
    }
  }
}

export async function releaseHeldInventory(
  transaction: Prisma.TransactionClient,
  nights: InventoryNight[],
) {
  for (const night of nights) {
    await transaction.inventoryDate.updateMany({
      where: {
        roomTypeId: night.roomTypeId,
        stayDate: night.stayDate,
        heldUnits: { gt: 0 },
      },
      data: { heldUnits: { decrement: 1 } },
    });
  }
}

export async function releaseBookedInventory(
  transaction: Prisma.TransactionClient,
  nights: InventoryNight[],
) {
  for (const night of nights) {
    const updated = await transaction.inventoryDate.updateMany({
      where: {
        roomTypeId: night.roomTypeId,
        stayDate: night.stayDate,
        bookedUnits: { gt: 0 },
      },
      data: { bookedUnits: { decrement: 1 } },
    });
    if (updated.count !== 1) {
      throw new Error("Booked inventory is inconsistent.");
    }
  }
}
