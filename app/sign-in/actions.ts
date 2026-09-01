"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { safeInternalRedirect } from "@/lib/auth/redirects";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  callbackUrl: z.string().optional(),
});

export type SignInState = {
  message: string;
};

export async function authenticate(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl"),
  });

  if (!result.success) {
    return { message: "Enter a valid email address and password." };
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: safeInternalRedirect(result.data.callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "The email address or password is incorrect." };
    }

    throw error;
  }

  return { message: "" };
}
