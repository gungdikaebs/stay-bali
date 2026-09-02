import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Compass, CreditCard, Luggage, MapPin, ReceiptText, Sparkles } from "lucide-react";
import { CancellationRequestForm } from "@/components/booking/cancellation-request-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { requireTraveler } from "@/lib/auth/authorization";
import { getTravelerBookingHistory } from "@/lib/booking/queries";
import { canIssueVoucher } from "@/lib/booking/rules";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { generateIdempotencyKey } from "@/lib/idempotency";

export const metadata: Metadata = {
  title: "My trips",
  description: "View and manage your StayBali trips.",
};

function isUpcomingStatus(status: string) {
  return ["CONFIRMED", "CHECKED_IN", "CANCELLATION_REQUESTED", "PENDING_PAYMENT", "PAYMENT_FAILED"].includes(status);
}

export default async function AccountPage() {
  const traveler = await requireTraveler();
  const bookings = await getTravelerBookingHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings
    .filter((booking) => booking.checkoutDate >= today && isUpcomingStatus(booking.status))
    .toSorted((left, right) => left.checkinDate.getTime() - right.checkinDate.getTime());
  const nextTrip = upcoming[0];
  const actionNeeded = bookings.filter((booking) =>
    (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") && booking.paymentWindowOpen,
  ).length;
  const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const confirmedValue = bookings
    .filter((booking) => ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(booking.status))
    .reduce((total, booking) => total + booking.grandTotal, 0);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        action={<Button asChild><Link href="/search?location=all&guests=2"><Compass className="size-4" aria-hidden="true" />Explore stays</Link></Button>}
        description={`Welcome back, ${traveler.name}. Keep payments, arrival details, vouchers, and cancellation updates together.`}
        eyebrow="Traveler account"
        title="My Bali trips"
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Trip summary">
        <MetricCard accent="teal" helper="Upcoming and currently in-stay" icon={Luggage} label="Active trips" value={upcoming.length} />
        <MetricCard accent={actionNeeded ? "amber" : "green"} helper={actionNeeded ? "Complete payment before the window closes" : "Nothing waiting for you"} icon={CreditCard} label="Action needed" value={actionNeeded} />
        <MetricCard accent="green" helper="Stay history in this account" icon={CheckCircle2} label="Completed stays" value={completed} />
        <MetricCard accent="neutral" helper="Confirmed and completed booking value" icon={ReceiptText} label="Trip value" value={formatIdr(confirmedValue)} />
      </section>

      {nextTrip ? (
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-foreground p-6 text-white shadow-card sm:p-8">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-primary/35 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#bcece4]"><Sparkles className="size-3.5" aria-hidden="true" />Next trip</span><StatusBadge className="bg-white/10 text-white" status={nextTrip.status} /></div>
              <p className="mt-6 font-mono text-xs font-bold tracking-[0.1em] text-[#8ce0d4]">{nextTrip.bookingCode}</p>
              <h2 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{nextTrip.propertyName}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/65"><MapPin className="size-4" aria-hidden="true" />{nextTrip.roomName}</p>
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                <div><p className="text-xs text-white/55">Check-in</p><p className="mt-1 font-bold">{formatStayDate(nextTrip.checkinDate.toISOString().slice(0, 10))}</p></div>
                <div><p className="text-xs text-white/55">Check-out</p><p className="mt-1 font-bold">{formatStayDate(nextTrip.checkoutDate.toISOString().slice(0, 10))}</p></div>
                <div><p className="text-xs text-white/55">Guests</p><p className="mt-1 font-bold">{nextTrip.adultCount} adults · {nextTrip.childCount} children</p></div>
              </div>
            </div>
            <div className="min-w-52 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs text-white/55">Booking total</p><p className="font-display mt-1 text-2xl font-extrabold tabular-nums">{formatIdr(nextTrip.grandTotal)}</p>
              {canIssueVoucher(nextTrip.status) ? <Button asChild className="mt-4 w-full border-white/15 bg-white text-foreground hover:bg-white/90" size="sm" variant="outline"><Link href={`/bookings/${encodeURIComponent(nextTrip.id)}/voucher`}>View voucher<ArrowRight className="size-4" aria-hidden="true" /></Link></Button> : null}
              {(nextTrip.status === "PENDING_PAYMENT" || nextTrip.status === "PAYMENT_FAILED") && nextTrip.paymentWindowOpen ? <Button asChild className="mt-4 w-full bg-white text-foreground hover:bg-white/90" size="sm"><Link href={`/payment?booking=${encodeURIComponent(nextTrip.id)}`}>Continue payment<ArrowRight className="size-4" aria-hidden="true" /></Link></Button> : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm" aria-label="Booking history">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Trip history</p><h2 className="font-display mt-1 text-xl font-extrabold">All bookings</h2></div>
          {bookings.length ? <p className="text-sm font-semibold text-muted-foreground">{bookings.length} {bookings.length === 1 ? "booking" : "bookings"}</p> : null}
        </div>
        {bookings.length ? (
          <div className="divide-y divide-border">
            {bookings.map((booking) => {
              const checkin = booking.checkinDate.toISOString().slice(0, 10);
              const checkout = booking.checkoutDate.toISOString().slice(0, 10);
              const canPay = (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") && booking.paymentWindowOpen;
              const voucherAvailable = canIssueVoucher(booking.status);

              return (
                <article className="p-5 sm:p-6" key={booking.id}>
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary">{booking.bookingCode}</p><StatusBadge status={booking.status} /></div>
                      <h3 className="font-display mt-3 text-xl font-extrabold">{booking.propertyName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{booking.roomName}</p>
                    </div>
                    <p className="font-display text-xl font-extrabold tabular-nums lg:text-right">{formatIdr(booking.grandTotal)}</p>
                  </div>
                  <div className="mt-5 grid gap-4 rounded-2xl bg-secondary/70 p-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <p><span className="block text-xs text-muted-foreground">Check-in</span><strong className="mt-1 block">{formatStayDate(checkin)}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Check-out</span><strong className="mt-1 block">{formatStayDate(checkout)}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Length</span><strong className="mt-1 block">{booking._count.nights} nights</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Guests</span><strong className="mt-1 block">{booking.adultCount} adults · {booking.childCount} children</strong></p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {canPay ? <Button asChild size="sm"><Link href={`/payment?booking=${encodeURIComponent(booking.id)}`}><CreditCard className="size-4" aria-hidden="true" />Continue payment</Link></Button> : null}
                    {voucherAvailable ? <Button asChild size="sm" variant="outline"><Link href={`/bookings/${encodeURIComponent(booking.id)}/voucher`}><ReceiptText className="size-4 text-primary" aria-hidden="true" />View voucher</Link></Button> : null}
                    {!canPay && (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") ? <span className="text-sm font-semibold text-warning">Payment window has ended.</span> : null}
                  </div>
                  {booking.status === "CONFIRMED" ? <CancellationRequestForm bookingId={booking.id} idempotencyKey={generateIdempotencyKey()} /> : null}
                  {booking.cancellationRequests[0] ? <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-xs leading-5 text-muted-foreground">Latest cancellation request: <strong className="text-foreground">{booking.cancellationRequests[0].status.toLowerCase()}</strong>{booking.cancellationRequests[0].eligibleForFullRefund ? ` · ${formatIdr(booking.cancellationRequests[0].requestedRefundAmount)} full refund eligible` : " · no automatic full refund"}</p> : null}
                </article>
              );
            })}
          </div>
        ) : <EmptyState action={<Button asChild><Link href="/search?location=all&guests=2"><Compass className="size-4" aria-hidden="true" />Explore Bali stays</Link></Button>} description="When you reserve a stay, payment status, dates, and arrival details will appear here." icon={CalendarDays} title="No bookings yet" />}
      </section>
    </div>
  );
}
