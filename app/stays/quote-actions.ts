"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/authorization";
import { createQuote } from "@/lib/quote/quotes";

const GUEST_SESSION_COOKIE = "staybali_guest_session";

const quoteSchema = z.object({
  slug: z.string().min(1).max(180),
  checkin: z.string(),
  checkout: z.string(),
  adults: z.coerce.number().int().min(1).max(10),
  children: z.coerce.number().int().min(0).max(10),
});

export type QuoteActionState = { message: string };

export async function createQuoteAction(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const result = quoteSchema.safeParse({
    slug: formData.get("slug"),
    checkin: formData.get("checkin"),
    checkout: formData.get("checkout"),
    adults: formData.get("adults"),
    children: formData.get("children"),
  });
  if (!result.success) return { message: "Review the selected dates and guest counts." };

  const user = await getCurrentUser();
  const cookieStore = await cookies();
  let guestSessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  if (!user && !guestSessionId) {
    guestSessionId = randomUUID();
    cookieStore.set(GUEST_SESSION_COOKIE, guestSessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
      priority: "high",
    });
  }

  let quote: { id: string };
  try {
    quote = await createQuote({
      ...result.data,
      ...(user ? { userId: user.id } : { guestSessionId: guestSessionId! }),
    });
  } catch (error) {
    return {
      message: error instanceof Error && error.message.startsWith("This stay is no longer available")
        ? error.message
        : "We could not create this quote. Please try again.",
    };
  }
  redirect(`/checkout?quote=${quote.id}`);
}
