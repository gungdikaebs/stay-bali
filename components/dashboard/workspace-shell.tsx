import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, Compass, ShieldCheck, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WorkspaceMobileMenu, WorkspaceNavigation, type WorkspaceKind } from "@/components/dashboard/workspace-navigation";
import { StayBaliLogo } from "@/components/landing/public-header";

const workspaceMeta = {
  admin: {
    eyebrow: "Marketplace control",
    title: "Admin workspace",
    description: "Supply, reservations, and operations in one place.",
    icon: ShieldCheck,
  },
  partner: {
    eyebrow: "Property operations",
    title: "Partner workspace",
    description: "Manage your stays and guest operations.",
    icon: Building2,
  },
  traveler: {
    eyebrow: "Your StayBali account",
    title: "Traveler workspace",
    description: "Trips, payments, and arrival details.",
    icon: UserRound,
  },
} satisfies Record<WorkspaceKind, { eyebrow: string; title: string; description: string; icon: typeof ShieldCheck }>;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SB";
}

export function WorkspaceShell({
  kind,
  accountName,
  accountEmail,
  workspaceName,
  children,
}: {
  kind: WorkspaceKind;
  accountName: string;
  accountEmail: string;
  workspaceName?: string;
  children: ReactNode;
}) {
  const meta = workspaceMeta[kind];
  const Icon = meta.icon;
  const displayName = workspaceName ?? meta.title;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.07),transparent_28rem)] xl:grid xl:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto overscroll-contain border-r border-border/80 bg-white/95 px-5 py-6 xl:flex xl:flex-col">
        <div className="px-2"><StayBaliLogo /></div>
        <div className="mt-8 rounded-2xl border border-primary/10 bg-brand-teal-subtle p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><Icon className="size-5" aria-hidden="true" /></span>
          <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{meta.eyebrow}</p>
          <p className="font-display mt-1 line-clamp-2 text-lg font-extrabold tracking-[-0.025em]">{displayName}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{meta.description}</p>
        </div>
        <WorkspaceNavigation className="mt-7" kind={kind} />
        <div className="mt-auto space-y-4 pt-6">
          <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground" href="/">
            <Compass className="size-[18px] text-primary" aria-hidden="true" />
            View public website
          </Link>
          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-xs font-extrabold text-white">{initials(accountName)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{accountName}</p>
                <p className="truncate text-xs text-muted-foreground">{accountEmail}</p>
              </div>
            </div>
            <SignOutButton className="mt-3 w-full" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-7 lg:px-10 xl:px-12">
            <div className="flex min-w-0 items-center gap-3">
              <WorkspaceMobileMenu kind={kind} label={displayName} />
              <div className="xl:hidden"><StayBaliLogo /></div>
              <div className="hidden min-w-0 xl:block">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{meta.title}</p>
                <p className="mt-1 truncate text-sm font-bold">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block xl:hidden">
                <p className="max-w-48 truncate text-sm font-bold">{accountName}</p>
                <p className="max-w-48 truncate text-xs text-muted-foreground">{accountEmail}</p>
              </div>
              <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-xs font-extrabold text-white sm:flex xl:hidden">{initials(accountName)}</span>
              <div className="xl:hidden"><SignOutButton compact /></div>
            </div>
          </div>
        </header>
        <main className="px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10 xl:px-12">{children}</main>
      </div>
    </div>
  );
}
