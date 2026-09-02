import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BedDouble, Building2, CalendarCheck2, ClipboardCheck, History, Users } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin/dashboard";
import { formatIdr } from "@/lib/demo-stays";

export const metadata: Metadata = {
  title: "Admin overview",
  description: "StayBali marketplace operations overview.",
};

export default async function AdminPage() {
  const overview = await getAdminOverview();
  const queue = [
    { label: "Partner applications", value: overview.pendingPartners, href: "/admin/partners", helper: "Awaiting access review" },
    { label: "Property reviews", value: overview.pendingProperties, href: "/admin/properties", helper: "Ready for a supply decision" },
    { label: "Cancellation requests", value: overview.pendingCancellations, href: "/admin/bookings", helper: "Require a manual resolution" },
    { label: "Failed notifications", value: overview.failedJobs, href: "/admin/jobs", helper: "Retries or investigation needed" },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        action={<Button asChild><Link href="/admin/bookings">Open reservations<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>}
        description="Monitor marketplace health, resolve operational queues, and keep every StayBali booking moving safely."
        eyebrow="Marketplace overview"
        title="Your operations, at a glance"
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace metrics">
        <MetricCard accent="green" helper={`${overview.publishedProperties} published properties`} icon={Users} label="Active partners" value={overview.activePartners} />
        <MetricCard accent="teal" helper={`${overview.activeRooms} sellable room types`} icon={Building2} label="Published stays" value={overview.publishedProperties} />
        <MetricCard accent="blue" helper="Confirmed or currently checked in" icon={CalendarCheck2} label="Active reservations" value={overview.activeReservations} />
        <MetricCard accent={overview.attentionCount ? "amber" : "neutral"} helper={`${overview.paymentFailures} payment failures included`} icon={AlertTriangle} label="Needs attention" value={overview.attentionCount} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Live activity</p><h2 className="font-display mt-1 text-xl font-extrabold">Recent reservations</h2></div>
            <Button asChild size="sm" variant="outline"><Link href="/admin/bookings">View all</Link></Button>
          </div>
          {overview.recentBookings.length ? (
            <div className="divide-y divide-border">
              {overview.recentBookings.map((booking) => (
                <article className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6" key={booking.id}>
                  <div className="min-w-0"><p className="font-mono text-[11px] font-bold tracking-[0.08em] text-primary">{booking.bookingCode}</p><p className="mt-1 truncate text-sm font-bold">{booking.propertyName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{booking.guestName}</p></div>
                  <StatusBadge status={booking.status} />
                  <p className="text-sm font-extrabold tabular-nums sm:text-right">{formatIdr(booking.grandTotal)}</p>
                </article>
              ))}
            </div>
          ) : <EmptyState description="New marketplace bookings will appear here." icon={CalendarCheck2} title="No reservations yet" />}
        </section>

        <section className="rounded-2xl border border-border bg-foreground p-5 text-white shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#8ce0d4]">Portfolio snapshot</p><h2 className="font-display mt-1 text-xl font-extrabold">Booked value</h2></div><span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><BedDouble className="size-5" aria-hidden="true" /></span></div>
          <p className="font-display mt-7 text-3xl font-extrabold tracking-[-0.04em] tabular-nums sm:text-4xl">{formatIdr(overview.grossBookingValue)}</p>
          <p className="mt-2 text-sm leading-6 text-white/65">Snapshot of confirmed, in-stay, and completed reservation value. Refunds are excluded.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div><p className="text-2xl font-extrabold tabular-nums">{overview.activeRooms}</p><p className="mt-1 text-xs text-white/60">Active rooms</p></div>
            <div><p className="text-2xl font-extrabold tabular-nums">{overview.paymentFailures}</p><p className="mt-1 text-xs text-white/60">Payment exceptions</p></div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-5 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Action center</p><h2 className="font-display mt-1 text-xl font-extrabold">Review queues</h2></div>
          <div className="divide-y divide-border">
            {queue.map((item) => (
              <Link className="group flex min-h-20 items-center justify-between gap-4 px-5 py-4 transition hover:bg-secondary/60 sm:px-6" href={item.href} key={item.label}>
                <div><p className="text-sm font-bold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>
                <span className="flex items-center gap-3"><strong className="font-display text-2xl tabular-nums">{item.value}</strong><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Accountability</p><h2 className="font-display mt-1 text-xl font-extrabold">Recent audit activity</h2></div><History className="size-5 text-primary" aria-hidden="true" /></div>
          {overview.recentAudits.length ? <div className="divide-y divide-border">{overview.recentAudits.map((audit) => <article className="flex gap-3 px-5 py-4 sm:px-6" key={audit.id}><span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><ClipboardCheck className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="text-sm font-bold">{audit.action.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}</p><p className="mt-1 text-xs text-muted-foreground">{audit.actor?.name ?? "System"} · {audit.entityType.toLowerCase().replaceAll("_", " ")} · {audit.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" })}</p></div></article>)}</div> : <EmptyState description="Security-relevant changes will be recorded here." icon={History} title="No audit activity yet" />}
        </section>
      </div>
    </div>
  );
}
