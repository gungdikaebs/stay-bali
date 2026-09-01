import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { archivePropertyAction, archiveRoomAction, submitPropertyAction } from "@/app/partner/properties/actions";
import { PropertyForm, RoomForm } from "@/components/partner/supply-forms";
import { PropertyMediaManager } from "@/components/partner/property-media-manager";
import { InventoryForm } from "@/components/partner/inventory-form";
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
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" href="/partner/properties"><ArrowLeft className="size-4" />Back to properties</Link>
      <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Property workspace</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">{property.name}</h1><p className="mt-2 text-sm text-muted-foreground">/{property.slug}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-fit rounded-full bg-brand-teal-subtle px-4 py-2 text-xs font-bold text-primary">{property.status}</span>
          {canEdit ? <form action={archivePropertyAction}><input name="propertyId" type="hidden" value={property.id} /><button className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50" type="submit">Archive property</button></form> : null}
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-border bg-white p-5 sm:p-8">
        <div className="mb-6"><h2 className="font-display text-2xl font-bold">Property photos</h2><p className="mt-2 text-sm text-muted-foreground">Upload at least three photos, choose a cover, and arrange their public order.</p></div>
        <PropertyMediaManager canEdit={canEdit} media={property.media} propertyId={property.id} />
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-white p-5 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Submission readiness</h2>
        {submissionIssues.length ? <ul className="mt-4 space-y-2">{submissionIssues.map((issue) => <li className="flex items-center gap-2 text-sm font-semibold text-warning" key={issue}><CircleAlert className="size-4" />{issue}</li>)}</ul> : <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="size-4" />Property meets the submission checklist.</p>}
        <form action={submitPropertyAction} className="mt-5"><input name="propertyId" type="hidden" value={property.id} /><button className="min-h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={!canSubmit} type="submit">Submit for Admin review</button></form>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-white p-5 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Property details</h2>
        <div className="mt-6">{canEdit ? <PropertyForm facilities={facilities} initial={{ id: property.id, name: property.name, type: property.type, description: property.description, area: property.area, address: property.address, checkInTime: property.checkInTime, checkOutTime: property.checkOutTime, cancellationPolicy: property.cancellationPolicy, facilityIds }} /> : <p className="rounded-xl bg-secondary p-4 text-sm font-semibold text-muted-foreground">Details are locked while this property is under Admin review or suspended.</p>}</div>
      </section>

      <section className="mt-8 space-y-5">
        <div><h2 className="font-display text-2xl font-bold">Room types</h2><p className="mt-2 text-sm text-muted-foreground">Rooms are archived instead of permanently deleted.</p></div>
        {property.rooms.map((room) => (
          <article className="rounded-3xl border border-border bg-white p-5 sm:p-8" key={room.id}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-display text-xl font-bold">{room.name}</h3><p className="mt-1 text-sm text-muted-foreground">{formatIdr(room.basePrice)} · {room.totalUnits} units · {room.adultCapacity} adults</p></div>{canEdit ? <form action={archiveRoomAction}><input name="propertyId" type="hidden" value={property.id} /><input name="roomId" type="hidden" value={room.id} /><button className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50" type="submit">Archive room</button></form> : null}</div>
            {canEdit ? <RoomForm facilities={facilities} initial={{ id: room.id, name: room.name, description: room.description, adultCapacity: room.adultCapacity, childCapacity: room.childCapacity, bedType: room.bedType, sizeSqm: room.sizeSqm, basePrice: room.basePrice, totalUnits: room.totalUnits, facilityIds: room.facilities.map((item) => item.facilityId) }} propertyId={property.id} /> : null}
            {room.isActive ? <InventoryForm propertyId={property.id} roomTypeId={room.id} /> : null}
          </article>
        ))}
        {canEdit ? <article className="rounded-3xl border border-dashed border-border bg-white p-5 sm:p-8"><h3 className="font-display text-xl font-bold">Add room type</h3><div className="mt-5"><RoomForm facilities={facilities} propertyId={property.id} /></div></article> : null}
      </section>

      {property.reviews.length ? <section className="mt-8 rounded-3xl border border-border bg-white p-5 sm:p-8"><h2 className="font-display text-2xl font-bold">Review history</h2><div className="mt-5 space-y-4">{property.reviews.map((review) => <article className="border-l-2 border-primary pl-4" key={review.id}><p className="text-sm font-bold">{review.previousState} → {review.nextState}</p><p className="mt-1 text-xs text-muted-foreground">{review.createdAt.toLocaleString("en-ID")} · {review.note ?? "No note"}</p></article>)}</div></section> : null}
    </div>
  );
}
