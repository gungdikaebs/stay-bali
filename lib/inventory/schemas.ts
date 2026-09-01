import { z } from "zod";
import { addUtcDays, baliToday, listInclusiveDates } from "@/lib/inventory/rules";

const optionalPositiveInteger = z.union([
  z.literal(""),
  z.coerce.number().int().positive().max(2_000_000_000),
]);

const optionalUnits = z.union([
  z.literal(""),
  z.coerce.number().int().min(1).max(100),
]);

export const bulkInventorySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  priceOverride: optionalPositiveInteger,
  totalUnitsOverride: optionalUnits,
  stopSell: z.boolean(),
}).superRefine((value, context) => {
  if (!listInclusiveDates(value.startDate, value.endDate)) {
    context.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "Choose a valid range of no more than 90 days.",
    });
  }
  const today = baliToday();
  const latest = addUtcDays(today, 365);
  if (value.startDate < today || (latest && value.endDate > latest)) {
    context.addIssue({
      code: "custom",
      path: ["startDate"],
      message: "Inventory dates must be today through 365 days ahead.",
    });
  }
});

export type BulkInventoryInput = z.infer<typeof bulkInventorySchema>;

export type InventoryActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Record<string, string[] | undefined>;
};
