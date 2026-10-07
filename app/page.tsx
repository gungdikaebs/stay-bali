import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { PropertyCard } from "@/components/landing/property-card";
import {
  HeroReveal,
  HeroVideo,
  HomeMotion,
  ScrollReveal,
} from "@/components/landing/home-motion";
import { PageLoader } from "@/components/landing/page-loader";
import {
  PublicHeader,
  StayBaliLogo,
} from "@/components/landing/public-header";
import { SearchPanel } from "@/components/landing/search-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIdr } from "@/lib/demo-stays";
import { listFeaturedPublishedStays } from "@/lib/public/catalog";

const areas = [
  {
    name: "Ubud",
    slug: "ubud",
    description: "Lush jungles, cultural heritage, and peaceful mornings",
    image: "/images/stay-ubud.jpg",
    gridClassName: "lg:col-span-7 lg:row-span-2 lg:min-h-[580px]",
  },
  {
    name: "Canggu",
    slug: "canggu",
    description: "Surf breaks, vibrant cafes, and coastal sunsets",
    image: "/images/stay-canggu.jpg",
    gridClassName: "lg:col-span-5 lg:min-h-[278px]",
  },
  {
    name: "Uluwatu",
    slug: "uluwatu",
    description: "Dramatic ocean cliffs, world-class surf, and sunset views",
    image: "/images/stay-uluwatu.jpg",
    gridClassName: "lg:col-span-5 lg:min-h-[278px]",
  },
  {
    name: "Seminyak",
    slug: "seminyak",
    description: "Boutique shopping, fine dining, and lively beach clubs",
    image: "/images/stay-seminyak.jpg",
    gridClassName: "lg:col-span-6 lg:min-h-[320px]",
  },
  {
    name: "Sanur",
    slug: "sanur",
    description: "Calm waters, sunrise coastal walks, and relaxed stays",
    image: "/images/stay-sanur.jpg",
    gridClassName: "lg:col-span-6 lg:min-h-[320px]",
  },
];

