"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, CalendarCheck2, LogIn, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const browseLinks = [
  { href: "/search?location=all&guests=2", label: "All stays" },
  { href: "#destinations", label: "Destinations" },
  { href: "/search?location=all&type=villa&guests=2", label: "Private villas" },
  { href: "/search?location=all&type=hotel&guests=2", label: "Hotels" },
  { href: "/search?location=all&type=homestay&guests=2", label: "Homestays" },
];

const aboutLinks = [
  { href: "#why-staybali", label: "Why StayBali" },
  { href: "/partner-application", label: "List your property" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Open navigation"
        className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#071713]/65 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <m.nav
              animate={{ opacity: 1, x: 0 }}
              aria-label="Mobile navigation"
              aria-modal="true"
              className="ml-auto flex min-h-dvh w-[min(92vw,400px)] flex-col bg-white p-5 text-foreground shadow-search sm:p-6"
              exit={{ opacity: 0, x: 24 }}
              initial={{ opacity: 0, x: 24 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              transition={{ duration: 0.22 }}
            >
              <div className="mb-7 flex items-center justify-between border-b border-border pb-5">
                <span className="font-display text-2xl font-extrabold tracking-[-0.04em]">
                  Stay<span className="text-primary">Bali</span><span className="text-brand-coral">.</span>
                </span>
                <button
                  aria-label="Close navigation"
                  className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <p className="mb-2 px-3 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                Browse Bali
              </p>
              <div className="space-y-1">
                {browseLinks.map((link) => (
                  <Link
                    className="flex min-h-11 items-center justify-between rounded-xl px-3 font-bold transition hover:bg-secondary"
                    href={link.href}
                    key={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </div>

              <div className="my-5 border-t border-border" />
              <p className="mb-2 px-3 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                StayBali
              </p>
              <div className="space-y-1">
                {aboutLinks.map((link) => (
                  <Link
                    className="flex min-h-11 items-center justify-between rounded-xl px-3 font-bold transition hover:bg-secondary"
                    href={link.href}
                    key={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </div>

              <Link
                className="mt-5 flex items-center gap-3 rounded-2xl bg-secondary p-4 font-bold text-foreground transition hover:bg-[#e3f0ed]"
                href="/account"
                onClick={() => setOpen(false)}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary">
                  <CalendarCheck2 className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block">My bookings</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">View upcoming and past stays</span>
                </span>
              </Link>

              <div className="mt-auto grid gap-2 pt-6">
                <Link
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-hover"
                  href="/search?location=all&guests=2"
                  onClick={() => setOpen(false)}
                >
                  Find a stay
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <Link
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary bg-white px-5 font-bold text-primary transition hover:bg-brand-teal-subtle"
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Create account
                </Link>
                <Link
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 font-bold text-foreground transition hover:border-primary hover:text-primary"
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  Sign in
                </Link>
              </div>
            </m.nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
