import { z } from "zod";

const idSchema = z.string().min(1).max(30);
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);

export const propertyFormSchema = z.object({
  name: z.string().trim().min(3).max(150),
  type: z.enum(["VILLA", "HOTEL", "HOMESTAY"]),
  description: z.string().trim().min(100).max(5_000),
  area: z.string().trim().min(3).max(100),
  address: z.string().trim().min(10).max(500),
  checkInTime: timeSchema,
  checkOutTime: timeSchema,
  cancellationPolicy: z.string().trim().min(20).max(5_000),
  facilityIds: z.array(idSchema).max(20).transform((ids) => [...new Set(ids)]),
});

export const roomFormSchema = z.object({
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().min(20).max(5_000),
  adultCapacity: z.coerce.number().int().min(1).max(10),
  childCapacity: z.coerce.number().int().min(0).max(10),
  bedType: z.string().trim().min(2).max(100),
  sizeSqm: z.union([z.literal(""), z.coerce.number().int().min(1).max(65_535)]),
  basePrice: z.coerce.number().int().positive().max(2_000_000_000),
  totalUnits: z.coerce.number().int().min(1).max(100),
  facilityIds: z.array(idSchema).max(20).transform((ids) => [...new Set(ids)]),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
export type RoomFormInput = z.infer<typeof roomFormSchema>;

export type SupplyActionState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Record<string, string[] | undefined>;
};
