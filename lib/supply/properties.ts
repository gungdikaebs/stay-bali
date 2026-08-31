import "server-only";

import { randomUUID } from "node:crypto";
import type { Prisma, PropertyStatus } from "@/generated/prisma/client";
import { requireActivePartner, requireOwnedProperty } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import {
  canPartnerEditProperty,
  canSubmitProperty,
  getSubmissionIssues,
  slugifyPropertyName,
  statusAfterMaterialPartnerEdit,
} from "@/lib/supply/rules";
import type { PropertyFormInput, RoomFormInput } from "@/lib/supply/schemas";

async function assertFacilitiesExist(
  facilityIds: string[],
  client: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const count = await client.facility.count({ where: { id: { in: facilityIds } } });
  if (count !== facilityIds.length) throw new Error("One or more facilities are invalid.");
}

async function recordTransition(
  transaction: Prisma.TransactionClient,
  input: {
    actorId: string;
    propertyId: string;
    previousState: PropertyStatus;
    nextState: PropertyStatus;
    note?: string;
  },
) {
  if (input.previousState === input.nextState) return;
  await transaction.propertyReview.create({
    data: {
      reviewerId: input.actorId,
      propertyId: input.propertyId,
      previousState: input.previousState,
      nextState: input.nextState,
      note: input.note,
    },
  });
}

async function transitionAfterMaterialEdit(
  transaction: Prisma.TransactionClient,
  property: { id: string; status: PropertyStatus },
  actorId: string,
) {
  const nextStatus = statusAfterMaterialPartnerEdit(property.status);
  if (nextStatus === property.status) return nextStatus;

  await transaction.property.update({
    where: { id: property.id },
    data: { status: nextStatus },
  });
  await recordTransition(transaction, {
    actorId,
    propertyId: property.id,
    previousState: property.status,
    nextState: nextStatus,
    note: "Material supply details changed by Partner.",
  });
  return nextStatus;
}

export async function listSupplyFacilities() {
  await requireActivePartner();
  return prisma.facility.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createOwnedProperty(input: PropertyFormInput) {
  const partner = await requireActivePartner();
  const slugBase = slugifyPropertyName(input.name) || "stay";
  const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

  return prisma.$transaction(async (transaction) => {
    await assertFacilitiesExist(input.facilityIds, transaction);
    const property = await transaction.property.create({
      data: {
        ownerPartnerId: partner.partnerProfile.id,
        name: input.name,
        slug,
        type: input.type,
        description: input.description,
        area: input.area,
        address: input.address,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        cancellationPolicy: input.cancellationPolicy,
        facilities: {
          create: input.facilityIds.map((facilityId) => ({ facilityId })),
        },
      },
      select: { id: true },
    });

    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "PROPERTY_CREATED",
        entityType: "PROPERTY",
        entityId: property.id,
      },
    });
    return property;
  });
}

export async function getOwnedPropertyWorkspace(propertyId: string) {
  await requireOwnedProperty(propertyId);

  const [property, facilities] = await Promise.all([
    prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        description: true,
        area: true,
        address: true,
        checkInTime: true,
        checkOutTime: true,
        cancellationPolicy: true,
        facilities: { select: { facilityId: true, facility: { select: { name: true } } } },
        rooms: {
          where: { archivedAt: null },
          select: {
            id: true,
            name: true,
            description: true,
            adultCapacity: true,
            childCapacity: true,
            bedType: true,
            sizeSqm: true,
            basePrice: true,
            totalUnits: true,
            isActive: true,
            facilities: { select: { facilityId: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        media: {
          where: { media: { status: "READY" } },
          select: { mediaId: true, isCover: true, media: { select: { altText: true } } },
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          select: { id: true, previousState: true, nextState: true, note: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.facility.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!property) throw new Error("Property not found.");
  const submissionIssues = getSubmissionIssues({
    facilityCount: property.facilities.length,
    readyMediaCount: property.media.length,
    activeRoomCount: property.rooms.filter((room) => room.isActive).length,
  });

  return {
    property,
    facilities,
    submissionIssues,
    canEdit: canPartnerEditProperty(property.status),
    canSubmit: canSubmitProperty(property.status) && submissionIssues.length === 0,
  };
}

export async function updateOwnedProperty(propertyId: string, input: PropertyFormInput) {
  const { partner } = await requireOwnedProperty(propertyId);

  await prisma.$transaction(async (transaction) => {
    const property = await transaction.property.findFirst({
      where: { id: propertyId, ownerPartnerId: partner.partnerProfile.id },
      select: { id: true, status: true },
    });
    if (!property || !canPartnerEditProperty(property.status)) {
      throw new Error("Property cannot be edited in its current state.");
    }

    await assertFacilitiesExist(input.facilityIds, transaction);
    const nextStatus = statusAfterMaterialPartnerEdit(property.status);
    await transaction.property.update({
      where: { id: property.id },
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        area: input.area,
        address: input.address,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        cancellationPolicy: input.cancellationPolicy,
        status: nextStatus,
        facilities: {
          deleteMany: {},
          create: input.facilityIds.map((facilityId) => ({ facilityId })),
        },
      },
    });
    await recordTransition(transaction, {
      actorId: partner.id,
      propertyId: property.id,
      previousState: property.status,
      nextState: nextStatus,
      note: "Material property details changed by Partner.",
    });
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "PROPERTY_UPDATED",
        entityType: "PROPERTY",
        entityId: property.id,
        metadata: { previousStatus: property.status, nextStatus },
      },
    });
  });
}

export async function createOwnedRoom(propertyId: string, input: RoomFormInput) {
  const { partner, property } = await requireOwnedProperty(propertyId);
  if (!canPartnerEditProperty(property.status)) {
    throw new Error("Property cannot be edited in its current state.");
  }

  await prisma.$transaction(async (transaction) => {
    await assertFacilitiesExist(input.facilityIds, transaction);
    const room = await transaction.roomType.create({
      data: {
        propertyId,
        name: input.name,
        description: input.description,
        adultCapacity: input.adultCapacity,
        childCapacity: input.childCapacity,
        bedType: input.bedType,
        sizeSqm: input.sizeSqm === "" ? null : input.sizeSqm,
        basePrice: input.basePrice,
        totalUnits: input.totalUnits,
        facilities: { create: input.facilityIds.map((facilityId) => ({ facilityId })) },
      },
      select: { id: true },
    });
    await transitionAfterMaterialEdit(transaction, property, partner.id);
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "ROOM_CREATED",
        entityType: "ROOM_TYPE",
        entityId: room.id,
        metadata: { propertyId },
      },
    });
  });
}

