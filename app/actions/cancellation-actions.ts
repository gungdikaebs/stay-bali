"use server";

import { revalidatePath } from "next/cache";
import {
  cancelManualBooking,
  confirmStandardCancellation,
  requestCancellationException,
  requestPartnerCancellation,
  resolveCancellationRequest,
} from "@/lib/cancellation/cancellation";
import {
  cancelManualBookingSchema,
  requestCancellationExceptionSchema,
  requestPartnerCancellationSchema,
  resolveCancellationSchema,
  standardCancellationSchema,
  type CancellationActionState,
} from "@/lib/cancellation/schemas";
import { generateIdempotencyKey } from "@/lib/idempotency";

function refreshCancellationViews() {
  revalidatePath("/account");
  revalidatePath("/partner");
  revalidatePath("/partner/bookings");
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const safe = [
    "Booking not found or access denied.",
    "Only a confirmed booking can be cancelled.",
    "This booking can be cancelled automatically with a full refund.",
    "Cancellation key already used with a different request.",
    "Cancellation request is no longer pending.",
    "Booking is no longer awaiting a cancellation decision.",
    "Cancellation request not found or access denied.",
  ];
  return safe.includes(message) ? message : "The cancellation action could not be completed.";
}

export async function confirmStandardCancellationAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = standardCancellationSchema.safeParse({
    bookingId: formData.get("bookingId"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) return { status: "error", message: "Invalid cancellation request." };
  try {
    const result = await confirmStandardCancellation(parsed.data);
    refreshCancellationViews();
    return {
      status: "success",
      message: result.status === "REFUNDED"
        ? "Booking cancelled and the demo refund was completed."
        : "Booking cancelled under the displayed no-refund terms.",
    };
  } catch (error) {
    return { status: "error", message: safeError(error) };
  }
}

export async function requestCancellationExceptionAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = requestCancellationExceptionSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reason: formData.get("reason"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the exception reason.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await requestCancellationException(parsed.data);
    refreshCancellationViews();
    return { status: "success", message: "Exception request sent to the property Partner." };
  } catch (error) {
    return { status: "error", message: safeError(error) };
  }
}

export async function requestPartnerCancellationAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = requestPartnerCancellationSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reason: formData.get("reason"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the cancellation reason.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await requestPartnerCancellation(parsed.data);
    refreshCancellationViews();
    return { status: "success", message: "Cancellation request escalated to StayBali operations." };
  } catch (error) {
    return { status: "error", message: safeError(error) };
  }
}

export async function cancelManualBookingAction(
  _previousState: CancellationActionState,
  formData: FormData,
): Promise<CancellationActionState> {
  const parsed = cancelManualBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reason: formData.get("reason"),
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the cancellation reason.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await cancelManualBooking(parsed.data);
    refreshCancellationViews();
    return { status: "success", message: "Manual reservation cancelled and inventory released." };
  } catch (error) {
    return { status: "error", message: safeError(error) };
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
    idempotencyKey: formData.get("idempotencyKey") || generateIdempotencyKey(),
  });
  if (!parsed.success) {
    return { status: "error", message: "Review the resolution details.", errors: parsed.error.flatten().fieldErrors };
  }
  try {
    const result = await resolveCancellationRequest(parsed.data);
    refreshCancellationViews();
    return { status: "success", message: `Cancellation resolved. Booking is now ${result.status.toLowerCase().replaceAll("_", " ")}.` };
  } catch (error) {
    return { status: "error", message: safeError(error) };
  }
}
