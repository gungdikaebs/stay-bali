import "server-only";

import { PropertyStatus } from "@/generated/prisma/client";
import { requireActivePartner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function getPartnerOverview() {
  const partner = await requireActivePartner();
  const ownerPartnerId = partner.partnerProfile.id;

  const [totalProperties, publishedProperties, pendingProperties, activeRooms] =
    await Promise.all([
      prisma.property.count({ where: { ownerPartnerId, archivedAt: null } }),
      prisma.property.count({
        where: {
          ownerPartnerId,
          archivedAt: null,
          status: PropertyStatus.PUBLISHED,
        },
      }),
      prisma.property.count({
        where: {
          ownerPartnerId,
          archivedAt: null,
          status: PropertyStatus.PENDING_REVIEW,
        },
      }),
      prisma.roomType.count({
        where: {
          property: { ownerPartnerId },
          archivedAt: null,
          isActive: true,
        },
      }),
    ]);

  return {
    businessName: partner.partnerProfile.businessName,
    totalProperties,
    publishedProperties,
    pendingProperties,
    activeRooms,
  };
}

export async function listOwnedProperties() {
  const partner = await requireActivePartner();

  return prisma.property.findMany({
    where: {
      ownerPartnerId: partner.partnerProfile.id,
      archivedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      area: true,
      status: true,
      updatedAt: true,
      _count: { select: { rooms: true, media: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}
