import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/landing/property-card";
import { StayBaliLogo } from "@/components/landing/public-header";
import { SearchPanel } from "@/components/landing/search-panel";
import { formatIdr } from "@/lib/demo-stays";
import { searchPublishedStays } from "@/lib/public/catalog";
import { parseSearchQuery } from "@/lib/search-query";

export const metadata: Metadata = {
  title: "Search stays",
  description: "Find villas, hotels, and homestays across Bali.",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const locationLabels: Record<string, string> = {
  all: "Across Bali",
  ubud: "Ubud",
  canggu: "Canggu",
  seminyak: "Seminyak",
  uluwatu: "Uluwatu",
  sanur: "Sanur",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = parseSearchQuery(await searchParams);
  const { values, nights, errors } = query;

  const stays = await searchPublishedStays(values);

  const hasValidStayDates = errors.length === 0 && nights !== null;
  const stayQuery = new URLSearchParams();
  if (values.checkin) stayQuery.set("checkin", values.checkin);
  if (values.checkout) stayQuery.set("checkout", values.checkout);
  stayQuery.set("guests", String(values.guests));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <StayBaliLogo />
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-foreground transition hover:bg-secondary"
            href="/"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
        </div>
      </header>

      <section className="border-b border-border bg-brand-sand py-6 sm:py-8">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <SearchPanel
            compact
            initialValues={{
              location: values.location,
              checkin: values.checkin,
              checkout: values.checkout,
              guests: String(values.guests),
            }}
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-bold tracking-[0.12em] text-primary uppercase">
              {values.location === "all" ? locationLabels.all : `${locationLabels[values.location]}, Bali`}
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">
              {stays.length} {stays.length === 1 ? "stay" : "stays"} found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasValidStayDates
                ? `${nights} ${nights === 1 ? "night" : "nights"} · ${values.guests} ${values.guests === 1 ? "guest" : "guests"} · Published catalog match`
                : "Choose valid dates to check availability."}
            </p>
          </div>

          <form className="flex flex-wrap gap-3" action="/search" method="get">
            <input name="location" type="hidden" value={values.location} />
            <input name="checkin" type="hidden" value={values.checkin} />
            <input name="checkout" type="hidden" value={values.checkout} />
            <input name="guests" type="hidden" value={values.guests} />
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <Filter className="size-4 text-primary" aria-hidden="true" />
              <span className="sr-only">Property type</span>
              <select
                className="bg-transparent outline-none"
                defaultValue={values.type}
                name="type"
              >
                <option value="all">All property types</option>
                <option value="villa">Villa</option>
                <option value="hotel">Hotel</option>
                <option value="homestay">Homestay</option>
              </select>
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
              <span className="sr-only">Sort results</span>
              <select
                className="bg-transparent outline-none"
                defaultValue={values.sort}
                name="sort"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
            <button
              className="min-h-11 rounded-xl bg-foreground px-5 text-sm font-bold text-white transition hover:bg-primary"
              type="submit"
            >
              Apply
            </button>
          </form>
        </div>

        {errors.length > 0 ? (
          <div className="mb-8 rounded-2xl border border-warning/30 bg-warning-subtle p-4 text-sm text-warning" role="alert">
            <p className="font-bold">Please update your search.</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        ) : null}

        {stays.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {stays.map((stay) => (
              <PropertyCard
                key={stay.slug}
                area={stay.area}
                guests={stay.guests}
                highlight={stay.highlight}
                href={`/stays/${stay.slug}?${stayQuery.toString()}`}
                image={stay.image}
                name={stay.name}
                price={formatIdr(stay.pricePerNight)}
                type={stay.type}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              No stays match this search
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Try another Bali area, reduce the guest count, or show all property types.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
              href="/"
            >
              Start a new search
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
