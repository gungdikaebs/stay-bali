import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { UserRole } from "@/generated/prisma/client";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getOwnedQuote } from "@/lib/quote/quotes";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your StayBali reservation and guest details.",
};

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const rawQuery = await searchParams;
  const quoteId = first(rawQuery.quote) ?? "";
  const user = await getCurrentUser();
  const guestSessionId = (await cookies()).get("staybali_guest_session")?.value;
  const quote = await getOwnedQuote(quoteId, { userId: user?.id, guestSessionId });
  if (!quote) notFound();

  if (quote.expiresAt <= new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <CalendarDays className="mx-auto size-10 text-primary" aria-hidden="true" />
          <h1 className="font-display mt-4 text-3xl font-extrabold">This quote has expired.</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Rates and availability are held in a quote for 10 minutes. Check the dates again to create a fresh quote.</p>
          <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href={`/stays/${quote.roomType.property.slug}`}>Return to {quote.roomType.property.name}</Link>
        </div>
      </main>
    );
  }

  if (!user || user.role !== UserRole.TRAVELER) {
    const callbackUrl = `/checkout?quote=${encodeURIComponent(quote.id)}`;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-card">
          <UserRound className="mx-auto size-10 text-primary" aria-hidden="true" />
          <h1 className="font-display mt-4 text-3xl font-extrabold">Traveler sign-in required.</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Your secure quote is ready. Sign in with a Traveler account before entering booking details.</p>
          {!user ? <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign in to continue</Link> : <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href="/workspace">Return to workspace</Link>}
        </div>
      </main>
    );
  }

  const property = quote.roomType.property;
  const checkin = quote.checkinDate.toISOString().slice(0, 10);
  const checkout = quote.checkoutDate.toISOString().slice(0, 10);
  const nights = quote.nights.length;
  const stay = {
    slug: property.slug,
    name: property.name,
    roomName: quote.roomType.name,
    area: property.area,
    image: property.media[0] ? `/media/${property.media[0].mediaId}/display` : "/images/hero-bali-villa.jpg",
    pricePerNight: Math.round(quote.subtotal / nights),
  };
  const query = { values: { checkin, checkout, guests: quote.adultCount, children: quote.childCount }, nights };
  const summary = { subtotal: quote.subtotal, serviceFee: quote.serviceFee, total: quote.grandTotal };
  const fieldClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
            Secure checkout
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
        <Link className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary" href={`/stays/${stay.slug}?checkin=${query.values.checkin}&checkout=${query.values.checkout}&guests=${query.values.guests}&children=${query.values.children}`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to property
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Complete your reservation</p>
            <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Tell us who&apos;s staying.</h1>
            <p className="mt-3 text-muted-foreground">We&apos;ll use these details for your booking confirmation and arrival information.</p>

            <form action="/payment" method="get" className="mt-8 space-y-8">
              <input type="hidden" name="quote" value={quote.id} />

              <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold"><UserRound className="size-5 text-primary" />Guest details</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold sm:col-span-2">Full name<input className={fieldClassName} autoComplete="name" name="guestName" required type="text" placeholder="Name as shown on ID" /></label>
                  <label className="text-sm font-semibold">Email address<input className={fieldClassName} autoComplete="email" name="guestEmail" required type="email" placeholder="you@example.com" /></label>
                  <label className="text-sm font-semibold">Phone number<input className={fieldClassName} autoComplete="tel" name="guestPhone" required type="tel" placeholder="+62 812 3456 7890" /></label>
                  <label className="text-sm font-semibold sm:col-span-2">Special requests <span className="font-normal text-muted-foreground">(optional)</span><textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-white p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" maxLength={500} name="specialRequest" placeholder="Arrival time, accessibility needs, or anything the property should know" /></label>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold"><CreditCard className="size-5 text-primary" />Payment method</h2>
                <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-xl border-2 border-primary bg-brand-teal-subtle p-4">
                  <input className="mt-1 accent-primary" defaultChecked name="payment" type="radio" value="secure-payment" />
                  <span className="flex-1"><strong className="block text-sm">Secure online payment</strong><span className="mt-1 block text-sm leading-6 text-muted-foreground">Choose bank transfer, card, or supported e-wallet on the payment page.</span></span>
                  <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                </label>
              </section>

              <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input className="mt-1.5 accent-primary" required type="checkbox" />
                <span>I agree to the property rules and cancellation policy. Free cancellation is available until 3 days before check-in.</span>
              </label>

              <button className="min-h-14 w-full rounded-xl bg-primary px-6 text-base font-bold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" type="submit">Continue to secure payment</button>
            </form>
          </div>

          <aside className="overflow-hidden rounded-3xl border border-border bg-white shadow-card lg:sticky lg:top-6">
            <div className="relative aspect-[16/9] bg-secondary">
              <Image fill alt={stay.name} className="object-cover" sizes="400px" src={stay.image} />
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Your stay</p>
              <h2 className="font-display mt-2 text-xl font-bold">{stay.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stay.roomName} · {stay.area}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-secondary p-4 text-sm">
                <div><span className="block text-xs text-muted-foreground">Check-in</span><strong>{formatStayDate(query.values.checkin)}</strong></div>
                <div><span className="block text-xs text-muted-foreground">Check-out</span><strong>{formatStayDate(query.values.checkout)}</strong></div>
                <div><span className="block text-xs text-muted-foreground">Length</span><strong>{query.nights} nights</strong></div>
                <div><span className="block text-xs text-muted-foreground">Guests</span><strong>{query.values.guests} adults · {query.values.children} children</strong></div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{formatIdr(stay.pricePerNight)} × {query.nights}</span><span>{formatIdr(summary.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(summary.serviceFee)}</span></div>
                <div className="flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{formatIdr(summary.total)}</span></div>
              </div>

              <p className="mt-6 flex gap-2 border-t border-border pt-5 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />Your booking is confirmed only after payment verification.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
