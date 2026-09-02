import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Compass, CreditCard, ReceiptText, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CancellationRequestForm } from "@/components/booking/cancellation-request-form";
import { StayBaliLogo } from "@/components/landing/public-header";
import { requireTraveler } from "@/lib/auth/authorization";
import { getTravelerBookingHistory } from "@/lib/booking/queries";
import { canIssueVoucher } from "@/lib/booking/rules";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { generateIdempotencyKey } from "@/lib/idempotency";

export const metadata: Metadata = {
  title: "My bookings",
  description: "View and manage your StayBali bookings.",
};

const statusStyle: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning-subtle text-warning",
  CONFIRMED: "bg-success-subtle text-success",
  CHECKED_IN: "bg-brand-teal-subtle text-primary",
  COMPLETED: "bg-secondary text-foreground",
  PAYMENT_FAILED: "bg-red-50 text-red-700",
  EXPIRED: "bg-secondary text-muted-foreground",
  CANCELLATION_REQUESTED: "bg-warning-subtle text-warning",
  CANCELLED: "bg-red-50 text-red-700",
  REFUND_PENDING: "bg-warning-subtle text-warning",
  REFUNDED: "bg-secondary text-muted-foreground",
};

function statusLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function AccountPage() {
  const traveler = await requireTraveler();
  const bookings = await getTravelerBookingHistory();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Traveler account</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">My bookings</h1><p className="mt-3 text-muted-foreground">Welcome, {traveler.name}. Review payment states, stay details, and printable vouchers.</p></div>
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-teal-subtle text-primary"><UserRound className="size-5" /></span>
        </div>

        {bookings.length ? (
          <section className="mt-10 space-y-5" aria-label="Booking history">
            {bookings.map((booking) => {
              const checkin = booking.checkinDate.toISOString().slice(0, 10);
              const checkout = booking.checkoutDate.toISOString().slice(0, 10);
              const canPay =
                (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") &&
                booking.paymentWindowOpen;
              const voucherAvailable = canIssueVoucher(booking.status);

              return (
                <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6" key={booking.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs font-bold tracking-[0.08em] text-primary">{booking.bookingCode}</p>
                      <h2 className="font-display mt-1 text-xl font-bold">{booking.propertyName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{booking.roomName}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle[booking.status] ?? "bg-secondary text-foreground"}`}>{statusLabel(booking.status)}</span>
                  </div>

                  <div className="mt-5 grid gap-4 rounded-xl bg-secondary/70 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="block text-xs text-muted-foreground">Check-in</span><strong>{formatStayDate(checkin)}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Check-out</span><strong>{formatStayDate(checkout)}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Stay</span>{booking._count.nights} nights · {booking.adultCount} adults · {booking.childCount} children</p>
                    <p><span className="block text-xs text-muted-foreground">Total</span><strong>{formatIdr(booking.grandTotal)}</strong></p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {canPay ? <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover" href={`/payment?booking=${encodeURIComponent(booking.id)}`}><CreditCard className="size-4" />Continue payment</Link> : null}
                    {voucherAvailable ? <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-bold hover:bg-secondary" href={`/bookings/${encodeURIComponent(booking.id)}/voucher`}><ReceiptText className="size-4 text-primary" />View voucher</Link> : null}
                    {!canPay && (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") ? <span className="text-sm font-medium text-warning">Payment window has ended.</span> : null}
                  </div>
                  {booking.status === "CONFIRMED" ? <CancellationRequestForm bookingId={booking.id} idempotencyKey={generateIdempotencyKey()} /> : null}
                  {booking.cancellationRequests[0] ? <p className="mt-3 text-xs text-muted-foreground">Latest cancellation request: {booking.cancellationRequests[0].status.toLowerCase()}{booking.cancellationRequests[0].eligibleForFullRefund ? ` · ${formatIdr(booking.cancellationRequests[0].requestedRefundAmount)} full refund eligible` : " · no automatic full refund"}</p> : null}
                </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-10 rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary"><CalendarDays className="size-6" /></span>
            <h2 className="font-display mt-5 text-2xl font-bold">No bookings yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">When you reserve a stay, you&apos;ll find the dates, payment status, and arrival details here.</p>
            <Link className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href="/search"><Compass className="size-4" />Explore Bali stays</Link>
          </section>
        )}
      </div>
    </main>
  );
}
