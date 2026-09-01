import { z } from "zod";

export const createHoldSchema = z.object({
  quoteId: z.string().trim().min(1, "Quote ID is required."),
  adultCount: z.coerce.number().int().min(1).max(10),
  childCount: z.coerce.number().int().min(0).max(10),
  specialRequest: z.string().trim().max(500).optional(),
});

export type CreateHoldInput = z.infer<typeof createHoldSchema>;

export function isHoldExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

export type HoldActionState = {
  status: "idle" | "error" | "success";
  message: string;
  holdId?: string;
  expiresAt?: string;
  errors?: Record<string, string[] | undefined>;
};
