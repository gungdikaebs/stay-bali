import Link from "next/link";
import { Menu, UserRound } from "lucide-react";

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

export function PublicHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <StayBaliLogo inverted />

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/90 md:flex" aria-label="Main navigation">
          <Link className="transition hover:text-white" href="#stays">
            Explore stays
          </Link>
          <Link className="transition hover:text-white" href="#why-staybali">
            Why StayBali
          </Link>
          <Link className="transition hover:text-white" href="#partners">
            For partners
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white/90 sm:inline-flex">
            Sign in
          </span>
          <button
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            type="button"
            aria-label="Open account menu"
          >
            <UserRound className="size-5" aria-hidden="true" />
          </button>
          <button
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:hidden"
            type="button"
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
