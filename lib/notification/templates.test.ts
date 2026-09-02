import assert from "node:assert/strict";
import test from "node:test";
import { renderBookingEmail } from "./templates";

test("booking email escapes snapshot fields and keeps plain-text details", () => {
  const email = renderBookingEmail("BOOKING_CONFIRMED", {
    bookingCode: "SB-123",
    propertyName: "Villa <script>",
    roomName: "Garden & Pool",
    guestName: "Ayu <Bali>",
    checkinDate: new Date("2026-09-10T00:00:00.000Z"),
    checkoutDate: new Date("2026-09-12T00:00:00.000Z"),
    grandTotal: 1_050_000,
  }, "https://staybali.test/");

  assert.match(email.subject, /SB-123/);
  assert.match(email.text, /Villa <script>/);
  assert.doesNotMatch(email.html, /Villa <script>/);
  assert.match(email.html, /Villa &lt;script&gt;/);
  assert.match(email.html, /Garden &amp; Pool/);
});
