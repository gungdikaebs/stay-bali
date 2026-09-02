"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/landing/mobile-menu";

export function StayBaliLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-display text-2xl font-extrabold tracking-[-0.04em] ${
        inverted ? "text-white" : "text-foreground"
      }`}
      aria-label="StayBali home"
    >
      Stay<span className={inverted ? "text-[#8ce0d4]" : "text-primary"}>Bali</span>
      <span className={inverted ? "text-[#ffb7a8]" : "text-brand-coral"}>.</span>
    </Link>
  );
}

type PublicHeaderProps = {
  variant?: "overlay" | "solid";
};

export function PublicHeader({ variant = "overlay" }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "overlay") return;

    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [variant]);

  const inverted = variant === "overlay" && !scrolled;

  return (
    <header
      data-inverted={inverted}
      data-variant={variant}
      className={`inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow,color] duration-300 ${
        variant === "overlay" ? "fixed" : "sticky"
      } ${
        inverted
          ? "bg-transparent text-white"
          : "border-b border-border/80 bg-white/95 text-foreground shadow-[0_10px_30px_rgba(10,38,31,0.06)] backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between gap-5 px-4 sm:px-6 lg:h-24 lg:px-8">
        <StayBaliLogo inverted={inverted} />

        <nav
          className={`hidden items-center gap-8 text-sm font-semibold lg:flex ${
            inverted ? "text-white/85" : "text-muted-foreground"
          }`}
          aria-label="Main navigation"
        >
          <Link className={`py-2 transition ${inverted ? "hover:text-white" : "hover:text-primary"}`} href="/search?location=all&guests=2">
            Explore stays
          </Link>
          <Link className={`py-2 transition ${inverted ? "hover:text-white" : "hover:text-primary"}`} href="/#destinations">
            Destinations
          </Link>
          <details className="group relative">
            <summary className={`flex cursor-pointer list-none items-center gap-1.5 py-2 transition [&::-webkit-details-marker]:hidden ${inverted ? "hover:text-white" : "hover:text-primary"}`}>
              Stay types
              <ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute top-[calc(100%+0.75rem)] left-0 w-64 rounded-2xl border border-black/5 bg-white p-2 text-foreground shadow-[0_20px_60px_rgba(5,24,19,0.22)]">
              {[
                ["Private villas", "villa", "Space, privacy, and poolside days"],
                ["Hotels", "hotel", "Full-service stays across Bali"],
                ["Homestays", "homestay", "Smaller stays with local character"],
              ].map(([label, type, description]) => (
                <Link
                  className="block rounded-xl px-3 py-3 transition hover:bg-secondary"
                  href={`/search?location=all&type=${type}&guests=2`}
                  key={type}
                >
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="mt-0.5 block text-xs font-medium leading-5 text-muted-foreground">
                    {description}
                  </span>
                </Link>
              ))}
            </div>
          </details>
          <Link className={`py-2 transition ${inverted ? "hover:text-white" : "hover:text-primary"}`} href="/#why-staybali">
            Why StayBali
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className={`hidden px-2 py-2 text-sm font-semibold transition xl:inline-flex ${
              inverted ? "text-white/85 hover:text-white" : "text-muted-foreground hover:text-primary"
            }`}
            href="/#partners"
          >
            For partners
          </Link>
          <Link
            className={`hidden min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition sm:inline-flex ${
              inverted
                ? "border-white/25 bg-black/10 text-white backdrop-blur-sm hover:bg-white/15"
                : "border-border bg-white text-foreground hover:border-primary/35 hover:text-primary"
            }`}
            href="/sign-in"
          >
            <UserRound className="size-[18px]" aria-hidden="true" />
            <span className="hidden xl:inline">Sign in</span>
          </Link>
          <Link
            className={`hidden min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold shadow-sm transition sm:inline-flex ${
              inverted
                ? "bg-white text-primary hover:bg-[#e8f7f4]"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
            href="/search?location=all&guests=2"
          >
            Find a stay
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <MobileMenu inverted={inverted} />
        </div>
      </div>
    </header>
  );
}
