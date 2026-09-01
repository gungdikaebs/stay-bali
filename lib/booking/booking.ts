import "server-only";

import {
  isBookingStatusTransitionAllowed,
  generateBookingCode,
  type BookingStatus,
} from "./rules";
import {
  confirmBookingSchema,
  manualBookingSchema,
  type ConfirmBookingInput,
  type ManualBookingInput,
} from "./schemas";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getOwnedQuote } from "@/lib/quote/quotes";
import { listStayDates } from "@/lib/inventory/rules";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { UserRole, UserStatus } from "@/generated/prisma/client";

export async function confirmBookingOnline(
  input: ConfirmBookingInput
): Promise<{ bookingId: string; bookingCode: string }> {
  const validated = confirmBookingSchema.parse(input);
  const actorUser = await getCurrentUser();
  if (!actorUser || actorUser.role !== UserRole.TRAVELER || actorUser.status !== UserStatus.ACTIVE) {
    throw new Error("You must be signed in as an active Traveler.");
  }

  const quote = await getOwnedQuote(validated.quoteId, { userId: actorUser.id });
  if (!quote) throw new Error("Quote not found or access denied.");
  if (quote.expiresAt.getTime() <= Date.now()) throw new Error("Quote has expired.");
  if (!quote.hold) throw new Error("Quote is not held. Please create a hold first.");
  const holdId = quote.hold.id;

  const checkin = quote.checkinDate.toISOString().slice(0, 10);
  const checkout = quote.checkoutDate.toISOString().slice(0, 10);
  const stayDates = listStayDates(checkin, checkout);
  if (!stayDates) throw new Error("Invalid stay dates.");

  const requestHash = createHash("sha256")
    .update(`${validated.quoteId}|${validated.guestName}|${validated.guestEmail}|${actorUser.id}`)
    .digest("hex");

  const bookingCode = generateBookingCode();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
    });
    if (existing && existing.request === requestHash) {
      throw new Error(`A booking for this request already exists (key: ${validated.idempotencyKey}).`);
    }
    if (existing) throw new Error(`Idempotency key already used with a different payload.`);

    const quotedHoldNights = await tx.holdNight.findMany({
      where: {
        holdId,
        stayDate: { gte: new Date(`${checkin}T00:00:00.000Z`), lt: new Date(`${checkout}T00:00:00.000Z`) },
      },
      orderBy: [{ roomTypeId: "asc" }, { stayDate: "asc" }],
    });
    if (quotedHoldNights.length === 0) throw new Error("No hold nights found for this quote.");

    await tx.idempotencyRecord.create({
      data: { scope: "CREATE_BOOKING", key: validated.idempotencyKey, actorId: actorUser.id, request: requestHash },
    });

    const booking = await tx.booking.create({
      data: {
        bookingCode,
        roomTypeId: quote.roomType.id,
        userId: actorUser.id,
        checkinDate: new Date(`${checkin}T00:00:00.000Z`),
        checkoutDate: new Date(`${checkout}T00:00:00.000Z`),
        adultCount: quote.adultCount,
        childCount: quote.childCount,
        subtotal: quote.subtotal,
        serviceFee: quote.serviceFee,
        grandTotal: quote.grandTotal,
        status: "PENDING_PAYMENT",
        specialRequest: validated.specialRequest,
      },
    });
    await tx.bookingNight.createMany({
      data: quotedHoldNights.map((night) => ({
        bookingId: booking.id,
        roomTypeId: night.roomTypeId,
        stayDate: night.stayDate,
        unitPrice:
          quote.nights.find((q) => q.stayDate.toISOString().slice(0, 10) === night.stayDate.toISOString().slice(0, 10))?.unitPrice ?? 0,
      })),
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "PENDING_PAYMENT",
        nextStatus: "PENDING_PAYMENT",
        actorId: actorUser.id,
        note: `Booking created from quote ${quote.id}.`,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorUser.id,
        action: "BOOKING_CONFIRMED_ONLINE",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: {
          quoteId: quote.id,
          holdId,
          guest: { name: validated.guestName, email: validated.guestEmail, phone: validated.guestPhone },
        },
      },
    });
    await tx.quote.update({
      where: { id: quote.id },
      data: { hold: { disconnect: true }, guestSessionId: null, userId: actorUser.id },
    });
    await tx.holdNight.deleteMany({ where: { holdId } });
    await tx.hold.delete({ where: { id: holdId } });
    return { bookingId: booking.id, bookingCode };
  }, { isolationLevel: "Serializable" });
}

