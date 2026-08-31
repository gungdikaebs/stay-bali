"use client";

import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#stays", label: "Explore stays" },
  { href: "#why-staybali", label: "Why StayBali" },
  { href: "#partners", label: "For partners" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Open navigation"
        className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-foreground/55 p-4 backdrop-blur-sm md:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <m.nav
              animate={{ opacity: 1, y: 0 }}
              aria-label="Mobile navigation"
              className="ml-auto max-w-sm rounded-3xl bg-white p-5 text-foreground shadow-search"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: -12 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-xl font-extrabold">Menu</span>
                <button
                  aria-label="Close navigation"
                  className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-1">
                {links.map((link) => (
                  <Link
                    className="flex min-h-12 items-center rounded-xl px-4 font-bold transition hover:bg-secondary"
                    href={link.href}
                    key={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary-hover"
                href="/sign-in"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            </m.nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
