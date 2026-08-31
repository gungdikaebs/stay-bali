import type { Metadata } from "next";
import { Building2, CircleCheckBig, Clock3, Hotel } from "lucide-react";
import { getPartnerOverview } from "@/lib/partner/dashboard";

export const metadata: Metadata = {
  title: "Partner workspace",
};

export default async function PartnerPage() {
  const overview = await getPartnerOverview();
  const cards = [
    { label: "Properties", value: overview.totalProperties, icon: Building2 },
    { label: "Published", value: overview.publishedProperties, icon: CircleCheckBig },
    { label: "Pending review", value: overview.pendingProperties, icon: Clock3 },
    { label: "Active room types", value: overview.activeRooms, icon: Hotel },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Partner overview</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">{overview.businessName}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">All metrics are scoped from your authenticated Partner profile. Property editing and submission are the next supply capabilities.</p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="rounded-2xl border border-border bg-white p-5" key={label}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><Icon className="size-5" /></span>
            <p className="mt-5 text-3xl font-extrabold">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{label}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
