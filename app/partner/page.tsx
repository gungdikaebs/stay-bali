import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Building2, CalendarCheck2, CheckCircle2, CirclePlus, Hotel } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getPartnerOverview } from "@/lib/partner/dashboard";

export const metadata: Metadata = {
  title: "Partner workspace",
};

export default async function PartnerPage() {
  const overview = await getPartnerOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        action={<Button asChild><Link href="/partner/properties/new"><CirclePlus className="size-4" aria-hidden="true" />Create property</Link></Button>}
        description="Track your published supply, prepare upcoming arrivals, and manage every reservation in your authenticated property scope."
        eyebrow="Partner overview"
        title={overview.businessName}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Partner metrics">
        <MetricCard accent="teal" helper={`${overview.pendingProperties} currently in review`} icon={Building2} label="Properties" value={overview.totalProperties} />
        <MetricCard accent="green" helper={`${overview.activeRooms} active room types`} icon={Hotel} label="Published stays" value={overview.publishedProperties} />
        <MetricCard accent="blue" helper="Confirmed or currently checked in" icon={CalendarCheck2} label="Active reservations" value={overview.activeReservations} />
        <MetricCard accent="neutral" helper={`${overview.completedStays} completed stays`} icon={BedDouble} label="Booked value" value={formatIdr(overview.bookedValue)} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Guest activity</p><h2 className="font-display mt-1 text-xl font-extrabold">Recent reservations</h2></div>
            <Button asChild size="sm" variant="outline"><Link href="/partner/bookings">View all</Link></Button>
          </div>
          {overview.recentBookings.length ? <div className="divide-y divide-border">{overview.recentBookings.map((booking) => (
            <article className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6" key={booking.id}>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary">{booking.bookingCode}</p><StatusBadge status={booking.status} /></div><h3 className="mt-2 truncate text-sm font-bold">{booking.guestName}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{booking.propertyName} · {booking.roomName}</p><p className="mt-2 text-xs font-semibold text-foreground">{formatStayDate(booking.checkinDate.toISOString().slice(0, 10))} → {formatStayDate(booking.checkoutDate.toISOString().slice(0, 10))}</p></div>
              <p className="text-sm font-extrabold tabular-nums sm:text-right">{formatIdr(booking.grandTotal)}</p>
            </article>
          ))}</div> : <EmptyState action={<Button asChild size="sm"><Link href="/partner/bookings">Create manual reservation</Link></Button>} description="Online and manual bookings for your properties will appear here." icon={CalendarCheck2} title="No reservations yet" />}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-primary/10 bg-brand-teal-subtle p-5 sm:p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><CheckCircle2 className="size-5" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Supply health</p>
            <h2 className="font-display mt-1 text-xl font-extrabold">{overview.publishedProperties} of {overview.totalProperties} properties live</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Complete photos, room information, and facilities before submitting a draft for Admin review.</p>
            <Button asChild className="mt-5" size="sm" variant="outline"><Link href="/partner/properties">Manage properties<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </section>
          <section className="rounded-2xl border border-border bg-foreground p-5 text-white shadow-card sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8ce0d4]">Today&apos;s workflow</p>
            <h2 className="font-display mt-2 text-xl font-extrabold">Keep arrivals moving</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">Use Reservations to create verified offline bookings, check guests in, and complete finished stays.</p>
            <Button asChild className="mt-5 border-white/15 bg-white/10 text-white hover:bg-white/15" size="sm" variant="outline"><Link href="/partner/bookings">Open reservations<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
