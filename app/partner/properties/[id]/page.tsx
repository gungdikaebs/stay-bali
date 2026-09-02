import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { archivePropertyAction, archiveRoomAction, submitPropertyAction } from "@/app/partner/properties/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PropertyForm, RoomForm } from "@/components/partner/supply-forms";
import { PropertyMediaManager } from "@/components/partner/property-media-manager";
import { InventoryForm } from "@/components/partner/inventory-form";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/demo-stays";
import { getOwnedPropertyWorkspace } from "@/lib/supply/properties";

type PropertyWorkspacePageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PropertyWorkspacePageProps): Promise<Metadata> {
  return { title: `Manage property ${(await params).id}` };
}

export default async function PropertyWorkspacePage({ params }: PropertyWorkspacePageProps) {
  const { id } = await params;
  const { property, facilities, submissionIssues, canEdit, canSubmit } = await getOwnedPropertyWorkspace(id);
  const facilityIds = property.facilities.map((item) => item.facilityId);

  return (
    <div className="mx-auto max-w-6xl">
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" href="/partner/properties"><ArrowLeft className="size-4" aria-hidden="true" />Back to properties</Link>
      <PageHeader className="mt-6" description={`Manage listing content, photos, rooms, and sellable inventory for /${property.slug}.`} eyebrow="Property workspace" title={property.name} action={<><StatusBadge status={property.status} />{canEdit ? <form action={archivePropertyAction}><input name="propertyId" type="hidden" value={property.id} /><Button size="sm" type="submit" variant="destructive">Archive property</Button></form> : null}</>} />

      <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6"><h2 className="font-display text-2xl font-bold">Property photos</h2><p className="mt-2 text-sm text-muted-foreground">Upload at least three photos, choose a cover, and arrange their public order.</p></div>
        <PropertyMediaManager canEdit={canEdit} media={property.media} propertyId={property.id} />
      </section>

      <section className={`mt-8 rounded-2xl border p-5 shadow-sm sm:p-8 ${submissionIssues.length ? "border-warning/20 bg-warning-subtle/55" : "border-success/20 bg-success-subtle/55"}`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Publishing checklist</p><h2 className="font-display mt-1 text-2xl font-bold">Submission readiness</h2>{submissionIssues.length ? <ul className="mt-4 grid gap-2 sm:grid-cols-2">{submissionIssues.map((issue) => <li className="flex items-start gap-2 text-sm font-semibold text-warning" key={issue}><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{issue}</li>)}</ul> : <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="size-4" aria-hidden="true" />Property meets the submission checklist.</p>}</div><form action={submitPropertyAction}><input name="propertyId" type="hidden" value={property.id} /><Button disabled={!canSubmit} type="submit">Submit for Admin review</Button></form></div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold">Property details</h2>
        <div className="mt-6">{canEdit ? <PropertyForm facilities={facilities} initial={{ id: property.id, name: property.name, type: property.type, description: property.description, area: property.area, address: property.address, checkInTime: property.checkInTime, checkOutTime: property.checkOutTime, cancellationPolicy: property.cancellationPolicy, facilityIds }} /> : <p className="rounded-xl bg-secondary p-4 text-sm font-semibold text-muted-foreground">Details are locked while this property is under Admin review or suspended.</p>}</div>
      </section>

      <section className="mt-8 space-y-5">
        <div><h2 className="font-display text-2xl font-bold">Room types</h2><p className="mt-2 text-sm text-muted-foreground">Rooms are archived instead of permanently deleted.</p></div>
        {property.rooms.map((room) => (
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8" key={room.id}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-display text-xl font-bold">{room.name}</h3><p className="mt-1 text-sm text-muted-foreground">{formatIdr(room.basePrice)} · {room.totalUnits} units · {room.adultCapacity} adults</p></div>{canEdit ? <form action={archiveRoomAction}><input name="propertyId" type="hidden" value={property.id} /><input name="roomId" type="hidden" value={room.id} /><Button size="sm" type="submit" variant="destructive">Archive room</Button></form> : null}</div>
            {canEdit ? <RoomForm facilities={facilities} initial={{ id: room.id, name: room.name, description: room.description, adultCapacity: room.adultCapacity, childCapacity: room.childCapacity, bedType: room.bedType, sizeSqm: room.sizeSqm, basePrice: room.basePrice, totalUnits: room.totalUnits, facilityIds: room.facilities.map((item) => item.facilityId) }} propertyId={property.id} /> : null}
            {room.isActive ? <InventoryForm propertyId={property.id} roomTypeId={room.id} /> : null}
          </article>
        ))}
        {canEdit ? <article className="rounded-2xl border border-dashed border-primary/30 bg-brand-teal-subtle/35 p-5 sm:p-8"><h3 className="font-display text-xl font-bold">Add room type</h3><div className="mt-5"><RoomForm facilities={facilities} propertyId={property.id} /></div></article> : null}
      </section>

      {property.reviews.length ? <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8"><h2 className="font-display text-2xl font-bold">Review history</h2><div className="mt-5 space-y-4">{property.reviews.map((review) => <article className="border-l-2 border-primary pl-4" key={review.id}><div className="flex flex-wrap items-center gap-2"><StatusBadge status={review.previousState} /><span className="text-muted-foreground">→</span><StatusBadge status={review.nextState} /></div><p className="mt-2 text-xs text-muted-foreground">{review.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {review.note ?? "No note"}</p></article>)}</div></section> : null}
    </div>
  );
}
