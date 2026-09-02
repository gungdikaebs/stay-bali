import { z } from "zod";
import { baliToday, listStayDates } from "@/lib/inventory/rules";

export const confirmBookingSchema = z.object({
  quoteId: z.string().trim().min(1, "Quote is required."),
  guestName: z.string().trim().min(2, "Guest name must be at least 2 characters.").max(100),
  guestEmail: z.string().trim().toLowerCase().email("Invalid email address.").max(254),
  guestPhone: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 digits.")
    .max(20, "Phone number is too long."),
  specialRequest: z.string().trim().max(500, "Special request is too long.").optional(),
  agreeCancellationPolicy: z.literal(true).refine((val) => val === true, {
    error: "You must agree to the cancellation policy.",
  }),
  idempotencyKey: z.string().trim().min(1).max(64),
});

export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;

export const manualBookingSchema = z
  .object({
    roomTypeId: z.string().trim().min(1, "Room type is required."),
    checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in must be in YYYY-MM-DD."),
    checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out must be in YYYY-MM-DD."),
    adultCount: z.coerce.number().int().min(1).max(10),
    childCount: z.coerce.number().int().min(0).max(10),
    guestName: z.string().trim().min(2).max(100),
    guestEmail: z.string().trim().toLowerCase().email().max(254),
    guestPhone: z.string().trim().min(8).max(20),
    specialRequest: z.string().trim().max(500).optional(),
    reason: z.string().trim().min(10, "Please provide a reason of at least 10 characters.").max(500),
    idempotencyKey: z.string().trim().min(1).max(64),
  })
  .superRefine((value, context) => {
    const stayDates = listStayDates(value.checkinDate, value.checkoutDate);
    if (!stayDates) {
      context.addIssue({
        code: "custom",
        path: ["checkoutDate"],
        message: "Choose a valid stay of 1 to 30 nights.",
      });
      return;
    }
    const today = baliToday();
    if (value.checkinDate < today) {
      context.addIssue({
        code: "custom",
        path: ["checkinDate"],
        message: "Check-in cannot be in the past.",
      });
    }
  });

export type ManualBookingInput = z.infer<typeof manualBookingSchema>;

export const operationalBookingTransitionSchema = z.object({
  bookingId: z.string().trim().min(1).max(30),
  nextStatus: z.enum(["CHECKED_IN", "COMPLETED"]),
});

export type OperationalBookingTransitionInput = z.infer<
  typeof operationalBookingTransitionSchema
>;

export type BookingActionState = {
  status: "idle" | "error" | "success";
  message: string;
  bookingId?: string;
  bookingCode?: string;
  errors?: Record<string, string[] | undefined>;
};

export type OperationalBookingActionState = {
  status: "idle" | "error" | "success";
  message: string;
};
