export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PAYMENT_FAILED"
  | "EXPIRED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "CHECKED_IN"
  | "COMPLETED";

export const ALLOWED_TRANSITIONS: Record<BookingStatus, Set<BookingStatus>> = {
  PENDING_PAYMENT: new Set(["CONFIRMED", "PAYMENT_FAILED", "EXPIRED", "CANCELLED"]),
  PAYMENT_FAILED: new Set(["PENDING_PAYMENT"]),
  CONFIRMED: new Set(["CANCELLATION_REQUESTED", "CANCELLED", "CHECKED_IN"]),
  CANCELLATION_REQUESTED: new Set(["CONFIRMED", "REFUND_PENDING", "CANCELLED"]),
  REFUND_PENDING: new Set(["REFUNDED"]),
  REFUNDED: new Set([]),
  CHECKED_IN: new Set(["COMPLETED"]),
  COMPLETED: new Set([]),
  EXPIRED: new Set([]),
  CANCELLED: new Set([]),
};

export function isBookingStatusTransitionAllowed(
  from: BookingStatus,
  to: BookingStatus
): boolean {
  return ALLOWED_TRANSITIONS[from]?.has(to) ?? false;
}

type BookingActor =
  | { role: "ADMIN"; userId: string }
  | {
      role: "PARTNER";
      userId: string;
      partnerProfileId: string | null;
      partnerStatus: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | null;
    }
  | { role: "TRAVELER"; userId: string };

export function canActorTransitionBooking(
  actor: BookingActor,
  booking: { userId: string | null; ownerPartnerId: string },
  from: BookingStatus,
  to: BookingStatus,
) {
  if (actor.role === "ADMIN") return true;

  if (actor.role === "PARTNER") {
    return (
      actor.partnerStatus === "ACTIVE" &&
      actor.partnerProfileId === booking.ownerPartnerId &&
      ((from === "CONFIRMED" && to === "CHECKED_IN") ||
        (from === "CHECKED_IN" && to === "COMPLETED"))
    );
  }

  return (
    actor.userId === booking.userId &&
    ((from === "PENDING_PAYMENT" && to === "CANCELLED") ||
      (from === "CONFIRMED" && to === "CANCELLATION_REQUESTED"))
  );
}

export function generateBookingCode(now = new Date()): string {
  const year = now.getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars (0/O, 1/I)
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SB-${year}-${random}`;
}
