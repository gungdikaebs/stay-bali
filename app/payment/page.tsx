import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Check, Clock3, CreditCard, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getOwnedBooking } from "@/lib/booking/queries";

export const metadata: Metadata = {
  title: "Secure payment",
  description: "Complete your StayBali reservation securely.",
};

type PaymentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const rawQuery = await searchParams;
  const booking = await getOwnedBooking(first(rawQuery.booking) ?? "");
  if (!booking) notFound();

  const query = {
    values: {
      checkin: booking.checkinDate.toISOString().slice(0, 10),
      checkout: booking.checkoutDate.toISOString().slice(0, 10),
      guests: booking.adultCount,
      children: booking.childCount,
    },
    nights: booking.nights.length,
  };
  const summary = { subtotal: booking.subtotal, serviceFee: booking.serviceFee, total: booking.grandTotal };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[920px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><LockKeyhole className="size-4 text-primary" />Secure payment</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[920px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:py-14">
        <section className="rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Final step</p><h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.04em]">Choose how you&apos;d like to pay.</h1></div>
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary sm:flex"><ShieldCheck className="size-6" /></span>
          </div>

          <div className="mt-8 space-y-3">
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-primary bg-brand-teal-subtle p-4">
              <input className="accent-primary" defaultChecked name="method" type="radio" />
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary"><CreditCard className="size-5" /></span>
              <span className="flex-1"><strong className="block text-sm">Credit or debit card</strong><span className="text-xs text-muted-foreground">Visa, Mastercard, and JCB</span></span>
              <Check className="size-5 text-primary" />
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border p-4 hover:bg-secondary">
              <input className="accent-primary" name="method" type="radio" />
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground"><Building2 className="size-5" /></span>
              <span className="flex-1"><strong className="block text-sm">Bank transfer</strong><span className="text-xs text-muted-foreground">Pay from your preferred bank</span></span>
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border p-4 hover:bg-secondary">
              <input className="accent-primary" name="method" type="radio" />
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground"><Smartphone className="size-5" /></span>
              <span className="flex-1"><strong className="block text-sm">E-wallet</strong><span className="text-xs text-muted-foreground">Choose a supported digital wallet</span></span>
            </label>
          </div>

          <button className="mt-8 flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white opacity-50" disabled type="button">Pay {formatIdr(summary.total)}</button>
          <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />Payment methods will unlock when the Midtrans sandbox integration is enabled.</p>
        </section>

        <aside className="rounded-3xl border border-border bg-white p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Booking summary</p>
          <h2 className="font-display mt-2 text-xl font-bold">{booking.propertyName}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{booking.roomName}<br />{formatStayDate(query.values.checkin)} → {formatStayDate(query.values.checkout)}<br />{query.nights} nights · {query.values.guests} adults · {query.values.children} children</p>
          <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Stay</span><span>{formatIdr(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(summary.serviceFee)}</span></div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{formatIdr(summary.total)}</span></div>
          </div>
          <p className="mt-5 flex gap-2 rounded-xl bg-warning-subtle p-3 text-xs leading-5 text-warning"><Clock3 className="mt-0.5 size-4 shrink-0" />Booking {booking.bookingCode} is secured with status {booking.status.toLowerCase().replaceAll("_", " ")} while payment integration is pending.</p>
        </aside>
      </div>
    </main>
  );
}
