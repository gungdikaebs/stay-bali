import test from "node:test";
import assert from "node:assert/strict";
import { isBookingStatusTransitionAllowed, generateBookingCode } from "./rules";

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
