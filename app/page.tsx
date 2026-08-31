import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { PropertyCard } from "@/components/landing/property-card";
import {
  HeroMedia,
  HeroReveal,
  HomeMotion,
  ScrollReveal,
} from "@/components/landing/home-motion";
import {
  PublicHeader,
  StayBaliLogo,
} from "@/components/landing/public-header";
import { SearchPanel } from "@/components/landing/search-panel";
import { formatIdr } from "@/lib/demo-stays";
import { listFeaturedPublishedStays } from "@/lib/public/catalog";

const areas = [
  {
    name: "Ubud",
    slug: "ubud",
    description: "Jungle calm, culture, and slow mornings",
    image: "/images/stay-ubud.jpg",
  },
  {
    name: "Canggu",
    slug: "canggu",
    description: "Creative energy near Bali's west coast",
    image: "/images/stay-canggu.jpg",
  },
  {
    name: "Uluwatu",
    slug: "uluwatu",
    description: "Cliff views and memorable sunsets",
    image: "/images/stay-uluwatu.jpg",
  },
];

function AreaCard({ area }: { area: (typeof areas)[number] }) {
  return (
    <Link className="group relative block min-h-72 overflow-hidden rounded-2xl bg-foreground" href={`/search?location=${area.slug}&guests=2`} aria-label={`Explore stays in ${area.name}`}>
      <Image
        fill
        alt={`Accommodation inspiration for ${area.name}, Bali`}
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
        src={area.image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="mb-1 text-sm font-semibold text-white/75">Explore</p>
        <h3 className="font-display mb-2 text-3xl font-extrabold tracking-[-0.04em]">
          {area.name}
        </h3>
        <p className="max-w-xs text-sm leading-6 text-white/80">
          {area.description}
        </p>
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
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
        {icon}
      </span>
      <span>
        <strong className="font-display mb-1 block text-base text-white">
          {title}
        </strong>
        <span className="block text-sm leading-6 text-white/70">
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
        <h3 className="font-display text-xl font-bold">Published stays are being prepared</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Approved Partner properties will appear here automatically.
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
        priority={index < 4}
        type={stay.type}
      />
    </ScrollReveal>
  ));
}

function StayGridFallback() {
  return Array.from({ length: 4 }, (_, index) => (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-white" key={index}>
      <div className="aspect-[4/3] bg-secondary" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/5 rounded bg-secondary" />
        <div className="h-6 w-4/5 rounded bg-secondary" />
        <div className="h-16 rounded-xl bg-secondary" />
      </div>
    </div>
  ));
}

