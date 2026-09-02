"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  confirmBookingSchema,
  manualBookingSchema,
  operationalBookingTransitionSchema,
} from "@/lib/booking/schemas";
import {
  confirmBookingOnline,
  createBookingManual,
  transitionBookingStatus,
} from "@/lib/booking/booking";
import { createHold } from "@/lib/hold/hold";
import { generateIdempotencyKey } from "@/lib/idempotency";
import type {
  BookingActionState,
  OperationalBookingActionState,
} from "@/lib/booking/schemas";

export async function confirmBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    quoteId: formData.get("quoteId") as string,
    guestName: formData.get("guestName") as string,
    guestEmail: formData.get("guestEmail") as string,
    guestPhone: formData.get("guestPhone") as string,
    specialRequest: (formData.get("specialRequest") as string) || undefined,
    agreeCancellationPolicy: formData.get("agreeCancellationPolicy") === "true" ? true : undefined,
    idempotencyKey: (formData.get("idempotencyKey") as string) || generateIdempotencyKey(),
  };

  const result = confirmBookingSchema.safeParse(raw);
  if (!result.success) {
    return {
      status: "error",
      message: "Validation failed. Please check your input.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const guestSessionId = (await cookies()).get("staybali_guest_session")?.value;
    let booking;
    try {
      booking = await confirmBookingOnline(result.data, guestSessionId);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== "Quote is not held. Please create a hold first."
      ) {
        throw error;
      }
      const hold = await createHold({
        quoteId: result.data.quoteId,
        adultCount: Number(formData.get("adultCount") ?? 1),
        childCount: Number(formData.get("childCount") ?? 0),
        specialRequest: result.data.specialRequest,
      }, guestSessionId);
      if (!hold.success) {
        return { status: "error", message: hold.error };
      }
      booking = await confirmBookingOnline(result.data, guestSessionId);
    }
    return {
      status: "success",
      message: "Booking confirmed successfully! Redirecting to payment...",
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to create booking.",
    };
  }
}

export async function createManualBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const result = manualBookingSchema.safeParse({
    roomTypeId: formData.get("roomTypeId"),
    checkinDate: formData.get("checkinDate"),
    checkoutDate: formData.get("checkoutDate"),
    adultCount: formData.get("adultCount"),
    childCount: formData.get("childCount"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    guestPhone: formData.get("guestPhone"),
    specialRequest: formData.get("specialRequest") || undefined,
    reason: formData.get("reason"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!result.success) {
    return {
      status: "error",
      message: "Review the highlighted reservation details.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const booking = await createBookingManual(result.data);
    revalidatePath("/partner/bookings");
    revalidatePath("/admin/bookings");
    revalidatePath("/partner");
    revalidatePath("/admin");
    return {
      status: "success",
      message: "Manual reservation created.",
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safeMessages = [
      "This stay is no longer available for the selected dates.",
      "Guest count exceeds the room capacity.",
      "Cannot create a booking for a room you don't own.",
      "Room type is no longer available.",
      "This booking request is already being processed.",
    ];
    return {
      status: "error",
      message: safeMessages.includes(message)
        ? message
        : "The manual reservation could not be created.",
    };
  }
}

export async function transitionBookingOperationAction(
  _previousState: OperationalBookingActionState,
  formData: FormData,
): Promise<OperationalBookingActionState> {
  const parsed = operationalBookingTransitionSchema.safeParse({
    bookingId: formData.get("bookingId"),
    nextStatus: formData.get("nextStatus"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid reservation operation." };
  }

  try {
    await transitionBookingStatus(
      parsed.data.bookingId,
      parsed.data.nextStatus,
      parsed.data.nextStatus === "CHECKED_IN"
        ? "Guest arrival confirmed by an authorized operator."
        : "Stay completion confirmed by an authorized operator.",
    );
    revalidatePath("/partner/bookings");
    revalidatePath("/admin/bookings");
    revalidatePath("/partner");
    revalidatePath("/admin");
    revalidatePath("/account");
    return {
      status: "success",
      message: parsed.data.nextStatus === "CHECKED_IN"
        ? "Guest checked in successfully."
        : "Stay marked as completed.",
    };
  } catch {
    return {
      status: "error",
      message: "This reservation is no longer eligible for that operation.",
    };
  }
}
