import type { Metadata } from "next";
import { Building2, CheckCircle2, Clock3, DoorOpen } from "lucide-react";
import { reviewPropertyAction } from "@/app/admin/properties/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { listPropertiesForAdmin } from "@/lib/admin/properties";
import { getAdminPropertyTransitions, getSubmissionIssues } from "@/lib/supply/rules";

export const metadata: Metadata = {
  title: "Properties",
};

export default async function AdminPropertiesPage() {
  const properties = await listPropertiesForAdmin();
  const published = properties.filter((property) => property.status === "PUBLISHED").length;
  const pending = properties.filter((property) => property.status === "PENDING_REVIEW").length;
  const rooms = properties.reduce((count, property) => count + property._count.rooms, 0);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader description="Check submission readiness, publish qualified stays, and document every rejection or suspension through the controlled state machine." eyebrow="Marketplace supply" title="Properties" />

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Property summary">
        <MetricCard accent="neutral" helper="Non-archived marketplace supply" icon={Building2} label="Total properties" value={properties.length} />
        <MetricCard accent="green" helper={`${rooms} active room types`} icon={CheckCircle2} label="Published stays" value={published} />
        <MetricCard accent={pending ? "amber" : "teal"} helper="Ready for an Admin decision" icon={pending ? Clock3 : DoorOpen} label="Pending review" value={pending} />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-5 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Supply review</p><h2 className="font-display mt-1 text-xl font-extrabold">Property catalog</h2></div>
        {properties.length ? <div className="divide-y divide-border">{properties.map((property) => {
          const transitions = getAdminPropertyTransitions(property.status);
          const issues = getSubmissionIssues({ facilityCount: property._count.facilities, readyMediaCount: property._count.media, activeRoomCount: property._count.rooms });
          return (
            <article className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(250px,1fr)_minmax(390px,1.15fr)] xl:items-start" key={property.id}>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-extrabold">{property.name}</h3><StatusBadge status={property.status} /></div><p className="mt-2 text-sm font-semibold">{property.area}</p><p className="mt-1 text-sm text-muted-foreground">Managed by {property.owner.businessName}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground"><span>{property._count.rooms} active rooms</span><span>{property._count.facilities} facilities</span><span>{property._count.media} ready photos</span></div></div>
              {transitions.length ? <form action={reviewPropertyAction} className="rounded-2xl bg-secondary/60 p-4">
                <input name="propertyId" type="hidden" value={property.id} />
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><label className="grid gap-1.5 text-xs font-bold text-muted-foreground">Decision<NativeSelect className="bg-white text-foreground" name="nextStatus">{transitions.map((status) => <option key={status} value={status}>{status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}</option>)}</NativeSelect></label><Button size="sm" type="submit">Apply decision</Button><label className="grid gap-1.5 text-xs font-bold text-muted-foreground sm:col-span-2">Review note<Input className="bg-white font-normal text-foreground" maxLength={1000} name="note" placeholder="Required when rejecting or suspending" /></label>{issues.length ? <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs font-semibold leading-5 text-warning sm:col-span-2">Checklist incomplete: {issues.join(" ")}</p> : <p className="flex items-center gap-2 text-xs font-semibold text-success sm:col-span-2"><CheckCircle2 className="size-4" aria-hidden="true" />Submission checklist is complete.</p>}</div>
              </form> : <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">Waiting for the Partner to complete and submit this property.</div>}
            </article>
          );
        })}</div> : <EmptyState description="Partner properties will appear here once a draft is created." icon={Building2} title="No properties yet" />}
      </section>
    </div>
  );
}
