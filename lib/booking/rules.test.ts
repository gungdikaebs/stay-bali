import test from "node:test";
import assert from "node:assert/strict";
import {
  canActorTransitionBooking,
  generateBookingCode,
  isBookingStatusTransitionAllowed,
} from "./rules";

test("isBookingStatusTransitionAllowed validates state machine rules", () => {
  // Valid transitions
  assert.equal(isBookingStatusTransitionAllowed("PENDING_PAYMENT", "CONFIRMED"), true);
  assert.equal(isBookingStatusTransitionAllowed("PENDING_PAYMENT", "EXPIRED"), true);
  assert.equal(isBookingStatusTransitionAllowed("CONFIRMED", "CHECKED_IN"), true);
  assert.equal(isBookingStatusTransitionAllowed("CHECKED_IN", "COMPLETED"), true);

  // Invalid transitions
  assert.equal(isBookingStatusTransitionAllowed("COMPLETED", "CONFIRMED"), false);
  assert.equal(isBookingStatusTransitionAllowed("CANCELLED", "CONFIRMED"), false);
  assert.equal(isBookingStatusTransitionAllowed("PENDING_PAYMENT", "COMPLETED"), false);
});

test("generateBookingCode generates code with correct format", () => {
  const code = generateBookingCode();
  assert.match(code, /^SB-\d{4}-[A-Z2-9]{6}$/);
});

test("canActorTransitionBooking enforces role, ownership, and partner lifecycle", () => {
  const booking = { userId: "traveler-a", ownerPartnerId: "partner-a" };

  assert.equal(
    canActorTransitionBooking(
      { role: "ADMIN", userId: "admin" },
      booking,
      "CANCELLATION_REQUESTED",
      "REFUND_PENDING",
    ),
    true,
  );
  assert.equal(
    canActorTransitionBooking(
      {
        role: "PARTNER",
        userId: "partner-user-a",
        partnerProfileId: "partner-a",
        partnerStatus: "ACTIVE",
      },
      booking,
      "CONFIRMED",
      "CHECKED_IN",
    ),
    true,
  );
  assert.equal(
    canActorTransitionBooking(
      {
        role: "PARTNER",
        userId: "partner-user-b",
        partnerProfileId: "partner-b",
        partnerStatus: "ACTIVE",
      },
      booking,
      "CONFIRMED",
      "CHECKED_IN",
    ),
    false,
  );
  assert.equal(
    canActorTransitionBooking(
      {
        role: "PARTNER",
        userId: "partner-user-a",
        partnerProfileId: "partner-a",
        partnerStatus: "SUSPENDED",
      },
      booking,
      "CHECKED_IN",
      "COMPLETED",
    ),
    false,
  );
  assert.equal(
    canActorTransitionBooking(
      { role: "TRAVELER", userId: "traveler-a" },
      booking,
      "CONFIRMED",
      "CANCELLATION_REQUESTED",
    ),
    true,
  );
  assert.equal(
    canActorTransitionBooking(
      { role: "TRAVELER", userId: "traveler-b" },
      booking,
      "CONFIRMED",
      "CANCELLATION_REQUESTED",
    ),
    false,
  );
  assert.equal(
    canActorTransitionBooking(
      { role: "TRAVELER", userId: "traveler-a" },
      booking,
      "CONFIRMED",
      "CHECKED_IN",
    ),
    false,
  );
});
