import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, FlaskConical, LockKeyhole, ShieldCheck } from "lucide-react";
import { DemoPaymentForm } from "@/components/payment/demo-payment-form";
import { StayBaliLogo } from "@/components/landing/public-header";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getTravelerBooking } from "@/lib/booking/queries";
import { generateIdempotencyKey } from "@/lib/idempotency";

export const metadata: Metadata = {
  title: "Demo payment",
  description: "Complete a StayBali reservation using the portfolio payment simulator.",
};

type PaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const rawQuery = await searchParams;
  const booking = await getTravelerBooking(first(rawQuery.booking) ?? "");
  if (!booking) notFound();

  const checkin = booking.checkinDate.toISOString().slice(0, 10);
  const checkout = booking.checkoutDate.toISOString().slice(0, 10);
  const payable =
    (booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_FAILED") &&
    booking.paymentWindowOpen;
  const confirmed = booking.status === "CONFIRMED";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[920px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><LockKeyhole className="size-4 text-primary" />Demo payment</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[920px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:py-14">
        <section className="rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Portfolio checkout</p>
              <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.04em]">Simulate the payment result.</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">This local adapter demonstrates payment states and audit history without connecting to a real provider.</p>
            </div>
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary sm:flex"><FlaskConical className="size-6" /></span>
          </div>

          {payable ? (
            <DemoPaymentForm bookingId={booking.id} idempotencyKey={generateIdempotencyKey()} total={booking.grandTotal} />
          ) : confirmed ? (
            <div className="mt-8 rounded-2xl bg-success-subtle p-5 text-success">
              <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-5" />Payment approved and booking confirmed.</p>
              <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white" href={`/booking/confirmation?booking=${encodeURIComponent(booking.id)}`}>View confirmation</Link>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-warning-subtle p-5 text-warning">
              <p className="flex items-start gap-2 font-bold"><Clock3 className="mt-0.5 size-5 shrink-0" />This booking can no longer be paid. Current status: {booking.status.toLowerCase().replaceAll("_", " ")}.</p>
              <Link className="mt-4 inline-flex text-sm font-bold underline" href="/search">Find another stay</Link>
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-border bg-white p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Booking summary</p>
          <h2 className="font-display mt-2 text-xl font-bold">{booking.propertyName}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{booking.roomName}<br />{formatStayDate(checkin)} → {formatStayDate(checkout)}<br />{booking.nights.length} nights · {booking.adultCount} adults · {booking.childCount} children</p>
          <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Stay</span><span>{formatIdr(booking.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(booking.serviceFee)}</span></div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{formatIdr(booking.grandTotal)}</span></div>
          </div>
          <p className="mt-5 flex gap-2 rounded-xl bg-brand-teal-subtle p-3 text-xs leading-5 text-primary"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Amount and ownership are read from booking {booking.bookingCode} on the server.</p>
          {payable && booking.paymentExpiresAt ? <p className="mt-3 flex gap-2 rounded-xl bg-warning-subtle p-3 text-xs leading-5 text-warning"><Clock3 className="mt-0.5 size-4 shrink-0" />Payment window ends at {booking.paymentExpiresAt.toLocaleTimeString("en-ID", { hour: "2-digit", minute: "2-digit" })}.</p> : null}
        </aside>
      </div>
    </main>
  );
}
