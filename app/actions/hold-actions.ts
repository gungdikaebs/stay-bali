"use server";

import { cookies } from "next/headers";
import { createHoldSchema } from "@/lib/hold/rules";
import { createHold } from "@/lib/hold/hold";
import type { HoldActionState } from "@/lib/hold/rules";

export async function createHoldAction(
  _prevState: HoldActionState,
  formData: FormData
): Promise<HoldActionState> {
  const raw = {
    quoteId: formData.get("quoteId") as string,
    adultCount: Number(formData.get("adultCount") ?? 2),
    childCount: Number(formData.get("childCount") ?? 0),
    specialRequest: (formData.get("specialRequest") as string) || undefined,
  };

  const result = createHoldSchema.safeParse(raw);
  if (!result.success) {
    return {
      status: "error",
      message: "Invalid hold request.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const guestSessionId = (await cookies()).get("staybali_guest_session")?.value;
    const holdResult = await createHold(result.data, guestSessionId);
    if (!holdResult.success) {
      return { status: "error", message: holdResult.error };
    }
    return {
      status: "success",
      message: "Hold created successfully.",
      holdId: holdResult.hold.id,
      expiresAt: holdResult.hold.expiresAt.toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to create hold.",
    };
  }
}
