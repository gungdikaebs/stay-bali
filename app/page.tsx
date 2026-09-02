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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIdr } from "@/lib/demo-stays";
import { listFeaturedPublishedStays } from "@/lib/public/catalog";

const areas = [
  {
    name: "Ubud",
    slug: "ubud",
    description: "Jungle calm, culture, and slow mornings",
    image: "/images/stay-ubud.jpg",
    gridClassName: "lg:col-span-7 lg:row-span-2 lg:min-h-[580px]",
  },
  {
    name: "Canggu",
    slug: "canggu",
    description: "Creative energy near Bali's west coast",
    image: "/images/stay-canggu.jpg",
    gridClassName: "lg:col-span-5 lg:min-h-[278px]",
  },
  {
    name: "Uluwatu",
    slug: "uluwatu",
    description: "Cliff views and memorable sunsets",
    image: "/images/stay-uluwatu.jpg",
    gridClassName: "lg:col-span-5 lg:min-h-[278px]",
  },
  {
    name: "Seminyak",
    slug: "seminyak",
    description: "Dining, design, and an easy beach rhythm",
    image: "/images/stay-seminyak.jpg",
    gridClassName: "lg:col-span-6 lg:min-h-[320px]",
  },
  {
    name: "Sanur",
    slug: "sanur",
    description: "Calm shores and relaxed family days",
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
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">View stays<ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
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
    <main className="overflow-hidden">
      <section className="relative min-h-[760px] bg-foreground lg:min-h-[720px]">
        <HeroMedia>
          <Image
            fill
            preload
            alt="Private Bali villa pool overlooking a tropical sunset"
            className="object-cover object-[62%_center]"
            sizes="100vw"
            src="/images/hero-bali-villa.jpg"
          />
        </HeroMedia>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,24,0.92)_0%,rgba(10,28,24,0.72)_43%,rgba(10,28,24,0.18)_78%,rgba(10,28,24,0.3)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />

        <PublicHeader />

        <div className="relative z-10 mx-auto flex min-h-[760px] w-full min-w-0 max-w-[1280px] flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:min-h-[720px] lg:px-8 lg:pt-24 lg:pb-20">
          <div className="max-w-[760px]">
            <HeroReveal delay={0.12}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="size-4 text-[#ffb7a8]" aria-hidden="true" />
                Thoughtful stays across Bali
              </span>
            </HeroReveal>
            <HeroReveal delay={0.22}>
              <h1 className="font-display max-w-3xl text-[40px] leading-[1.06] font-extrabold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-[68px]">
                A more thoughtful way to stay in Bali.
              </h1>
            </HeroReveal>
            <HeroReveal delay={0.34}>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-white/[0.82] sm:text-xl">
                Discover reviewed villas, hotels, and homestays with transparent
                IDR prices and availability checked for every night.
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

        </div>
      </section>

      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:-mt-10 lg:px-8" aria-label="Booking assurances">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-2xl border border-border bg-white shadow-card sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Reviewed before publishing", description: "Only approved properties enter the public catalog." },
            { icon: WalletCards, title: "Clear IDR pricing", description: "Nightly rate, fee, and total stay close together." },
            { icon: CalendarCheck2, title: "Availability by night", description: "Every date in your stay is checked before booking." },
          ].map(({ icon: Icon, title, description }, index) => (
            <div className="flex gap-4 px-5 py-5 sm:px-6 sm:py-6 sm:not-last:border-r sm:not-last:border-border" key={title}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><Icon className="size-5" aria-hidden="true" /></span>
              <span>
                <strong className="font-display block text-sm font-extrabold text-foreground">{title}</strong>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
              </span>
              <span className="sr-only">Assurance {index + 1} of 3</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background pt-20 pb-16 sm:pt-24 sm:pb-20" id="stays">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-primary uppercase">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Published stays
              </span>
              <h2 className="font-display max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-balance text-foreground sm:text-4xl">
                Stays selected for a clearer booking experience.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Browse published properties with real room options, clear capacity, and server-calculated prices.</p>
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
              From quiet mornings in Ubud to sunset stays in Uluwatu, every area offers a distinct way to experience the island.
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
            <ol className="mt-8 max-w-xl border-y border-white/15 py-2">
              {[
                ["01", "Search", "Choose an area, dates, and guests."],
                ["02", "Review", "Compare real room details and the full price."],
                ["03", "Book", "Reserve securely and keep your booking record."],
              ].map(([number, title, description], index) => (
                <li className="grid grid-cols-[36px_88px_1fr] items-center gap-3 py-3 text-sm" key={number}>
                  <span className="font-display text-xs font-extrabold text-[#8ce0d4]">{number}</span>
                  <strong className="font-display text-white">{title}</strong>
                  <span className="leading-5 text-white/60">{description}</span>
                  {index < 2 ? <Separator className="col-span-3 bg-white/10" /> : null}
                </li>
              ))}
            </ol>
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
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-bold tracking-[0.14em] text-[#bcece4] uppercase">
                  Built with local partners in mind
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
                  Run your Bali property with one connected workspace.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-white/75">
                  Keep rates, room availability, guest details, and reservations
                  organized in one simple workspace.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <Button asChild className="bg-white text-primary hover:bg-brand-teal-subtle" size="lg"><Link href="/partner-application">Apply as a partner<ArrowRight className="size-5" aria-hidden="true" /></Link></Button>
                <Link className="text-xs text-white/70 underline-offset-4 hover:text-white hover:underline" href="/sign-in?callbackUrl=/partner">Already approved? Sign in</Link>
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
                Thoughtfully selected stays, transparent prices, and a simpler way
                to experience Bali.
              </p>
            </div>
            <div><p className="mb-4 text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Explore</p><div className="grid gap-3 text-sm font-semibold"><Link className="hover:text-primary" href="/search?location=all&guests=2">All stays</Link><Link className="hover:text-primary" href="#destinations">Destinations</Link><Link className="hover:text-primary" href="#stays">Published stays</Link></div></div>
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
              Photography by Pexels contributors
            </a>
          </div>
        </div>
      </footer>
    </main>
    </HomeMotion>
  );
}
