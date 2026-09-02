"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { simulateBookingPayment } from "@/lib/payment/payment";
import { createCorrelationId, writeLog } from "@/lib/observability/logger";
import {
  simulatePaymentSchema,
  type PaymentActionState,
} from "@/lib/payment/schemas";

export async function simulatePaymentAction(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const parsed = simulatePaymentSchema.safeParse({
    bookingId: formData.get("bookingId"),
    idempotencyKey: formData.get("idempotencyKey"),
    outcome: formData.get("outcome"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Invalid demo payment request." };
  }

  let result;
  try {
    result = await simulateBookingPayment(parsed.data);
  } catch (error) {
    writeLog("error", "demo_payment_action_failed", {
      correlationId: createCorrelationId(),
      bookingId: parsed.data.bookingId,
      error,
    });
    const message = error instanceof Error ? error.message : "";
    const safeMessages = [
      "Booking not found or access denied.",
      "Payment window expired.",
      "This booking is no longer awaiting payment.",
      "Payment key already used with a different request.",
    ];
    return {
      status: "error",
      message: safeMessages.includes(message)
        ? message
        : "The demo payment could not be processed.",
    };
  }

  revalidatePath("/booking/confirmation");
  revalidatePath("/account");
  if (result.bookingStatus === "PAYMENT_FAILED") {
    return {
      status: "declined",
      message: "Demo payment declined. You can retry before the payment window expires.",
      bookingId: result.bookingId,
      attemptReference: result.attemptReference,
      nextIdempotencyKey: generateIdempotencyKey(),
    };
  }
  redirect(`/booking/confirmation?booking=${encodeURIComponent(result.bookingId)}`);
}