export async function updateOwnedRoom(roomId: string, input: RoomFormInput) {
  const partner = await requireActivePartner();

  await prisma.$transaction(async (transaction) => {
    const room = await transaction.roomType.findFirst({
      where: { id: roomId, property: { ownerPartnerId: partner.partnerProfile.id } },
      select: { id: true, property: { select: { id: true, status: true } } },
    });
    if (!room || !canPartnerEditProperty(room.property.status)) {
      throw new Error("Room cannot be edited.");
    }
    await assertFacilitiesExist(input.facilityIds, transaction);
    await transaction.roomType.update({
      where: { id: room.id },
      data: {
        name: input.name,
        description: input.description,
        adultCapacity: input.adultCapacity,
        childCapacity: input.childCapacity,
        bedType: input.bedType,
        sizeSqm: input.sizeSqm === "" ? null : input.sizeSqm,
        basePrice: input.basePrice,
        totalUnits: input.totalUnits,
        facilities: {
          deleteMany: {},
          create: input.facilityIds.map((facilityId) => ({ facilityId })),
        },
      },
    });
    await transitionAfterMaterialEdit(transaction, room.property, partner.id);
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "ROOM_UPDATED",
        entityType: "ROOM_TYPE",
        entityId: room.id,
        metadata: { propertyId: room.property.id },
      },
    });
  });
}

export async function archiveOwnedRoom(roomId: string) {
  const partner = await requireActivePartner();
  await prisma.$transaction(async (transaction) => {
    const room = await transaction.roomType.findFirst({
      where: { id: roomId, property: { ownerPartnerId: partner.partnerProfile.id } },
      select: { id: true, archivedAt: true, property: { select: { id: true, status: true } } },
    });
    if (!room || room.archivedAt || !canPartnerEditProperty(room.property.status)) {
      throw new Error("Room cannot be archived.");
    }
    await transaction.roomType.update({
      where: { id: room.id },
      data: { isActive: false, archivedAt: new Date() },
    });
    await transitionAfterMaterialEdit(transaction, room.property, partner.id);
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "ROOM_ARCHIVED",
        entityType: "ROOM_TYPE",
        entityId: room.id,
        metadata: { propertyId: room.property.id },
      },
    });
  });
}

export async function archiveOwnedProperty(propertyId: string) {
  const { partner } = await requireOwnedProperty(propertyId);

  await prisma.$transaction(async (transaction) => {
    const property = await transaction.property.findFirst({
      where: {
        id: propertyId,
        ownerPartnerId: partner.partnerProfile.id,
        archivedAt: null,
      },
      select: { id: true, status: true },
    });
    if (!property || !canPartnerEditProperty(property.status)) {
      throw new Error("Property cannot be archived in its current state.");
    }

    const archivedAt = new Date();
    await transaction.property.update({
      where: { id: property.id },
      data: { archivedAt },
    });
    await transaction.roomType.updateMany({
      where: { propertyId: property.id, archivedAt: null },
      data: { isActive: false, archivedAt },
    });
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "PROPERTY_ARCHIVED",
        entityType: "PROPERTY",
        entityId: property.id,
        metadata: { previousStatus: property.status },
      },
    });
  });
}

export async function submitOwnedProperty(propertyId: string) {
  const { partner } = await requireOwnedProperty(propertyId);

  await prisma.$transaction(async (transaction) => {
    const property = await transaction.property.findFirst({
      where: { id: propertyId, ownerPartnerId: partner.partnerProfile.id },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            facilities: true,
            media: { where: { media: { status: "READY" } } },
            rooms: { where: { isActive: true, archivedAt: null } },
          },
        },
      },
    });
    if (!property || !canSubmitProperty(property.status)) {
      throw new Error("Property cannot be submitted in its current state.");
    }
    const issues = getSubmissionIssues({
      facilityCount: property._count.facilities,
      readyMediaCount: property._count.media,
      activeRoomCount: property._count.rooms,
    });
    if (issues.length) throw new Error(issues.join(" "));

    await transaction.property.update({
      where: { id: property.id },
      data: { status: "PENDING_REVIEW" },
    });
    await recordTransition(transaction, {
      actorId: partner.id,
      propertyId: property.id,
      previousState: property.status,
      nextState: "PENDING_REVIEW",
      note: "Submitted by Partner for Admin review.",
    });
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "PROPERTY_SUBMITTED",
        entityType: "PROPERTY",
        entityId: property.id,
      },
    });
  });
}
