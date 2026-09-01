import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { QuoteButton } from "@/components/booking/quote-button";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getPublishedStayBySlug } from "@/lib/public/catalog";
import { parseSearchQuery } from "@/lib/search-query";

type StayPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: StayPageProps): Promise<Metadata> {
  const stay = await getPublishedStayBySlug((await params).slug);
  return stay
    ? { title: stay.name, description: stay.description }
    : { title: "Stay not found" };
}

export default async function StayPage({ params, searchParams }: StayPageProps) {
  const { slug } = await params;
  const rawQuery = await searchParams;
  const preliminaryQuery = parseSearchQuery(rawQuery);
  const requestedDatesAreValid = preliminaryQuery.errors.length === 0 && preliminaryQuery.nights !== null;
  const stay = await getPublishedStayBySlug(
    slug,
    requestedDatesAreValid ? preliminaryQuery.values : undefined,
  );
  if (!stay) notFound();

  const query = parseSearchQuery({ ...rawQuery, location: stay.location });
  const validDates = query.errors.length === 0 && query.nights !== null && stay.isAvailable === true;
  const nights = validDates ? query.nights : null;
  const price = nights ? stay.pricing : null;
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <StayBaliLogo />
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition hover:bg-secondary"
            href="/search"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to search
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link className="hover:text-primary" href="/">Home</Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <Link className="hover:text-primary" href="/search">Stays</Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="truncate text-foreground">{stay.name}</span>
        </nav>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1 text-xs font-bold text-success">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Verified property
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                {stay.type}
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-foreground sm:text-5xl">
              {stay.name}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {stay.area}
            </p>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            From <strong className="text-xl text-foreground">{formatIdr(stay.pricePerNight)}</strong> / night
          </p>
        </div>

        <section className="relative grid h-[360px] grid-cols-1 gap-1 overflow-hidden rounded-3xl bg-secondary sm:h-[520px] md:grid-cols-[2fr_1fr]" aria-label="Property gallery">
          <div className="group relative overflow-hidden">
            <Image fill priority alt={`${stay.name} in ${stay.area}`} className="object-cover transition duration-700 group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 67vw" src={stay.images[0]} />
          </div>
          <div className="hidden grid-rows-2 gap-1 md:grid">
            {(stay.images.slice(1, 3).length ? stay.images.slice(1, 3) : [stay.images[0], stay.images[0]]).map((image, index) => <div className="relative overflow-hidden" key={`${image}-${index}`}><Image fill alt={`${stay.name} gallery view ${index + 2}`} className="object-cover transition duration-700 hover:scale-[1.03]" sizes="33vw" src={image} /></div>)}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <span className="absolute right-5 bottom-5 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-foreground shadow-sm backdrop-blur-sm">{stay.images.length} photos</span>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            <section className="border-b border-border pb-8">
              <p className="mb-3 text-sm font-bold tracking-[0.12em] text-primary uppercase">A considered Bali stay</p>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em]">Space to settle in and slow down.</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{stay.description}</p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-foreground">
                <span className="inline-flex items-center gap-2"><UsersRound className="size-5 text-primary" />Up to {stay.guests} guests</span>
                <span className="inline-flex items-center gap-2"><BedDouble className="size-5 text-primary" />{stay.bed}</span>
                <span className="inline-flex items-center gap-2"><Coffee className="size-5 text-primary" />Breakfast available</span>
              </div>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="font-display text-2xl font-bold">What this place offers</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {stay.amenities.map((amenity) => (
                  <span className="flex items-center gap-3 text-sm font-medium" key={amenity}>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-teal-subtle text-primary"><Check className="size-4" /></span>
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <section className="py-8" id="rooms">
              <h2 className="font-display text-2xl font-bold">Choose your room</h2>
              <article className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-primary">Best available option</p>
                    <h3 className="font-display mt-1 text-xl font-bold">{stay.roomName}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{stay.bed} · Up to {stay.guests} guests · Breakfast available</p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-success"><Sparkles className="size-4" />{stay.highlight}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-xl font-extrabold">{formatIdr(stay.pricePerNight)}</p>
                    <p className="text-xs text-muted-foreground">per night</p>
                  </div>
                </div>
              </article>
            </section>
          </div>

          <aside className="rounded-3xl border border-border bg-white p-6 shadow-search lg:sticky lg:top-6" aria-label="Booking summary">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <p><strong className="text-2xl">{formatIdr(stay.pricePerNight)}</strong> <span className="text-sm text-muted-foreground">/ night</span></p>
              <span className="text-xs font-bold text-success">Best available rate</span>
            </div>

            {price && nights ? (
              <>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-secondary/50">
                  <div className="border-r border-border p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Check-in</span>
                    <p className="mt-1 text-sm font-semibold">{formatStayDate(query.values.checkin)}</p>
                  </div>
                  <div className="p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Check-out</span>
                    <p className="mt-1 text-sm font-semibold">{formatStayDate(query.values.checkout)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-secondary/50">
                  <div className="border-r border-border p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Adults</span>
                    <p className="mt-1 text-sm font-semibold">{query.values.guests}</p>
                  </div>
                  <div className="p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Children</span>
                    <p className="mt-1 text-sm font-semibold">{query.values.children}</p>
                  </div>
                </div>

                <Link className="block text-center text-xs font-bold text-primary hover:underline" href={`/stays/${stay.slug}`}>Change dates</Link>

                <div className="space-y-3 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{nights} {nights === 1 ? "night" : "nights"}</span><span>{formatIdr(price.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(price.serviceFee)}</span></div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold"><span>Total</span><span>{formatIdr(price.grandTotal)}</span></div>
                  <QuoteButton adults={query.values.guests} checkin={query.values.checkin} checkout={query.values.checkout} childGuests={query.values.children} slug={stay.slug} />
                </div>
              </>
            ) : (
              <form action={`/stays/${stay.slug}`} method="get" className="space-y-4">
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
                  <label className="border-r border-border p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Check-in</span>
                    <input className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" defaultValue={query.values.checkin} name="checkin" required type="date" />
                  </label>
                  <label className="p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Check-out</span>
                    <input className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" defaultValue={query.values.checkout} name="checkout" required type="date" />
                  </label>
                </div>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
                  <label className="border-r border-border p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Adults</span>
                    <select className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" defaultValue={String(query.values.guests)} name="guests">
                      {Array.from({ length: stay.guests }, (_, index) => index + 1).map((guest) => <option key={guest} value={guest}>{guest}</option>)}
                    </select>
                  </label>
                  <label className="p-3">
                    <span className="block text-[11px] font-bold uppercase text-muted-foreground">Children</span>
                    <select className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" defaultValue={String(query.values.children)} name="children">
                      {Array.from({ length: stay.children + 1 }, (_, count) => <option key={count} value={count}>{count}</option>)}
                    </select>
                  </label>
                </div>

                {query.errors.length > 0 ? <p className="text-sm font-semibold text-warning">{query.errors[0]}</p> : null}
                {requestedDatesAreValid && stay.isAvailable === false ? <p className="rounded-xl bg-warning-subtle p-3 text-sm font-semibold text-warning">This stay is not available for every selected night. Try another date range.</p> : null}

                <button className="min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-hover" type="submit">Check availability</button>
              </form>
            )}

            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />Your total is shown before payment.</p>
              <p className="flex gap-2"><Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />Free cancellation until 3 days before check-in.</p>
              <p className="flex gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />Selected dates are checked before checkout.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
