import { z } from "zod";

const bookingId = z.string().trim().min(1).max(30);
const idempotencyKey = z.string().trim().min(16).max(64);
const reason = z.string().trim().min(10, "Please provide at least 10 characters.").max(500);

export const standardCancellationSchema = z.object({ bookingId, idempotencyKey });
export const requestCancellationExceptionSchema = z.object({ bookingId, reason, idempotencyKey });
export const requestPartnerCancellationSchema = requestCancellationExceptionSchema;
export const cancelManualBookingSchema = requestCancellationExceptionSchema;

export const resolveCancellationSchema = z.object({
  cancellationRequestId: z.string().trim().min(1).max(30),
  decision: z.enum(["APPROVE", "REJECT"]),
  resolutionNote: reason,
  idempotencyKey,
});

export type StandardCancellationInput = z.infer<typeof standardCancellationSchema>;
export type RequestCancellationExceptionInput = z.infer<typeof requestCancellationExceptionSchema>;
export type RequestPartnerCancellationInput = z.infer<typeof requestPartnerCancellationSchema>;
export type CancelManualBookingInput = z.infer<typeof cancelManualBookingSchema>;
export type ResolveCancellationInput = z.infer<typeof resolveCancellationSchema>;

export type CancellationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[] | undefined>;
};