function AreaCard({ area }: { area: (typeof areas)[number] }) {
  return (
    <Link className="group relative block h-full min-h-72 overflow-hidden rounded-2xl bg-foreground" href={`/search?location=${area.slug}&guests=2`} aria-label={`Explore stays in ${area.name}`}>
      <Image
        fill
        alt={`Accommodation inspiration for ${area.name}, Bali`}
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 58vw"
        src={area.image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5 transition duration-500 group-hover:from-black/85" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-white/75 uppercase"><MapPinned className="size-3.5" aria-hidden="true" />Explore Bali</p>
        <h3 className="font-display mb-2 text-3xl font-extrabold tracking-[-0.04em]">
          {area.name}
        </h3>
        <p className="max-w-xs text-sm leading-6 text-white/80">
          {area.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">Explore stays<ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

function TrustFeature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full gap-4 rounded-2xl border border-border/80 bg-white p-6 shadow-xs transition duration-300 hover:border-primary/30 hover:shadow-card sm:p-7">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary">
        {icon}
      </span>
      <span>
        <strong className="font-display mb-1 block text-base font-bold text-foreground">
          {title}
        </strong>
        <span className="block text-sm leading-6 text-muted-foreground">
          {description}
        </span>
      </span>
    </div>
  );
}

async function PublishedStayGrid() {
  const stays = await listFeaturedPublishedStays(8);

  if (!stays.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center sm:col-span-2 xl:col-span-4">
        <h3 className="font-display text-xl font-bold">No stays available right now</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          We are currently vetting properties across Bali. Check back soon or explore our featured destinations below.
        </p>
      </div>
    );
  }

  return stays.map((stay, index) => (
    <ScrollReveal key={stay.slug} delay={index * 0.05}>
      <PropertyCard
        area={stay.area}
        guests={stay.guests}
        highlight={stay.highlight}
        href={`/stays/${stay.slug}?guests=2`}
        image={stay.image}
        name={stay.name}
        price={formatIdr(stay.pricePerNight)}
        type={stay.type}
      />
    </ScrollReveal>
  ));
}

function StayGridFallback() {
  return Array.from({ length: 4 }, (_, index) => (
    <div className="overflow-hidden rounded-2xl border border-border bg-white" key={index}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  ));
}

export default function Home() {
  return (
    <HomeMotion>
      <PageLoader />
      <main className="overflow-hidden">
      <link
        rel="preload"
        as="image"
        href="/videos/homepage/hero-villa-poster.jpg"
        fetchPriority="high"
      />
      <section className="relative min-h-svh overflow-hidden bg-foreground">
        <HeroVideo />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,24,0.92)_0%,rgba(10,28,24,0.72)_43%,rgba(10,28,24,0.18)_78%,rgba(10,28,24,0.3)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />

        <PublicHeader />

        <div className="relative z-10 mx-auto flex min-h-svh w-full min-w-0 max-w-[1280px] flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-24 lg:pb-20">
          <div className="max-w-[760px]">
            <HeroReveal delay={0.16}>
              <h1 className="font-display max-w-3xl text-[40px] leading-[1.06] font-extrabold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-[68px]">
                A more thoughtful way to stay in Bali.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.28}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-white/[0.82] sm:text-xl">
                Discover places to stay across Bali, from private villas to boutique hotels and local homestays, all in one simple booking experience.
              </p>
            </HeroReveal>
          </div>

          <HeroReveal className="mt-10 max-w-[1180px]" delay={0.46}>
            <SearchPanel />
            <p className="mt-3 flex items-center gap-2 text-sm text-white/[0.72]">
              <Clock3 className="size-4" aria-hidden="true" />
              Flexible dates? Browse all stays across Bali, or add travel dates to check live rates.
            </p>
          </HeroReveal>

        </div>
      </section>

      <section className="bg-background pt-20 pb-16 sm:pt-24 sm:pb-20" id="stays">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Featured stays
              </span>
              <h2 className="font-display max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Handpicked stays with verified availability.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Browse verified properties with transparent IDR rates, confirmed guest capacities, and instant booking confirmation.</p>
            </div>
            <Button asChild variant="outline"><Link href="/search?location=all&guests=2">View all stays<ArrowRight className="size-4" /></Link></Button>
          </ScrollReveal>

          <div className="mb-7 flex gap-2 overflow-x-auto pb-1" aria-label="Quick property filters">
            <Button asChild className="rounded-full" size="sm" variant="secondary"><Link href="/search?location=all&guests=2">All stays</Link></Button>
            {[["Private villas", "villa"], ["Hotels", "hotel"], ["Homestays", "homestay"]].map(([label, type]) => <Button asChild className="rounded-full" key={type} size="sm" variant="outline"><Link href={`/search?location=all&type=${type}&guests=2`}>{label}</Link></Button>)}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <Suspense fallback={<StayGridFallback />}>
              <PublishedStayGrid />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="scroll-mt-28 bg-white py-20 sm:py-24" id="destinations">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                Explore by destination
              </p>
              <h2 className="font-display max-w-2xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Choose the Bali rhythm that feels like yours.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              From tranquil mornings in Ubud to clifftop sunsets in Uluwatu, explore the distinct character of each Bali destination.
            </p>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            {areas.map((area, index) => (
              <ScrollReveal className={area.gridClassName} key={area.name} delay={index * 0.08}>
                <AreaCard area={area} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/50 py-20 sm:py-24" id="why-staybali">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <ScrollReveal>
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-primary uppercase">
              Clarity over pressure
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              Booking designed for clarity, not urgency.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              No false countdowns, artificial scarcity, or surprise markups. We provide
              upfront IDR pricing, clear cancellation terms, and verified room details
              from search to checkout.
            </p>
            <div className="mt-8 grid max-w-xl gap-3">
              {[
                ["01", "Search", "Select your destination, travel dates, and guest count."],
                ["02", "Review", "Compare verified room photos, inclusions, and total pricing."],
                ["03", "Confirm", "Lock in your dates securely with instant booking confirmation."],
              ].map(([number, title, description]) => (
                <div
                  className="flex items-start gap-3.5 rounded-2xl border border-border/70 bg-white/80 p-4 shadow-2xs backdrop-blur-xs transition duration-200 hover:bg-white sm:items-center sm:py-3.5"
                  key={number}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-teal-subtle text-xs font-bold text-primary">
                    {number}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <strong className="text-sm font-bold text-foreground">
                      {title}
                    </strong>
                    <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs leading-5 text-muted-foreground sm:text-sm">
                      {description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <WalletCards className="size-5" aria-hidden="true" />, title: "Clear price breakdown", description: "See nightly rates, service fees, and total costs upfront before payment." },
              { icon: <CalendarCheck2 className="size-5" aria-hidden="true" />, title: "Availability by date", description: "Every night is verified directly against inventory to prevent double-booking." },
              { icon: <ShieldCheck className="size-5" aria-hidden="true" />, title: "Reviewed properties", description: "Only properties individually vetted and approved by our team appear publicly." },
              { icon: <HeartHandshake className="size-5" aria-hidden="true" />, title: "Local partner workflow", description: "Direct partnerships with verified local hosts ensure dependable stays." },
            ].map((feature, index) => (
              <ScrollReveal key={feature.title} delay={index * 0.07}>
                <TrustFeature {...feature} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-sand py-20 sm:py-24" id="partners">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="relative overflow-hidden rounded-[24px] bg-primary px-6 py-12 text-white shadow-card sm:px-10 lg:px-14 lg:py-16">
            <div className="absolute -top-32 -right-24 size-80 rounded-full border-[48px] border-white/5" />
            <div className="absolute -bottom-24 left-1/2 size-64 rounded-full bg-[#e8674c]/20 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-bold tracking-[0.14em] text-[#bcece4] uppercase">
                  For property hosts & managers
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  Run your Bali property with one connected workspace.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-white/75">
                  Manage seasonal rates, live calendar availability, guest bookings, and reservations
                  all from a single, intuitive dashboard.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <Button asChild className="bg-white text-primary hover:bg-brand-teal-subtle" size="lg"><Link href="/partner-application">Apply as a partner<ArrowRight className="size-5" aria-hidden="true" /></Link></Button>
                <Link className="text-xs text-white/70 underline-offset-4 hover:text-white hover:underline" href="/sign-in?callbackUrl=/partner">Already a partner? Sign in</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-border bg-white pt-14 pb-8">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
            <div className="max-w-sm">
              <StayBaliLogo />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Thoughtfully curated stays, transparent pricing, and a simpler way
                to experience Bali.
              </p>
            </div>
            <div><p className="mb-4 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Explore</p><div className="grid gap-3 text-sm font-semibold"><Link className="hover:text-primary" href="/search?location=all&guests=2">All stays</Link><Link className="hover:text-primary" href="#destinations">Destinations</Link><Link className="hover:text-primary" href="#stays">Featured stays</Link></div></div>
            <div><p className="mb-4 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Stay types</p><div className="grid gap-3 text-sm font-semibold"><Link className="hover:text-primary" href="/search?location=all&type=villa&guests=2">Private villas</Link><Link className="hover:text-primary" href="/search?location=all&type=hotel&guests=2">Hotels</Link><Link className="hover:text-primary" href="/search?location=all&type=homestay&guests=2">Homestays</Link></div></div>
            <div><p className="mb-4 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Account</p><div className="grid gap-3 text-sm font-semibold"><Link className="hover:text-primary" href="/account">My bookings</Link><Link className="hover:text-primary" href="/sign-up">Create account</Link><Link className="hover:text-primary" href="/sign-in">Sign in</Link><Link className="hover:text-primary" href="/partner-application">For partners</Link></div></div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>© 2026 StayBali. All rights reserved.</span>
            <a
              className="hover:text-primary"
              href="https://www.pexels.com/"
              rel="noreferrer"
              target="_blank"
            >
              Supporting photography by Pexels contributors
            </a>
          </div>
        </div>
      </footer>
    </main>
    </HomeMotion>
  );
}
