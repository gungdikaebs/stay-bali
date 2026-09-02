import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock3, DoorOpen, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { listOwnedProperties } from "@/lib/partner/dashboard";

export const metadata: Metadata = {
  title: "My properties",
};

export default async function PartnerPropertiesPage() {
  const properties = await listOwnedProperties();
  const published = properties.filter((property) => property.status === "PUBLISHED").length;
  const pending = properties.filter((property) => property.status === "PENDING_REVIEW").length;
  const rooms = properties.reduce((count, property) => count + property._count.rooms, 0);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader action={<Button asChild><Link href="/partner/properties/new"><Plus className="size-4" aria-hidden="true" />Create property</Link></Button>} description="Build complete listings, manage room types and inventory, then submit qualified supply for Admin review." eyebrow="Owned supply" title="Properties" />

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Property summary">
        <MetricCard accent="neutral" helper="All active drafts and listings" icon={Building2} label="Total properties" value={properties.length} />
        <MetricCard accent="green" helper={`${rooms} room types configured`} icon={CheckCircle2} label="Published stays" value={published} />
        <MetricCard accent={pending ? "amber" : "teal"} helper="Currently with the StayBali team" icon={pending ? Clock3 : DoorOpen} label="In review" value={pending} />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-5 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Portfolio</p><h2 className="font-display mt-1 text-xl font-extrabold">Property workspace</h2></div>
        {properties.length ? <div className="divide-y divide-border">{properties.map((property) => (
          <Link className="group grid gap-4 p-5 transition hover:bg-secondary/55 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6" href={`/partner/properties/${property.id}`} key={property.id}>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-extrabold group-hover:text-primary">{property.name}</h3><StatusBadge status={property.status} /></div><p className="mt-2 text-sm text-muted-foreground">{property.area} · /{property.slug}</p><div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground"><span>{property._count.rooms} room types</span><span>{property._count.media} photos</span><span>Updated {property.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</span></div></div>
            <span className="flex items-center gap-2 text-sm font-bold text-primary">Manage<ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
        ))}</div> : <EmptyState action={<Button asChild><Link href="/partner/properties/new"><Plus className="size-4" aria-hidden="true" />Create your first property</Link></Button>} description="Create a draft, add facilities and room types, then prepare it for Admin review." icon={Building2} title="No properties yet" />}
      </section>
    </div>
  );
}
