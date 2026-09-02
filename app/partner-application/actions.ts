"use server";

import { headers } from "next/headers";
import { partnerApplicationSchema } from "@/lib/auth/partner-application-schema";
import { registerPendingPartner } from "@/lib/auth/partner-registration";
import { consumeRegistrationAttempt } from "@/lib/auth/rate-limit";

export type PartnerApplicationState = {
  submitted: boolean;
  errors?: Partial<
    Record<
      "name" | "email" | "phone" | "businessName" | "password" | "confirmPassword",
      string[]
    >
  >;
  message: string;
};

export async function submitPartnerApplication(
  _previousState: PartnerApplicationState,
  formData: FormData,
): Promise<PartnerApplicationState> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwardedFor || requestHeaders.get("x-real-ip") || "unknown";

  if (!consumeRegistrationAttempt(`partner:${clientKey}`)) {
    return {
      submitted: false,
      message: "Too many application attempts. Please try again in 15 minutes.",
    };
  }

  const result = partnerApplicationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    businessName: formData.get("businessName"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      submitted: false,
      errors: result.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
    };
  }

  const application = await registerPendingPartner(result.data);
  if (!application.ok) {
    return {
      submitted: false,
      errors: { email: ["An account with this email already exists."] },
      message: "We could not submit your application.",
    };
  }

  return {
    submitted: true,
    message: "Your Partner application has been submitted for review.",
  };
}
