import "server-only";

import { BookingStatus, PartnerStatus, PropertyStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  await requireAdmin();

  const [
    activePartners,
    pendingPartners,
    pendingProperties,
    publishedProperties,
    activeRooms,
    activeReservations,
    paymentFailures,
    pendingCancellations,
    failedJobs,
    grossBookingValue,
    recentBookings,
    recentAudits,
  ] = await Promise.all([
    prisma.partnerProfile.count({ where: { status: PartnerStatus.ACTIVE } }),
    prisma.partnerProfile.count({ where: { status: PartnerStatus.PENDING } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING_REVIEW, archivedAt: null } }),
    prisma.property.count({ where: { status: PropertyStatus.PUBLISHED, archivedAt: null } }),
    prisma.roomType.count({ where: { isActive: true, archivedAt: null } }),
    prisma.booking.count({ where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } } }),
    prisma.booking.count({ where: { status: BookingStatus.PAYMENT_FAILED } }),
    prisma.cancellationRequest.count({ where: { status: "PENDING" } }),
    prisma.emailDelivery.count({ where: { status: "FAILED" } }),
    prisma.booking.aggregate({
      where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLATION_REQUESTED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED] } },
      _sum: { grandTotal: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        bookingCode: true,
        propertyName: true,
        guestName: true,
        grandTotal: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
    }),
  ]);

  return {
    activePartners,
    pendingPartners,
    pendingProperties,
    publishedProperties,
    activeRooms,
    activeReservations,
    paymentFailures,
    pendingCancellations,
    failedJobs,
    grossBookingValue: grossBookingValue._sum.grandTotal ?? 0,
    attentionCount: pendingPartners + pendingProperties + paymentFailures + pendingCancellations + failedJobs,
    recentBookings,
    recentAudits,
  };
}
