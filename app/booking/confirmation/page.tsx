import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck2, CheckCircle2, Home, Mail, ReceiptText, ShieldCheck } from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { getTravelerBooking } from "@/lib/booking/queries";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";

export const metadata: Metadata = {
  title: "Booking confirmed",
  description: "Your StayBali booking confirmation.",
};

type ConfirmationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const rawQuery = await searchParams;
  const booking = await getTravelerBooking(first(rawQuery.booking) ?? "");
  if (!booking || booking.status !== "CONFIRMED") notFound();
  const successfulAttempt = booking.paymentAttempts.find((attempt) => attempt.status === "SUCCEEDED");
  const checkin = booking.checkinDate.toISOString().slice(0, 10);
  const checkout = booking.checkoutDate.toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-brand-sand">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[960px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-success"><ShieldCheck className="size-4" />Booking protected</span>
        </div>
      </header>

      <div className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-16">
        <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-search">
          <div className="bg-primary px-6 py-10 text-center text-white sm:px-10">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-primary"><CheckCircle2 className="size-9" /></span>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-white/70">Booking confirmed</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Your Bali stay is all set.</h1>
            <p className="mt-3 text-white/75">Keep your booking code handy for check-in and support.</p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Booking code</p><p className="font-display mt-1 text-2xl font-extrabold tracking-[0.04em]">{booking.bookingCode}</p></div>
              <span className="self-start rounded-full bg-success-subtle px-3 py-1.5 text-xs font-bold text-success sm:self-auto">Confirmed</span>
            </div>

            <div className="grid gap-8 py-8 sm:grid-cols-2">
              <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Property</p><h2 className="font-display mt-2 text-xl font-bold">{booking.propertyName}</h2><p className="mt-1 text-sm text-muted-foreground">{booking.roomName}<br />Guest: {booking.guestName}</p></div>
              <div className="grid grid-cols-2 gap-4 text-sm"><div><span className="block text-xs text-muted-foreground">Check-in</span><strong>{formatStayDate(checkin)}</strong></div><div><span className="block text-xs text-muted-foreground">Check-out</span><strong>{formatStayDate(checkout)}</strong></div><div><span className="block text-xs text-muted-foreground">Guests</span><strong>{booking.adultCount + booking.childCount}</strong></div><div><span className="block text-xs text-muted-foreground">Length</span><strong>{booking.nights.length} nights</strong></div></div>
            </div>

            <div className="rounded-2xl bg-secondary p-5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total paid</span><strong className="text-lg">{formatIdr(booking.grandTotal)}</strong></div>
              {successfulAttempt ? <p className="mt-2 text-xs text-muted-foreground">Demo payment reference: {successfulAttempt.providerReference}</p> : null}
              <p className="mt-3 flex gap-2 text-sm leading-6 text-muted-foreground"><Mail className="mt-1 size-4 shrink-0 text-primary" />Confirmation email is represented in the portfolio flow and no message is sent externally.</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary-hover" href="/"><Home className="size-4" />Back to home</Link>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary bg-white px-5 font-bold text-primary hover:bg-brand-teal-subtle" href={`/bookings/${encodeURIComponent(booking.id)}/voucher`}><ReceiptText className="size-4" />Voucher</Link>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 font-bold hover:bg-secondary" href="/search"><CalendarCheck2 className="size-4 text-primary" />Explore more stays</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
