import "server-only";

import {
  isBookingStatusTransitionAllowed,
  canActorTransitionBooking,
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
import {
  consumeHeldInventory,
  releaseBookedInventory,
  reserveBookedInventory,
} from "@/lib/inventory/reservations";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { PartnerStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { getBookingPaymentExpiry } from "./payment-window";
import { bookingEmailTopics, enqueueBookingEmail } from "@/lib/notification/events";

function bookingResult(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "bookingId" in value &&
    "bookingCode" in value &&
    typeof value.bookingId === "string" &&
    typeof value.bookingCode === "string"
  ) {
    return { bookingId: value.bookingId, bookingCode: value.bookingCode };
  }
  return null;
}

export async function confirmBookingOnline(
  input: ConfirmBookingInput,
  guestSessionId?: string,
): Promise<{ bookingId: string; bookingCode: string }> {
  const validated = confirmBookingSchema.parse(input);
  const actorUser = await getCurrentUser();
  if (!actorUser || actorUser.role !== UserRole.TRAVELER || actorUser.status !== UserStatus.ACTIVE) {
    throw new Error("You must be signed in as an active Traveler.");
  }

  const quote = await getOwnedQuote(validated.quoteId, {
    userId: actorUser.id,
    guestSessionId,
  });
  if (!quote) throw new Error("Quote not found or access denied.");

  const requestHash = createHash("sha256")
    .update(JSON.stringify({
      actorId: actorUser.id,
      quoteId: validated.quoteId,
      guestName: validated.guestName,
      guestEmail: validated.guestEmail,
      guestPhone: validated.guestPhone,
      specialRequest: validated.specialRequest ?? null,
      agreeCancellationPolicy: validated.agreeCancellationPolicy,
    }))
    .digest("hex");
  const previous = await prisma.idempotencyRecord.findUnique({
    where: {
      scope_key: {
        scope: "CREATE_BOOKING",
        key: validated.idempotencyKey,
      },
    },
    select: { request: true, result: true },
  });
  if (previous) {
    if (previous.request !== requestHash) {
      throw new Error("Idempotency key already used with a different payload.");
    }
    const previousResult = bookingResult(previous.result);
    if (previousResult) return previousResult;
    throw new Error("This booking request is already being processed.");
  }

  if (quote.expiresAt.getTime() <= Date.now()) throw new Error("Quote has expired.");
  if (!quote.hold) throw new Error("Quote is not held. Please create a hold first.");
  const holdId = quote.hold.id;

  const checkin = quote.checkinDate.toISOString().slice(0, 10);
  const checkout = quote.checkoutDate.toISOString().slice(0, 10);
  const stayDates = listStayDates(checkin, checkout);
  if (!stayDates) throw new Error("Invalid stay dates.");

  const bookingCode = generateBookingCode();
  const paymentExpiresAt = getBookingPaymentExpiry();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
    });
    if (existing && existing.request === requestHash) {
      const previousResult = bookingResult(existing.result);
      if (previousResult) return previousResult;
      throw new Error("This booking request is already being processed.");
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
    if (quotedHoldNights.length !== stayDates.length) {
      throw new Error("Held inventory does not cover every stay date.");
    }

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
        propertyName: quote.roomType.property.name,
        roomName: quote.roomType.name,
        guestName: validated.guestName,
        guestEmail: validated.guestEmail,
        guestPhone: validated.guestPhone,
        cancellationPolicy: quote.roomType.property.cancellationPolicy,
        subtotal: quote.subtotal,
        serviceFee: quote.serviceFee,
        grandTotal: quote.grandTotal,
        status: "PENDING_PAYMENT",
        paymentExpiresAt,
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
    await consumeHeldInventory(tx, quotedHoldNights);
    await tx.holdNight.deleteMany({ where: { holdId } });
    await tx.hold.delete({ where: { id: holdId } });
    await tx.quote.update({
      where: { id: quote.id },
      data: { guestSessionId: null, userId: actorUser.id },
    });
    const result = { bookingId: booking.id, bookingCode };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
      data: { result },
    });
    return result;
  }, { isolationLevel: "Serializable" });
}

