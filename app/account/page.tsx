import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Compass, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StayBaliLogo } from "@/components/landing/public-header";
import { requireTraveler } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "My bookings",
  description: "View and manage your StayBali bookings.",
};

export default async function AccountPage() {
  const traveler = await requireTraveler();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <StayBaliLogo />
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Traveler account</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">My bookings</h1><p className="mt-3 text-muted-foreground">Welcome, {traveler.name}. Your upcoming and previous Bali stays will appear here.</p></div>
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-teal-subtle text-primary"><UserRound className="size-5" /></span>
        </div>
        <section className="mt-10 rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary"><CalendarDays className="size-6" /></span>
          <h2 className="font-display mt-5 text-2xl font-bold">No bookings yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">When you reserve a stay, you&apos;ll find the dates, payment status, and arrival details here.</p>
          <Link className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href="/search"><Compass className="size-4" />Explore Bali stays</Link>
        </section>
      </div>
    </main>
  );
}
