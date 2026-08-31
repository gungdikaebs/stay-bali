import type { Metadata } from "next";
import { reviewPropertyAction } from "@/app/admin/properties/actions";
import { listPropertiesForAdmin } from "@/lib/admin/properties";
import { getAdminPropertyTransitions, getSubmissionIssues } from "@/lib/supply/rules";

export const metadata: Metadata = {
  title: "Properties",
};

export default async function AdminPropertiesPage() {
  const properties = await listPropertiesForAdmin();

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Property supply</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Properties</h1>
      <p className="mt-3 text-muted-foreground">Review, publish, reject, or suspend supply through the documented state machine.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
        {properties.map((property) => (
          <article className="grid gap-5 border-b border-border p-5 last:border-b-0 xl:grid-cols-[minmax(0,1fr)_150px_minmax(340px,0.8fr)] xl:items-center" key={property.id}>
            <div>
              <h2 className="font-bold">{property.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{property.area} · {property.owner.businessName}</p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{property._count.rooms} active rooms · {property._count.facilities} facilities · {property._count.media} ready media</p>
            </div>
            <span className="w-fit rounded-full bg-brand-teal-subtle px-3 py-1 text-xs font-bold text-primary">{property.status}</span>
            {getAdminPropertyTransitions(property.status).length ? (
              <form action={reviewPropertyAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input name="propertyId" type="hidden" value={property.id} />
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">Decision<select className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-foreground" name="nextStatus">{getAdminPropertyTransitions(property.status).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <button className="self-end rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-white hover:bg-primary" type="submit">Apply</button>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground sm:col-span-2">Review note<input className="h-10 rounded-xl border border-border px-3 text-sm font-normal text-foreground" maxLength={1000} name="note" placeholder="Required when rejecting or suspending" /></label>
                {getSubmissionIssues({ facilityCount: property._count.facilities, readyMediaCount: property._count.media, activeRoomCount: property._count.rooms }).length ? <p className="text-xs font-semibold text-warning sm:col-span-2">Checklist incomplete; publishing will be rejected by the server.</p> : null}
              </form>
            ) : <p className="text-sm font-semibold text-muted-foreground">Waiting for Partner submission</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
