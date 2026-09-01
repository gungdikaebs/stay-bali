"use server";

import { confirmBookingSchema } from "@/lib/booking/schemas";
import { confirmBookingOnline } from "@/lib/booking/booking";
import { generateIdempotencyKey } from "@/lib/idempotency";
import type { BookingActionState } from "@/lib/booking/schemas";

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
    const booking = await confirmBookingOnline(result.data);
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
