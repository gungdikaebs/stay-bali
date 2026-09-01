import "server-only";

import { PartnerStatus, UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

async function requireBookingOperator() {
  const actor = await getCurrentUser();
  if (!actor) throw new Error("Unauthorized.");

  if (actor.role === UserRole.ADMIN) return actor;
  if (
    actor.role === UserRole.PARTNER &&
    actor.partnerProfile?.status === PartnerStatus.ACTIVE
  ) {
    return actor;
  }
  throw new Error("Unauthorized.");
}

export async function getBookingOperationsWorkspace() {
  const actor = await requireBookingOperator();
  const partnerId = actor.role === UserRole.PARTNER
    ? actor.partnerProfile!.id
    : null;
  const [rooms, bookings] = await Promise.all([
    prisma.roomType.findMany({
      where: {
        archivedAt: null,
        isActive: true,
        property: {
          ...(partnerId ? { ownerPartnerId: partnerId } : {}),
          archivedAt: null,
          status: "PUBLISHED",
        },
      },
      select: {
        id: true,
        name: true,
        adultCapacity: true,
        childCapacity: true,
        basePrice: true,
        property: { select: { name: true, area: true } },
      },
      orderBy: [
        { property: { name: "asc" } },
        { name: "asc" },
      ],
    }),
    prisma.booking.findMany({
      where: partnerId
        ? { roomType: { property: { ownerPartnerId: partnerId } } }
        : {},
      select: {
        id: true,
        bookingCode: true,
        propertyName: true,
        roomName: true,
        guestName: true,
        guestEmail: true,
        checkinDate: true,
        checkoutDate: true,
        adultCount: true,
        childCount: true,
        grandTotal: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    rooms,
    bookings,
  };
}

export async function getOwnedBooking(bookingId: string) {
  const actor = await getCurrentUser();
  if (!actor) return null;

  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(actor.role === UserRole.ADMIN
        ? {}
        : actor.role === UserRole.TRAVELER
          ? { userId: actor.id }
          : actor.role === UserRole.PARTNER &&
              actor.partnerProfile?.status === PartnerStatus.ACTIVE
            ? {
                roomType: {
                  property: { ownerPartnerId: actor.partnerProfile.id },
                },
              }
            : { id: "__not_authorized__" }),
    },
    select: {
      id: true,
      bookingCode: true,
      propertyName: true,
      roomName: true,
      guestName: true,
      guestEmail: true,
      guestPhone: true,
      checkinDate: true,
      checkoutDate: true,
      adultCount: true,
      childCount: true,
      subtotal: true,
      serviceFee: true,
      grandTotal: true,
      status: true,
      cancellationPolicy: true,
      nights: {
        select: { stayDate: true, unitPrice: true },
        orderBy: { stayDate: "asc" },
      },
    },
  });
}
