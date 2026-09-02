import type { Metadata } from "next";
import { Building2, Clock3, ShieldCheck, Users } from "lucide-react";
import { changePartnerStatusAction } from "@/app/admin/partners/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { listPartnersForAdmin } from "@/lib/admin/partners";
import { getAllowedPartnerTransitions } from "@/lib/auth/policies";

export const metadata: Metadata = {
  title: "Partners",
};

export default async function AdminPartnersPage() {
  const partners = await listPartnersForAdmin();
  const active = partners.filter((partner) => partner.status === "ACTIVE").length;
  const pending = partners.filter((partner) => partner.status === "PENDING").length;
  const propertyCount = partners.reduce((count, partner) => count + partner._count.properties, 0);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader description="Review operator access and business ownership. Every decision revokes older sessions and creates an immutable audit entry." eyebrow="Supply network" title="Partners" />

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Partner summary">
        <MetricCard accent="neutral" helper="All registered property operators" icon={Users} label="Total partners" value={partners.length} />
        <MetricCard accent="green" helper="Able to access owned supply" icon={ShieldCheck} label="Active partners" value={active} />
        <MetricCard accent={pending ? "amber" : "teal"} helper={`${propertyCount} properties across the network`} icon={pending ? Clock3 : Building2} label="Awaiting review" value={pending} />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-5 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Access review</p><h2 className="font-display mt-1 text-xl font-extrabold">Registered operators</h2></div>
        {partners.length ? <div className="divide-y divide-border">{partners.map((partner) => {
          const transitions = getAllowedPartnerTransitions(partner.status);
          return (
            <article className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(240px,1fr)_minmax(390px,1.15fr)] xl:items-start" key={partner.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-extrabold">{partner.businessName}</h3><StatusBadge status={partner.status} /></div>
                <p className="mt-2 text-sm font-semibold">{partner.user.name}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{partner.user.email}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground"><span>{partner._count.properties} properties</span><span>Updated {partner.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</span></div>
              </div>
              {transitions.length ? <form action={changePartnerStatusAction} className="rounded-2xl bg-secondary/60 p-4">
                <input name="partnerId" type="hidden" value={partner.id} />
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">Decision<NativeSelect className="bg-white text-foreground" name="nextStatus" required>{transitions.map((status) => <option key={status} value={status}>{status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}</option>)}</NativeSelect></label>
                  <Button size="sm" type="submit">Apply decision</Button>
                  <label className="grid gap-1.5 text-xs font-bold text-muted-foreground sm:col-span-2">Admin note <span className="font-normal">(optional)</span><Input className="bg-white font-normal text-foreground" defaultValue={partner.adminNote ?? ""} maxLength={500} name="adminNote" placeholder="Add concise context for this decision" /></label>
                </div>
              </form> : <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">No additional lifecycle transition is currently available.</div>}
            </article>
          );
        })}</div> : <EmptyState description="New Partner applications will appear here for review." icon={Users} title="No partners yet" />}
      </section>
    </div>
  );
}
