import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listOwnedProperties } from "@/lib/partner/dashboard";

export const metadata: Metadata = {
  title: "My properties",
};

export default async function PartnerPropertiesPage() {
  const properties = await listOwnedProperties();

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Owned supply</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">My properties</h1>
      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><p className="text-muted-foreground">Only properties owned by the authenticated Partner profile are returned by the data access layer.</p><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover" href="/partner/properties/new"><Plus className="size-4" />Create property</Link></div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
        {properties.length ? properties.map((property) => (
          <article className="grid gap-3 border-b border-border p-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_170px_180px] sm:items-center" key={property.id}>
            <div>
              <h2 className="font-bold"><Link className="hover:text-primary hover:underline" href={`/partner/properties/${property.id}`}>{property.name}</Link></h2>
              <p className="mt-1 text-sm text-muted-foreground">{property.area} · /{property.slug}</p>
            </div>
            <span className="w-fit rounded-full bg-brand-teal-subtle px-3 py-1 text-xs font-bold text-primary">{property.status}</span>
            <p className="text-sm font-semibold text-muted-foreground sm:text-right">{property._count.rooms} rooms · {property._count.media} media</p>
          </article>
        )) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold">No properties yet</h2>
            <p className="mt-3 text-sm text-muted-foreground">Create a draft, add its facilities and room types, then prepare it for Admin review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
