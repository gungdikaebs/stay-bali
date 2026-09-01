import { z } from "zod";

export const simulatePaymentSchema = z.object({
  bookingId: z.string().min(1).max(30),
  idempotencyKey: z.string().min(16).max(64),
  outcome: z.enum(["APPROVE", "DECLINE"]),
});

export type SimulatePaymentInput = z.infer<typeof simulatePaymentSchema>;

export type PaymentActionState = {
  status: "idle" | "success" | "declined" | "error";
  message: string;
  bookingId?: string;
  attemptReference?: string;
  nextIdempotencyKey?: string;
};
