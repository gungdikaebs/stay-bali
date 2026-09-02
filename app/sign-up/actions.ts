"use server";

import { headers } from "next/headers";
import { signIn } from "@/auth";
import { consumeRegistrationAttempt } from "@/lib/auth/rate-limit";
import { registerTraveler } from "@/lib/auth/registration";
import { registrationSchema } from "@/lib/auth/registration-schema";
import { safeInternalRedirect } from "@/lib/auth/redirects";

export type SignUpState = {
  errors?: Partial<
    Record<"name" | "email" | "phone" | "password" | "confirmPassword", string[]>
  >;
  message: string;
};

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";

  if (!consumeRegistrationAttempt(clientKey)) {
    return { message: "Too many sign-up attempts. Please try again in 15 minutes." };
  }

  const result = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
    };
  }

  const registration = await registerTraveler(result.data);
  if (!registration.ok) {
    return {
      errors: { email: ["An account with this email already exists."] },
      message: "We could not create your account.",
    };
  }

  await signIn("credentials", {
    email: result.data.email,
    password: result.data.password,
    redirectTo: safeInternalRedirect(formData.get("callbackUrl"), "/account"),
  });

  return { message: "" };
}
