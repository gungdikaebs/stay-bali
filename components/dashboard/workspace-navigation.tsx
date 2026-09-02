"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  Compass,
  House,
  LayoutDashboard,
  MailWarning,
  Menu,
  Users,
  X,
} from "lucide-react";
import { StayBaliLogo } from "@/components/landing/public-header";
import { cn } from "@/lib/utils";

export type WorkspaceKind = "admin" | "partner" | "traveler";

const navigation = {
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/partners", label: "Partners", icon: Users },
    { href: "/admin/properties", label: "Properties", icon: Building2 },
    { href: "/admin/bookings", label: "Reservations", icon: CalendarCheck2 },
    { href: "/admin/jobs", label: "Notification jobs", icon: MailWarning },
  ],
  partner: [
    { href: "/partner", label: "Overview", icon: LayoutDashboard },
    { href: "/partner/properties", label: "Properties", icon: Building2 },
    { href: "/partner/bookings", label: "Reservations", icon: CalendarCheck2 },
  ],
  traveler: [
    { href: "/account", label: "My trips", icon: House },
    { href: "/search?location=all&guests=2", label: "Explore stays", icon: Compass },
  ],
} satisfies Record<WorkspaceKind, Array<{ href: string; label: string; icon: typeof House }>>;

function isActive(pathname: string, href: string) {
  const cleanHref = href.split("?")[0];
  if (cleanHref === "/admin" || cleanHref === "/partner" || cleanHref === "/account") {
    return pathname === cleanHref;
  }
  return pathname.startsWith(cleanHref);
}

export function WorkspaceNavigation({ kind, className, onNavigate }: { kind: WorkspaceKind; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1.5", className)} aria-label={`${kind} workspace navigation`}>
      {navigation[kind].map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-foreground text-white shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            href={href}
            key={href}
            onClick={onNavigate}
          >
            <Icon className={cn("size-[18px]", active ? "text-[#8ce0d4]" : "text-muted-foreground group-hover:text-primary")} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceMobileMenu({ kind, label }: { kind: WorkspaceKind; label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Open workspace navigation"
        className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Workspace navigation">
          <button className="absolute inset-0 bg-foreground/35 backdrop-blur-sm" onClick={() => setOpen(false)} type="button" aria-label="Close workspace navigation" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col overflow-y-auto overscroll-contain bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <StayBaliLogo />
              <button className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary" onClick={() => setOpen(false)} type="button" aria-label="Close navigation">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 rounded-2xl border border-primary/10 bg-brand-teal-subtle p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Workspace</p>
              <p className="font-display mt-1 text-lg font-extrabold text-foreground">{label}</p>
            </div>
            <WorkspaceNavigation className="mt-6" kind={kind} onNavigate={() => setOpen(false)} />
            <Link className="mt-auto flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground" href="/" onClick={() => setOpen(false)}>
              <Compass className="size-[18px] text-primary" aria-hidden="true" />
              View public website
            </Link>
          </aside>
        </div>
      ) : null}
    </>
  );
}
