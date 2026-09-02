import "server-only";

import { BookingStatus, PropertyStatus } from "@/generated/prisma/client";
import { requireActivePartner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function getPartnerOverview() {
  const partner = await requireActivePartner();
  const ownerPartnerId = partner.partnerProfile.id;

  const bookingScope = { roomType: { property: { ownerPartnerId } } };
  const [totalProperties, publishedProperties, pendingProperties, activeRooms, activeReservations, completedStays, bookedValue, recentBookings] =
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
      prisma.booking.count({
        where: {
          ...bookingScope,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        },
      }),
      prisma.booking.count({
        where: { ...bookingScope, status: BookingStatus.COMPLETED },
      }),
      prisma.booking.aggregate({
        where: {
          ...bookingScope,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLATION_REQUESTED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED] },
        },
        _sum: { grandTotal: true },
      }),
      prisma.booking.findMany({
        where: bookingScope,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          bookingCode: true,
          propertyName: true,
          roomName: true,
          guestName: true,
          checkinDate: true,
          checkoutDate: true,
          grandTotal: true,
          status: true,
        },
      }),
    ]);

  return {
    businessName: partner.partnerProfile.businessName,
    totalProperties,
    publishedProperties,
    pendingProperties,
    activeRooms,
    activeReservations,
    completedStays,
    bookedValue: bookedValue._sum.grandTotal ?? 0,
    recentBookings,
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
