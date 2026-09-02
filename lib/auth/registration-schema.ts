import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .max(30, "Phone number is too long.")
  .refine(
    (value) => value === "" || /^\+?[\d\s()-]+$/.test(value),
    "Enter a valid phone number.",
  )
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value === "" || (value.length >= 8 && value.length <= 20),
    "Phone number must contain 8 to 20 digits.",
  )
  .transform((value) => value || undefined);

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be at most 100 characters."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(254, "Email address is too long."),
    phone: phoneSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters.")
      .regex(/[A-Za-z]/, "Password must contain at least one letter.")
      .regex(/\d/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
