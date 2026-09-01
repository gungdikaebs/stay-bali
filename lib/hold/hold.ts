import "server-only";

import { isHoldExpired, type CreateHoldInput } from "./rules";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getOwnedQuote } from "@/lib/quote/quotes";
import { listStayDates } from "@/lib/inventory/rules";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus } from "@/generated/prisma/client";

export async function createHold(
  input: CreateHoldInput
): Promise<{ success: true; hold: { id: string; expiresAt: Date } } | { success: false; error: string }> {
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.TRAVELER || actor.status !== UserStatus.ACTIVE) {
    return { success: false, error: "You must be signed in as an active Traveler." };
  }

  const quote = await getOwnedQuote(input.quoteId, { userId: actor.id });
  if (!quote) return { success: false, error: "Quote not found or access denied." };
  if (isHoldExpired(quote.expiresAt, new Date())) {
    return { success: false, error: "This quote has expired. Please create a fresh quote." };
  }
  if (quote.hold) return { success: false, error: "This quote already has a hold." };

  const checkin = quote.checkinDate.toISOString().slice(0, 10);
  const checkout = quote.checkoutDate.toISOString().slice(0, 10);
  const stayDates = listStayDates(checkin, checkout);
  if (!stayDates) return { success: false, error: "Invalid stay dates." };

  const hold = await prisma.$transaction(async (tx) => {
    const newHold = await tx.hold.create({
      data: { quoteId: quote.id, userId: actor.id, guestSessionId: quote.guestSessionId, expiresAt: quote.expiresAt },
      select: { id: true, expiresAt: true },
    });
    await tx.holdNight.createMany({
      data: stayDates.map((d) => ({ holdId: newHold.id, roomTypeId: quote.roomType.id, stayDate: new Date(d) })),
    });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "HOLD_CREATED",
        entityType: "HOLD",
        entityId: newHold.id,
        metadata: { quoteId: quote.id, roomTypeId: quote.roomType.id, nights: stayDates },
      },
    });
    return newHold;
  }, { isolationLevel: "Serializable" });

  return { success: true, hold };
}
