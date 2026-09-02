import { z } from "zod";
import {
  phoneSchema,
  registrationEmailSchema,
  registrationNameSchema,
  registrationPasswordSchema,
} from "@/lib/auth/registration-schema";

export const partnerApplicationSchema = z
  .object({
    name: registrationNameSchema,
    email: registrationEmailSchema,
    phone: phoneSchema.refine(
      (value) => Boolean(value),
      "Phone number is required for Partner applications.",
    ),
    businessName: z
      .string()
      .trim()
      .min(2, "Business name must be at least 2 characters.")
      .max(150, "Business name must be at most 150 characters."),
    password: registrationPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;
