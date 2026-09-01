import assert from "node:assert/strict";
import test from "node:test";

import { getBookingPaymentExpiry } from "./payment-window";

test("getBookingPaymentExpiry uses a 15 minute default", () => {
  const previous = process.env.BOOKING_PAYMENT_WINDOW_MINUTES;
  delete process.env.BOOKING_PAYMENT_WINDOW_MINUTES;

  try {
    const now = new Date("2026-09-02T00:00:00.000Z");
    assert.equal(getBookingPaymentExpiry(now).toISOString(), "2026-09-02T00:15:00.000Z");
  } finally {
    if (previous === undefined) delete process.env.BOOKING_PAYMENT_WINDOW_MINUTES;
    else process.env.BOOKING_PAYMENT_WINDOW_MINUTES = previous;
  }
});

test("getBookingPaymentExpiry validates the configured window", () => {
  const previous = process.env.BOOKING_PAYMENT_WINDOW_MINUTES;

  try {
    process.env.BOOKING_PAYMENT_WINDOW_MINUTES = "30";
    const now = new Date("2026-09-02T00:00:00.000Z");
    assert.equal(getBookingPaymentExpiry(now).toISOString(), "2026-09-02T00:30:00.000Z");

    process.env.BOOKING_PAYMENT_WINDOW_MINUTES = "0";
    assert.throws(() => getBookingPaymentExpiry(now), /integer between 1 and 60/);
  } finally {
    if (previous === undefined) delete process.env.BOOKING_PAYMENT_WINDOW_MINUTES;
    else process.env.BOOKING_PAYMENT_WINDOW_MINUTES = previous;
  }
});
