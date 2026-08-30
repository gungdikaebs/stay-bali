import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
  PublicHeader,
  StayBaliLogo,
} from "@/components/landing/public-header";
import { SearchPanel } from "@/components/landing/search-panel";
import { demoStays, formatIdr } from "@/lib/demo-stays";

const areas = [
  {
    name: "Ubud",
    description: "Jungle calm, culture, and slow mornings",
    image: "/images/stay-ubud.jpg",
  },
  {
    name: "Canggu",
    description: "Creative energy near Bali's west coast",
    image: "/images/stay-canggu.jpg",
  },
  {
    name: "Uluwatu",
    description: "Cliff views and memorable sunsets",
    image: "/images/stay-uluwatu.jpg",
  },
];

function AreaCard({ area }: { area: (typeof areas)[number] }) {
  return (
    <article className="group relative min-h-72 overflow-hidden rounded-2xl bg-foreground">
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
    </article>
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

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[820px] bg-foreground lg:min-h-[780px]">
        <Image
          fill
          priority
          alt="Private Bali villa pool overlooking a tropical sunset"
          className="object-cover object-[62%_center]"
          sizes="100vw"
          src="/images/hero-bali-villa.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,24,0.9)_0%,rgba(10,28,24,0.68)_42%,rgba(10,28,24,0.16)_75%,rgba(10,28,24,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" />

        <PublicHeader />

        <div className="relative z-10 mx-auto flex min-h-[820px] w-full min-w-0 max-w-[1280px] flex-col justify-center px-4 pt-28 pb-10 sm:px-6 lg:min-h-[780px] lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <Sparkles className="size-4 text-[#ffb7a8]" aria-hidden="true" />
              Local stays, thoughtfully presented
            </span>
            <h1 className="font-display max-w-3xl text-[38px] leading-[1.08] font-extrabold tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-[72px]">
              Find your place in Bali.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-white/[0.82] sm:text-xl">
              Verified stays, clear prices, and real availability—built for a
              calmer way to book across Bali.
            </p>
          </div>

          <div className="mt-10 max-w-[1180px]">
            <SearchPanel />
            <p className="mt-3 flex items-center gap-2 text-sm text-white/[0.72]">
              <Clock3 className="size-4" aria-hidden="true" />
              Choose your dates to find a stay that fits your Bali plans.
            </p>
          </div>

          <div className="mt-10 grid max-w-4xl gap-3 text-sm text-white/80 sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Properties reviewed before publishing
            </span>
            <span className="flex items-center gap-2">
              <WalletCards className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Full IDR price shown before payment
            </span>
            <span className="flex items-center gap-2">
              <CalendarCheck2 className="size-5 text-[#8ce0d4]" aria-hidden="true" />
              Availability checked for every night
            </span>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                Bali, one stay at a time
              </p>
              <h2 className="font-display max-w-2xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Start with the area that matches your rhythm.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              From quiet mornings in Ubud to sunset stays in Uluwatu, each area
              offers a different side of Bali.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {areas.map((area) => (
              <AreaCard key={area.name} area={area} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24" id="stays">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Handpicked stays
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] text-foreground sm:text-4xl">
                Stays worth discovering across Bali.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              From peaceful hideaways to stays near Bali&apos;s favorite beaches,
              find a place that feels right for your trip.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {demoStays.slice(0, 4).map((stay) => (
              <PropertyCard
                key={stay.slug}
                area={stay.area}
                guests={stay.guests}
                highlight={stay.highlight}
                href={`/stays/${stay.slug}`}
                image={stay.image}
                name={stay.name}
                price={formatIdr(stay.pricePerNight)}
                type={stay.type}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-white sm:py-24" id="why-staybali">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TrustFeature
              icon={<WalletCards className="size-5" aria-hidden="true" />}
              title="Clear price breakdown"
              description="Nightly rates, service fee, and total are shown together before payment."
            />
            <TrustFeature
              icon={<CalendarCheck2 className="size-5" aria-hidden="true" />}
              title="Availability by date"
              description="Every night in the selected range will be checked before checkout."
            />
            <TrustFeature
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
              title="Reviewed properties"
              description="Only properties approved by an administrator appear publicly."
            />
            <TrustFeature
              icon={<HeartHandshake className="size-5" aria-hidden="true" />}
              title="Local partner workflow"
              description="Local operators manage rooms and reservations from one clear workspace."
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-sand py-20 sm:py-24" id="partners">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] bg-primary px-6 py-12 text-white shadow-card sm:px-10 lg:px-14 lg:py-16">
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
          </div>
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
  );
}
