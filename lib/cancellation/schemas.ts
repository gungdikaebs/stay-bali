import { z } from "zod";

export const requestCancellationSchema = z.object({
  bookingId: z.string().min(1).max(30),
  reason: z.string().trim().min(10, "Please provide at least 10 characters.").max(500),
  idempotencyKey: z.string().min(16).max(64),
});

export const resolveCancellationSchema = z.object({
  cancellationRequestId: z.string().min(1).max(30),
  decision: z.enum(["APPROVE", "REJECT"]),
  resolutionNote: z.string().trim().min(10, "Please provide at least 10 characters.").max(500),
  refundReference: z.string().trim().max(64).optional(),
  idempotencyKey: z.string().min(16).max(64),
});

export type RequestCancellationInput = z.infer<typeof requestCancellationSchema>;
export type ResolveCancellationInput = z.infer<typeof resolveCancellationSchema>;

export type CancellationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[] | undefined>;
};
