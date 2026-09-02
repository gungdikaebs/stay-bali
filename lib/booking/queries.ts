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
    canViewAllVouchers: actor.role === UserRole.ADMIN,
  };
}

export async function getTravelerBooking(bookingId: string) {
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER) return null;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: actor.id,
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
      paymentExpiresAt: true,
      cancellationPolicy: true,
      paymentAttempts: {
        select: {
          providerReference: true,
          amount: true,
          currency: true,
          status: true,
          failureCode: true,
          resolvedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      nights: {
        select: { stayDate: true, unitPrice: true },
        orderBy: { stayDate: "asc" },
      },
    },
  });
  if (!booking) return null;

  return {
    ...booking,
    paymentWindowOpen:
      booking.paymentExpiresAt !== null &&
      booking.paymentExpiresAt.getTime() > new Date().getTime(),
  };
}

export async function getTravelerBookingHistory() {
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER) return [];

  const bookings = await prisma.booking.findMany({
    where: { userId: actor.id },
    select: {
      id: true,
      bookingCode: true,
      propertyName: true,
      roomName: true,
      checkinDate: true,
      checkoutDate: true,
      adultCount: true,
      childCount: true,
      grandTotal: true,
      status: true,
      paymentExpiresAt: true,
      createdAt: true,
      _count: { select: { nights: true } },
      cancellationRequests: {
        select: {
          status: true,
          eligibleForFullRefund: true,
          requestedRefundAmount: true,
          resolutionNote: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const now = new Date().getTime();

  return bookings.map((booking) => ({
    ...booking,
    paymentWindowOpen:
      booking.paymentExpiresAt !== null &&
      booking.paymentExpiresAt.getTime() > now,
  }));
}

export async function getVoucherBooking(bookingId: string) {
  const actor = await getCurrentUser();
  if (!actor || (actor.role !== UserRole.TRAVELER && actor.role !== UserRole.ADMIN)) {
    return null;
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(actor.role === UserRole.TRAVELER ? { userId: actor.id } : {}),
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
      specialRequest: true,
      createdAt: true,
      nights: {
        select: { stayDate: true, unitPrice: true },
        orderBy: { stayDate: "asc" },
      },
      paymentAttempts: {
        where: { status: "SUCCEEDED" },
        select: { providerReference: true, resolvedAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!booking) return null;

  return { ...booking, viewerRole: actor.role };
}
