"use server";

import { revalidatePath } from "next/cache";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { requestBookingCancellation, resolveCancellationRequest } from "@/lib/cancellation/cancellation";
import {
  requestCancellationSchema,
  resolveCancellationSchema,
  type CancellationActionState,
} from "@/lib/cancellation/schemas";

export async function requestCancellationAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = requestCancellationSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reason: formData.get("reason"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the cancellation reason.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await requestBookingCancellation(parsed.data);
    revalidatePath("/account");
    revalidatePath("/admin/bookings");
    return { status: "success", message: "Cancellation request sent for Admin review." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = ["Booking not found or access denied.", "Only a confirmed booking can be cancelled.", "Cancellation key already used with a different request."];
    return { status: "error", message: safe.includes(message) ? message : "Cancellation request could not be submitted." };
  }
}

export async function resolveCancellationAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = resolveCancellationSchema.safeParse({
    cancellationRequestId: formData.get("cancellationRequestId"),
    decision: formData.get("decision"),
    resolutionNote: formData.get("resolutionNote"),
    refundReference: formData.get("refundReference") || undefined,
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the resolution details.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    const result = await resolveCancellationRequest(parsed.data);
    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    revalidatePath("/bookings");
    return { status: "success", message: `Cancellation resolved. Booking is now ${result.status.toLowerCase().replaceAll("_", " ")}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = [
      "Cancellation request is no longer pending.",
      "Booking is no longer awaiting a cancellation decision.",
      "A manual refund reference is required for a full refund.",
      "Resolution key already used with a different request.",
    ];
    return { status: "error", message: safe.includes(message) ? message : "Cancellation resolution could not be saved." };
  }
}
