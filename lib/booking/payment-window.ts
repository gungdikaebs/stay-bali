import "server-only";

const DEFAULT_PAYMENT_WINDOW_MINUTES = 15;
const MAX_PAYMENT_WINDOW_MINUTES = 60;

export function getBookingPaymentExpiry(now = new Date()): Date {
  const configured = process.env.BOOKING_PAYMENT_WINDOW_MINUTES?.trim();
  const minutes = configured === undefined
    ? DEFAULT_PAYMENT_WINDOW_MINUTES
    : Number(configured);

  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_PAYMENT_WINDOW_MINUTES) {
    throw new Error("BOOKING_PAYMENT_WINDOW_MINUTES must be an integer between 1 and 60.");
  }

  return new Date(now.getTime() + minutes * 60_000);
}