export default function Home() {
  return (
    <HomeMotion>
    <main className="overflow-hidden">
      <section className="relative min-h-[720px] bg-foreground lg:min-h-[700px]">
        <HeroMedia>
          <Image
            fill
            priority
            alt="Private Bali villa pool overlooking a tropical sunset"
            className="object-cover object-[62%_center]"
            sizes="100vw"
            src="/images/hero-bali-villa.jpg"
          />
        </HeroMedia>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,24,0.9)_0%,rgba(10,28,24,0.68)_42%,rgba(10,28,24,0.16)_75%,rgba(10,28,24,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" />

        <PublicHeader />

        <div className="relative z-10 mx-auto flex min-h-[720px] w-full min-w-0 max-w-[1280px] flex-col justify-center px-4 pt-28 pb-10 sm:px-6 lg:min-h-[700px] lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <HeroReveal delay={0.12}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="size-4 text-[#ffb7a8]" aria-hidden="true" />
                Local stays, thoughtfully presented
              </span>
            </HeroReveal>
            <HeroReveal delay={0.22}>
              <h1 className="font-display max-w-3xl text-[38px] leading-[1.08] font-extrabold tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-[72px]">
                Find your place in Bali.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.34}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-white/[0.82] sm:text-xl">
                Verified stays, clear prices, and real availability—built for a
                calmer way to book across Bali.
              </p>
            </HeroReveal>
          </div>

          <HeroReveal className="mt-10 max-w-[1180px]" delay={0.46}>
            <SearchPanel />
            <p className="mt-3 flex items-center gap-2 text-sm text-white/[0.72]">
              <Clock3 className="size-4" aria-hidden="true" />
              Browse all Bali now, or add dates when you are ready.
            </p>
          </HeroReveal>

          <div className="mt-10 grid max-w-4xl gap-3 text-sm text-white/80 sm:grid-cols-3">
            <HeroReveal className="flex items-center gap-2" delay={0.58}>
              <ShieldCheck className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Properties reviewed before publishing
            </HeroReveal>
            <HeroReveal className="flex items-center gap-2" delay={0.66}>
              <WalletCards className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Full IDR price shown before payment
            </HeroReveal>
            <HeroReveal className="flex items-center gap-2" delay={0.74}>
              <CalendarCheck2 className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Availability checked for every night
            </HeroReveal>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20" id="stays">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Published stays
              </span>
              <h2 className="font-display max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Find a stay that is ready to explore.
              </h2>
            </div>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary" href="/search?location=all&guests=2">View all stays<ArrowRight className="size-4" /></Link>
          </ScrollReveal>

          <div className="mb-7 flex flex-wrap gap-2" aria-label="Quick property filters">
            <Link className="rounded-full bg-foreground px-4 py-2 text-sm font-bold text-white" href="/search?location=all&guests=2">All stays</Link>
            {[["Villas", "villa"], ["Hotels", "hotel"], ["Homestays", "homestay"]].map(([label, type]) => <Link className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary" href={`/search?location=all&type=${type}&guests=2`} key={type}>{label}</Link>)}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <Suspense fallback={<StayGridFallback />}>
              <PublishedStayGrid />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                Explore by destination
              </p>
              <h2 className="font-display max-w-2xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Start with the area that matches your rhythm.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              From quiet mornings in Ubud to sunset stays in Uluwatu, each area offers a different side of Bali.
            </p>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-3">
            {areas.map((area, index) => (
              <ScrollReveal key={area.name} delay={index * 0.08}>
                <AreaCard area={area} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-white sm:py-24" id="why-staybali">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <ScrollReveal>
            <p className="mb-4 text-sm font-bold tracking-[0.14em] text-[#8ce0d4] uppercase">
              Clarity over pressure
            </p>
            <h2 className="font-display text-4xl leading-tight font-extrabold tracking-[-0.05em] text-balance sm:text-5xl">
              Designed to make booking feel straightforward.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              StayBali avoids fake urgency. Prices, cancellation terms, and booking
              status stay close to the decision you are making.
            </p>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <WalletCards className="size-5" aria-hidden="true" />, title: "Clear price breakdown", description: "Nightly rates, service fee, and total are shown together before payment." },
              { icon: <CalendarCheck2 className="size-5" aria-hidden="true" />, title: "Availability by date", description: "Every night in the selected range will be checked before checkout." },
              { icon: <ShieldCheck className="size-5" aria-hidden="true" />, title: "Reviewed properties", description: "Only properties approved by an administrator appear publicly." },
              { icon: <HeartHandshake className="size-5" aria-hidden="true" />, title: "Local partner workflow", description: "Local operators manage rooms and reservations from one clear workspace." },
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
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-bold tracking-[0.14em] text-[#bcece4] uppercase">
                  Built with local partners in mind
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  One place for properties, rooms, inventory, and reservations.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-white/75">
                  Keep rates, room availability, guest details, and reservations
                  organized in one simple workspace.
                </p>
              </div>
              <span className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-6 font-bold text-primary lg:self-center">
                Partner with StayBali
                <ArrowRight className="size-5" aria-hidden="true" />
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-sm">
              <StayBaliLogo />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Thoughtfully selected stays, transparent prices, and a simpler way
                to experience Bali.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm sm:grid-cols-3">
              <Link className="font-semibold text-foreground hover:text-primary" href="#stays">
                Explore
              </Link>
              <Link className="font-semibold text-foreground hover:text-primary" href="#why-staybali">
                How it works
              </Link>
              <Link className="font-semibold text-foreground hover:text-primary" href="#partners">
                Partners
              </Link>
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>© 2026 StayBali. All rights reserved.</span>
            <a
              className="hover:text-primary"
              href="https://www.pexels.com/"
              rel="noreferrer"
              target="_blank"
            >
              Photography by Pexels contributors
            </a>
          </div>
        </div>
      </footer>
    </main>
    </HomeMotion>
  );
}
