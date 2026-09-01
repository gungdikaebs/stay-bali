import "server-only";

import { calculateStayPrice, listStayDates } from "@/lib/inventory/rules";
import { prisma } from "@/lib/prisma";

type QuoteOwner = { userId: string; guestSessionId?: never } | { userId?: never; guestSessionId: string };

export async function createQuote(input: QuoteOwner & {
  slug: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
}) {
  const stayDates = listStayDates(input.checkin, input.checkout);
  if (!stayDates) throw new Error("Choose a valid stay of 1 to 30 nights.");

  const rooms = await prisma.roomType.findMany({
    where: {
      archivedAt: null,
      isActive: true,
      adultCapacity: { gte: input.adults },
      childCapacity: { gte: input.children },
      property: { slug: input.slug, status: "PUBLISHED", archivedAt: null },
    },
    select: {
      id: true,
      basePrice: true,
      totalUnits: true,
      inventory: {
        where: {
          stayDate: {
            gte: new Date(`${input.checkin}T00:00:00.000Z`),
            lt: new Date(`${input.checkout}T00:00:00.000Z`),
          },
        },
        select: {
          stayDate: true,
          priceOverride: true,
          totalUnitsOverride: true,
          heldUnits: true,
          bookedUnits: true,
          stopSell: true,
        },
      },
    },
  });

  const available = rooms.flatMap((room) => {
    const pricing = calculateStayPrice({
      checkin: input.checkin,
      checkout: input.checkout,
      basePrice: room.basePrice,
      totalUnits: room.totalUnits,
      inventory: room.inventory,
    });
    return pricing ? [{ room, pricing }] : [];
  }).sort((left, right) => left.pricing.grandTotal - right.pricing.grandTotal)[0];
  if (!available) throw new Error("This stay is no longer available for the selected dates.");

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return prisma.$transaction(async (transaction) => {
    const quote = await transaction.quote.create({
      data: {
        roomTypeId: available.room.id,
        userId: input.userId,
        guestSessionId: input.guestSessionId,
        checkinDate: new Date(`${input.checkin}T00:00:00.000Z`),
        checkoutDate: new Date(`${input.checkout}T00:00:00.000Z`),
        adultCount: input.adults,
        childCount: input.children,
        subtotal: available.pricing.subtotal,
        serviceFee: available.pricing.serviceFee,
        grandTotal: available.pricing.grandTotal,
        expiresAt,
        nights: {
          create: available.pricing.nightlyRates.map((night) => ({
            stayDate: new Date(`${night.stayDate}T00:00:00.000Z`),
            unitPrice: night.price,
          })),
        },
      },
      select: { id: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: input.userId ?? null,
        action: "QUOTE_CREATED",
        entityType: "QUOTE",
        entityId: quote.id,
        metadata: { roomTypeId: available.room.id, expiresAt: expiresAt.toISOString() },
      },
    });
    return quote;
  });
}

export async function getOwnedQuote(
  quoteId: string,
  owner: { userId?: string; guestSessionId?: string },
) {
  const owners = [
    owner.userId ? { userId: owner.userId } : null,
    owner.guestSessionId ? { guestSessionId: owner.guestSessionId } : null,
  ].filter((value): value is { userId: string } | { guestSessionId: string } => value !== null);
  if (!owners.length) return null;

  return prisma.quote.findFirst({
    where: { id: quoteId, OR: owners },
    select: {
      id: true,
      checkinDate: true,
      checkoutDate: true,
      adultCount: true,
      childCount: true,
      subtotal: true,
      serviceFee: true,
      grandTotal: true,
      expiresAt: true,
      nights: { select: { stayDate: true, unitPrice: true }, orderBy: { stayDate: "asc" } },
      roomType: {
        select: {
          name: true,
          property: {
            select: {
              name: true,
              slug: true,
              area: true,
              media: {
                where: { media: { status: "READY" } },
                select: { mediaId: true },
                orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}
