import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/landing/property-card";
import { StayBaliLogo } from "@/components/landing/public-header";
import { SearchPanel } from "@/components/landing/search-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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

  const result = await searchPublishedStays(values);
  const { stays, total, page, totalPages } = result;

  const hasValidStayDates = errors.length === 0 && nights !== null;
  const stayQuery = new URLSearchParams();
  if (values.checkin) stayQuery.set("checkin", values.checkin);
  if (values.checkout) stayQuery.set("checkout", values.checkout);
  stayQuery.set("guests", String(values.guests));
  stayQuery.set("children", String(values.children));

  function pageHref(targetPage: number) {
    const params = new URLSearchParams({
      location: values.location,
      checkin: values.checkin,
      checkout: values.checkout,
      guests: String(values.guests),
      children: String(values.children),
      type: values.type,
      sort: values.sort,
      pageSize: String(values.pageSize),
      page: String(targetPage),
    });
    if (values.minPrice !== null) params.set("minPrice", String(values.minPrice));
    if (values.maxPrice !== null) params.set("maxPrice", String(values.maxPrice));
    return `/search?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <StayBaliLogo />
          <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
          </Button>
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
              children: String(values.children),
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
              {total} {total === 1 ? "stay" : "stays"} found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasValidStayDates
                ? `${nights} ${nights === 1 ? "night" : "nights"} · ${values.guests} adults · ${values.children} children · Available for every night`
                : "Choose valid dates to check availability."}
            </p>
          </div>

          <form className="flex flex-wrap gap-3" action="/search" method="get">
            <input name="location" type="hidden" value={values.location} />
            <input name="checkin" type="hidden" value={values.checkin} />
            <input name="checkout" type="hidden" value={values.checkout} />
            <input name="guests" type="hidden" value={values.guests} />
            <input name="children" type="hidden" value={values.children} />
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <Filter className="size-4 text-primary" aria-hidden="true" />
              <span className="sr-only">Property type</span>
              <NativeSelect
                className="h-auto border-0 bg-transparent p-0 pr-7 shadow-none focus-visible:ring-0"
                defaultValue={values.type}
                name="type"
                wrapperClassName="w-auto"
              >
                <option value="all">All property types</option>
                <option value="villa">Villa</option>
                <option value="hotel">Hotel</option>
                <option value="homestay">Homestay</option>
              </NativeSelect>
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <span className="sr-only">Minimum nightly price</span>
              <Input className="h-auto w-28 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" defaultValue={values.minPrice ?? ""} min={0} name="minPrice" placeholder="Min IDR" type="number" />
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <span className="sr-only">Maximum nightly price</span>
              <Input className="h-auto w-28 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" defaultValue={values.maxPrice ?? ""} min={1} name="maxPrice" placeholder="Max IDR" type="number" />
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
              <span className="sr-only">Sort results</span>
              <NativeSelect
                className="h-auto border-0 bg-transparent p-0 pr-7 shadow-none focus-visible:ring-0"
                defaultValue={values.sort}
                name="sort"
                wrapperClassName="w-auto"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </NativeSelect>
            </label>
            <label className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-3 text-sm font-semibold">
              <span className="sr-only">Results per page</span>
              <NativeSelect className="h-auto border-0 bg-transparent p-0 pr-7 shadow-none focus-visible:ring-0" defaultValue={values.pageSize} name="pageSize" wrapperClassName="w-auto">
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
              </NativeSelect>
            </label>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>
        </div>

        {errors.length > 0 ? (
          <Alert className="mb-8" variant="warning">
            <AlertTitle>Please update your search.</AlertTitle>
            <AlertDescription>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {stays.length > 0 ? (
          <>
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
            {totalPages > 1 ? (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Search result pages">
                {page > 1 ? <Button asChild size="sm" variant="outline"><Link href={pageHref(page - 1)}>Previous</Link></Button> : null}
                <span className="px-2 text-sm font-semibold text-muted-foreground">Page {page} of {totalPages}</span>
                {page < totalPages ? <Button asChild size="sm" variant="outline"><Link href={pageHref(page + 1)}>Next</Link></Button> : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              No stays match this search
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Try another Bali area, reduce the guest count, or show all property types.
            </p>
            <Button asChild className="mt-6"><Link href="/">Start a new search</Link></Button>
          </div>
        )}
      </div>
    </main>
  );
}
