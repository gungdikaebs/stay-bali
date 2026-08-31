"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
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
  });

  if (!result.success) {
    return { message: "Enter a valid email address and password." };
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: "/workspace",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "The email address or password is incorrect." };
    }

    throw error;
  }

  return { message: "" };
}