export async function createBookingManual(
  input: ManualBookingInput
): Promise<{ bookingId: string; bookingCode: string }> {
  const validated = manualBookingSchema.parse(input);
  const actorUser = await getCurrentUser();
  if (!actorUser || (actorUser.role !== UserRole.ADMIN && actorUser.role !== UserRole.PARTNER)) {
    throw new Error("Only Admin or Partner can create manual bookings.");
  }
  const stayDates = listStayDates(validated.checkinDate, validated.checkoutDate);
  if (!stayDates) throw new Error("Invalid stay dates.");
  const requestHash = createHash("sha256")
    .update(`${validated.roomTypeId}|${validated.guestEmail}|${actorUser.id}`)
    .digest("hex");
  const bookingCode = generateBookingCode();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
    });
    if (existing && existing.request === requestHash) {
      throw new Error(`A booking for this request already exists (key: ${validated.idempotencyKey}).`);
    }
    if (existing) throw new Error(`Idempotency key already used with a different payload.`);
    await tx.idempotencyRecord.create({
      data: { scope: "CREATE_BOOKING", key: validated.idempotencyKey, actorId: actorUser.id, request: requestHash },
    });
    const nightPrices = stayDates.map(() => Math.floor(Math.random() * 5000) + 500000);
    const subtotal = nightPrices.reduce((a, b) => a + b, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + serviceFee;
    const booking = await tx.booking.create({
      data: {
        bookingCode,
        roomTypeId: validated.roomTypeId,
        userId: actorUser.id,
        checkinDate: new Date(`${validated.checkinDate}T00:00:00.000Z`),
        checkoutDate: new Date(`${validated.checkoutDate}T00:00:00.000Z`),
        adultCount: validated.adultCount,
        childCount: validated.childCount,
        subtotal,
        serviceFee,
        grandTotal,
        status: "CONFIRMED",
        specialRequest: validated.specialRequest,
      },
    });
    await tx.bookingNight.createMany({
      data: stayDates.map((d, i) => ({
        bookingId: booking.id,
        roomTypeId: validated.roomTypeId,
        stayDate: new Date(d),
        unitPrice: nightPrices[i] ?? 500000,
      })),
    });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        previousStatus: "PENDING_PAYMENT",
        nextStatus: "CONFIRMED",
        actorId: actorUser.id,
        note: `Manual booking created by ${actorUser.name}. Reason: ${validated.reason}`,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorUser.id,
        action: "BOOKING_CREATED_MANUAL",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: {
          roomTypeId: validated.roomTypeId,
          reason: validated.reason,
          guest: { name: validated.guestName, email: validated.guestEmail },
        },
      },
    });
    return { bookingId: booking.id, bookingCode };
  }, { isolationLevel: "Serializable" });
}

export async function transitionBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  reason?: string
): Promise<{ status: BookingStatus }> {
  const actorUser = await getCurrentUser();
  if (!actorUser) throw new Error("Unauthorized: no actor provided.");
  return prisma.$transaction(async (tx) => {
    const fetch = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomType: { select: { property: { select: { ownerPartnerId: true } } } },
      },
    });
    if (!fetch) throw new Error("Booking not found.");
    if (actorUser.role === UserRole.PARTNER && (actorUser as unknown as { partnerProfile?: { id: string } }).partnerProfile?.id !== fetch.roomType.property.ownerPartnerId) {
      throw new Error("Cannot modify booking you don't own.");
    }
    if (fetch.status !== newStatus) {
      if (!isBookingStatusTransitionAllowed(fetch.status as BookingStatus, newStatus)) {
        throw new Error(`Invalid status transition: ${fetch.status} -> ${newStatus}`);
      }
    }
    const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: newStatus } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus: fetch.status as BookingStatus,
        nextStatus: newStatus,
        actorId: actorUser.id,
        note: reason ? `${newStatus}. ${reason}` : newStatus,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: actorUser.id,
        action: "BOOKING_STATUS_CHANGED",
        entityType: "BOOKING",
        entityId: bookingId,
        metadata: { from: fetch.status, to: newStatus, reason },
      },
    });
    return { status: updated.status as BookingStatus };
  }, { isolationLevel: "Serializable" });
}
