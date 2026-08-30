import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Check, Clock3, CreditCard, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { createBookingSummary } from "@/lib/booking-summary";
import { formatIdr, getDemoStay } from "@/lib/demo-stays";
import { parseSearchQuery } from "@/lib/search-query";

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
  const stay = getDemoStay(first(rawQuery.stay) ?? "");
  if (!stay) notFound();

  const query = parseSearchQuery({ ...rawQuery, location: stay.location });
  if (query.errors.length > 0 || query.nights === null) notFound();

  const summary = createBookingSummary(stay, query.nights);
  const confirmationQuery = new URLSearchParams({
    stay: stay.slug,
    checkin: query.values.checkin,
    checkout: query.values.checkout,
    guests: String(query.values.guests),
  });

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

          <Link className="mt-8 flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white transition hover:bg-primary-hover" href={`/booking/confirmation?${confirmationQuery.toString()}`}>Pay {formatIdr(summary.total)}</Link>
          <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />Payment verification may take a few moments. Keep this page open until it is complete.</p>
        </section>

        <aside className="rounded-3xl border border-border bg-white p-6 lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Booking summary</p>
          <h2 className="font-display mt-2 text-xl font-bold">{stay.name}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{query.values.checkin} → {query.values.checkout}<br />{query.nights} nights · {query.values.guests} guests</p>
          <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Stay</span><span>{formatIdr(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(summary.serviceFee)}</span></div>
            <div className="flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{formatIdr(summary.total)}</span></div>
          </div>
          <p className="mt-5 flex gap-2 rounded-xl bg-warning-subtle p-3 text-xs leading-5 text-warning"><Clock3 className="mt-0.5 size-4 shrink-0" />Your selected room is held while payment is completed.</p>
        </aside>
      </div>
    </main>
  );
}