export async function createBookingManual(
  input: ManualBookingInput
): Promise<{ bookingId: string; bookingCode: string }> {
  const validated = manualBookingSchema.parse(input);
  const actorUser = await getCurrentUser();
  if (
    !actorUser ||
    (actorUser.role !== UserRole.ADMIN &&
      (actorUser.role !== UserRole.PARTNER ||
        actorUser.partnerProfile?.status !== PartnerStatus.ACTIVE))
  ) {
    throw new Error("Only Admin or Partner can create manual bookings.");
  }
  const stayDates = listStayDates(validated.checkinDate, validated.checkoutDate);
  if (!stayDates) throw new Error("Invalid stay dates.");
  const requestHash = createHash("sha256")
    .update(JSON.stringify({
      actorId: actorUser.id,
      roomTypeId: validated.roomTypeId,
      checkinDate: validated.checkinDate,
      checkoutDate: validated.checkoutDate,
      adultCount: validated.adultCount,
      childCount: validated.childCount,
      guestName: validated.guestName,
      guestEmail: validated.guestEmail,
      guestPhone: validated.guestPhone,
      specialRequest: validated.specialRequest ?? null,
      reason: validated.reason,
    }))
    .digest("hex");
  const bookingCode = generateBookingCode();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.idempotencyRecord.findUnique({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
    });
    if (existing && existing.request === requestHash) {
      const previousResult = bookingResult(existing.result);
      if (previousResult) return previousResult;
      throw new Error("This booking request is already being processed.");
    }
    if (existing) throw new Error(`Idempotency key already used with a different payload.`);

    const inventoryDates = stayDates.map((date) => new Date(`${date}T00:00:00.000Z`));
    const { room, inventory } = await reserveBookedInventory(
      tx,
      validated.roomTypeId,
      inventoryDates,
    );
    if (
      actorUser.role === UserRole.PARTNER &&
      actorUser.partnerProfile?.id !== room.property.ownerPartnerId
    ) {
      throw new Error("Cannot create a booking for a room you don't own.");
    }
    if (
      validated.adultCount > room.adultCapacity ||
      validated.childCount > room.childCapacity
    ) {
      throw new Error("Guest count exceeds the room capacity.");
    }

    await tx.idempotencyRecord.create({
      data: { scope: "CREATE_BOOKING", key: validated.idempotencyKey, actorId: actorUser.id, request: requestHash },
    });
    const nightPrices = inventory.map((night) => night.priceOverride ?? room.basePrice);
    const subtotal = nightPrices.reduce((a, b) => a + b, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + serviceFee;
    const booking = await tx.booking.create({
      data: {
        bookingCode,
        roomTypeId: validated.roomTypeId,
        userId: null,
        checkinDate: new Date(`${validated.checkinDate}T00:00:00.000Z`),
        checkoutDate: new Date(`${validated.checkoutDate}T00:00:00.000Z`),
        adultCount: validated.adultCount,
        childCount: validated.childCount,
        propertyName: room.property.name,
        roomName: room.name,
        guestName: validated.guestName,
        guestEmail: validated.guestEmail,
        guestPhone: validated.guestPhone,
        cancellationPolicy: room.property.cancellationPolicy,
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
    await enqueueBookingEmail(tx, {
      bookingId: booking.id,
      topic: bookingEmailTopics.confirmed,
    });
    const result = { bookingId: booking.id, bookingCode };
    await tx.idempotencyRecord.update({
      where: { scope_key: { scope: "CREATE_BOOKING", key: validated.idempotencyKey } },
      data: { result },
    });
    return result;
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
        nights: {
          select: { roomTypeId: true, stayDate: true },
        },
        roomType: { select: { property: { select: { ownerPartnerId: true } } } },
      },
    });
    if (!fetch) throw new Error("Booking not found.");
    const previousStatus = fetch.status as BookingStatus;
    if (!isBookingStatusTransitionAllowed(previousStatus, newStatus)) {
      throw new Error(`Invalid status transition: ${fetch.status} -> ${newStatus}`);
    }
    const actor = actorUser.role === UserRole.PARTNER
      ? {
          role: "PARTNER" as const,
          userId: actorUser.id,
          partnerProfileId: actorUser.partnerProfile?.id ?? null,
          partnerStatus: actorUser.partnerProfile?.status ?? null,
        }
      : actorUser.role === UserRole.ADMIN
        ? { role: "ADMIN" as const, userId: actorUser.id }
        : { role: "TRAVELER" as const, userId: actorUser.id };
    if (!canActorTransitionBooking(
      actor,
      {
        userId: fetch.userId,
        ownerPartnerId: fetch.roomType.property.ownerPartnerId,
      },
      previousStatus,
      newStatus,
    )) {
      throw new Error("You cannot perform this booking status transition.");
    }
    if (
      (newStatus === "CANCELLED" || newStatus === "EXPIRED" || newStatus === "REFUNDED")
    ) {
      await releaseBookedInventory(tx, fetch.nights);
    }
    const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: newStatus } });
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        previousStatus,
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
    if (newStatus === "CANCELLED") {
      await enqueueBookingEmail(tx, {
        bookingId,
        topic: bookingEmailTopics.cancelled,
      });
    }
    return { status: updated.status as BookingStatus };
  }, { isolationLevel: "Serializable" });
}
