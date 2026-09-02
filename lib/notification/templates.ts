export type BookingEmailTemplate =
  | "BOOKING_CONFIRMED"
  | "CANCELLATION_REQUESTED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REFUNDED";

export type BookingEmailSnapshot = {
  bookingCode: string;
  propertyName: string;
  roomName: string;
  guestName: string;
  checkinDate: Date;
  checkoutDate: Date;
  grandTotal: number;
};

type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(value);
}

function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const messages: Record<BookingEmailTemplate, { subject: string; heading: string; intro: string }> = {
  BOOKING_CONFIRMED: {
    subject: "Your StayBali booking is confirmed",
    heading: "Booking confirmed",
    intro: "Your Bali stay is confirmed. Keep this email with your travel details.",
  },
  CANCELLATION_REQUESTED: {
    subject: "We received your StayBali cancellation request",
    heading: "Cancellation request received",
    intro: "Our operations team will review your request. Your reservation remains allocated until a final decision is recorded.",
  },
  BOOKING_CANCELLED: {
    subject: "Your StayBali booking was cancelled",
    heading: "Booking cancelled",
    intro: "Your cancellation has been completed and the room inventory has been released.",
  },
  BOOKING_REFUNDED: {
    subject: "Your StayBali refund was recorded",
    heading: "Refund recorded",
    intro: "Your cancellation was approved and the full manual refund has been recorded by StayBali operations.",
  },
};

export function renderBookingEmail(
  template: BookingEmailTemplate,
  booking: BookingEmailSnapshot,
  appUrl: string,
): RenderedEmail {
  const message = messages[template];
  const safe = {
    guestName: escapeHtml(booking.guestName),
    bookingCode: escapeHtml(booking.bookingCode),
    propertyName: escapeHtml(booking.propertyName),
    roomName: escapeHtml(booking.roomName),
  };
  const details = [
    `Booking: ${booking.bookingCode}`,
    `Stay: ${booking.propertyName} — ${booking.roomName}`,
    `Check-in: ${formatDate(booking.checkinDate)}`,
    `Check-out: ${formatDate(booking.checkoutDate)}`,
    `Total: ${formatIdr(booking.grandTotal)}`,
  ].join("\n");
  const accountUrl = `${appUrl.replace(/\/$/, "")}/account`;

  return {
    subject: `${message.subject} — ${booking.bookingCode}`,
    text: `Hello ${booking.guestName},\n\n${message.intro}\n\n${details}\n\nManage your bookings at ${appUrl.replace(/\/$/, "")}/account`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#183b37;line-height:1.6"><main style="max-width:600px;margin:auto;padding:32px"><p style="font-weight:700;color:#147d70">StayBali</p><h1>${escapeHtml(message.heading)}</h1><p>Hello ${safe.guestName},</p><p>${escapeHtml(message.intro)}</p><table style="width:100%;border-collapse:collapse;background:#f2f8f6"><tr><td style="padding:16px"><strong>Booking</strong><br>${safe.bookingCode}<br><br><strong>Stay</strong><br>${safe.propertyName} — ${safe.roomName}<br><br><strong>Dates</strong><br>${escapeHtml(formatDate(booking.checkinDate))} – ${escapeHtml(formatDate(booking.checkoutDate))}<br><br><strong>Total</strong><br>${escapeHtml(formatIdr(booking.grandTotal))}</td></tr></table><p><a href="${escapeHtml(accountUrl)}" style="color:#147d70;font-weight:700">Open your StayBali account</a></p></main></body></html>`,
  };
}
