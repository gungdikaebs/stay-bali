import "server-only";

import { requireActivePartner } from "@/lib/auth/authorization";
import { listInclusiveDates } from "@/lib/inventory/rules";
import type { BulkInventoryInput } from "@/lib/inventory/schemas";
import { prisma } from "@/lib/prisma";

export async function bulkUpdateOwnedInventory(roomTypeId: string, input: BulkInventoryInput) {
  const partner = await requireActivePartner();
  const stayDates = listInclusiveDates(input.startDate, input.endDate);
  if (!stayDates) throw new Error("Invalid inventory date range.");

  await prisma.$transaction(async (transaction) => {
    const room = await transaction.roomType.findFirst({
      where: {
        id: roomTypeId,
        archivedAt: null,
        property: {
          archivedAt: null,
          ownerPartnerId: partner.partnerProfile.id,
        },
      },
      select: { id: true, propertyId: true, totalUnits: true },
    });
    if (!room) throw new Error("Room type not found.");

    const existing = await transaction.inventoryDate.findMany({
      where: { roomTypeId: room.id, stayDate: { in: stayDates } },
      select: { stayDate: true, heldUnits: true, bookedUnits: true },
    });
    const requestedUnits = input.totalUnitsOverride === ""
      ? room.totalUnits
      : input.totalUnitsOverride;
    if (existing.some((night) => requestedUnits < night.heldUnits + night.bookedUnits)) {
      throw new Error("Units cannot be lower than existing holds and bookings.");
    }

    for (const stayDate of stayDates) {
      await transaction.inventoryDate.upsert({
        where: { roomTypeId_stayDate: { roomTypeId: room.id, stayDate } },
        create: {
          roomTypeId: room.id,
          stayDate,
          priceOverride: input.priceOverride === "" ? null : input.priceOverride,
          totalUnitsOverride: input.totalUnitsOverride === "" ? null : input.totalUnitsOverride,
          stopSell: input.stopSell,
        },
        update: {
          priceOverride: input.priceOverride === "" ? null : input.priceOverride,
          totalUnitsOverride: input.totalUnitsOverride === "" ? null : input.totalUnitsOverride,
          stopSell: input.stopSell,
        },
      });
    }

    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "INVENTORY_BULK_UPDATED",
        entityType: "ROOM_TYPE",
        entityId: room.id,
        metadata: {
          propertyId: room.propertyId,
          startDate: input.startDate,
          endDate: input.endDate,
          affectedDays: stayDates.length,
          priceOverride: input.priceOverride === "" ? null : input.priceOverride,
          totalUnitsOverride: input.totalUnitsOverride === "" ? null : input.totalUnitsOverride,
          stopSell: input.stopSell,
        },
      },
    });
  }, { isolationLevel: "Serializable" });
}
