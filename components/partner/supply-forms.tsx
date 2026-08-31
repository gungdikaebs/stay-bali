"use client";

import { useActionState } from "react";
import {
  createPropertyAction,
  createRoomAction,
  updatePropertyAction,
  updateRoomAction,
} from "@/app/partner/properties/actions";
import type { SupplyActionState } from "@/lib/supply/schemas";

const initialState: SupplyActionState = { status: "idle", message: "" };
const fieldClassName = "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary disabled:text-muted-foreground";
const textAreaClassName = "mt-1.5 min-h-28 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary disabled:text-muted-foreground";

type FacilityOption = { id: string; name: string };

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <span className="mt-1 block text-xs font-semibold text-red-700">{errors[0]}</span> : null;
}

function FormMessage({ state }: { state: SupplyActionState }) {
  if (!state.message) return null;
  return (
    <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${state.status === "success" ? "bg-success-subtle text-success" : "bg-red-50 text-red-700"}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

type PropertyFormProps = {
  facilities: FacilityOption[];
  initial?: {
    id: string;
    name: string;
    type: "VILLA" | "HOTEL" | "HOMESTAY";
    description: string;
    area: string;
    address: string;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    facilityIds: string[];
  };
};

export function PropertyForm({ facilities, initial }: PropertyFormProps) {
  const action = initial ? updatePropertyAction.bind(null, initial.id) : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedFacilities = new Set(initial?.facilityIds ?? []);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">Property name
          <input className={fieldClassName} defaultValue={initial?.name} disabled={pending} maxLength={150} minLength={3} name="name" required />
          <FieldError errors={state.errors?.name} />
        </label>
        <label className="text-sm font-semibold">Property type
          <select className={fieldClassName} defaultValue={initial?.type ?? "VILLA"} disabled={pending} name="type">
            <option value="VILLA">Villa</option><option value="HOTEL">Hotel</option><option value="HOMESTAY">Homestay</option>
          </select>
          <FieldError errors={state.errors?.type} />
        </label>
      </div>
      <label className="block text-sm font-semibold">Description
        <textarea className={textAreaClassName} defaultValue={initial?.description} disabled={pending} maxLength={5000} minLength={100} name="description" required rows={7} />
        <span className="mt-1 block text-xs font-normal text-muted-foreground">100–5,000 characters.</span>
        <FieldError errors={state.errors?.description} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">Area
          <input className={fieldClassName} defaultValue={initial?.area} disabled={pending} maxLength={100} name="area" placeholder="Ubud, Gianyar" required />
          <FieldError errors={state.errors?.area} />
        </label>
        <label className="text-sm font-semibold">Address
          <input className={fieldClassName} defaultValue={initial?.address} disabled={pending} maxLength={500} name="address" required />
          <FieldError errors={state.errors?.address} />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">Check-in time
          <input className={fieldClassName} defaultValue={initial?.checkInTime ?? "15:00"} disabled={pending} name="checkInTime" required type="time" />
          <FieldError errors={state.errors?.checkInTime} />
        </label>
        <label className="text-sm font-semibold">Check-out time
          <input className={fieldClassName} defaultValue={initial?.checkOutTime ?? "11:00"} disabled={pending} name="checkOutTime" required type="time" />
          <FieldError errors={state.errors?.checkOutTime} />
        </label>
      </div>
      <label className="block text-sm font-semibold">Cancellation policy
        <textarea className={textAreaClassName} defaultValue={initial?.cancellationPolicy ?? "Free cancellation until 3 days before check-in. After that, the booking is non-refundable."} disabled={pending} maxLength={5000} minLength={20} name="cancellationPolicy" required rows={4} />
        <FieldError errors={state.errors?.cancellationPolicy} />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Property facilities</legend>
        <p className="mt-1 text-xs text-muted-foreground">Select at least five before submission.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-sm" key={facility.id}>
              <input defaultChecked={selectedFacilities.has(facility.id)} disabled={pending} name="facilityIds" type="checkbox" value={facility.id} />
              {facility.name}
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.facilityIds} />
      </fieldset>
      <FormMessage state={state} />
      <button className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving…" : initial ? "Save property" : "Create draft property"}
      </button>
    </form>
  );
}

type RoomFormProps = {
  propertyId: string;
  facilities: FacilityOption[];
  initial?: {
    id: string;
    name: string;
    description: string;
    adultCapacity: number;
    childCapacity: number;
    bedType: string;
    sizeSqm: number | null;
    basePrice: number;
    totalUnits: number;
    facilityIds: string[];
  };
};

export function RoomForm({ propertyId, facilities, initial }: RoomFormProps) {
  const action = initial
    ? updateRoomAction.bind(null, propertyId, initial.id)
    : createRoomAction.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const selectedFacilities = new Set(initial?.facilityIds ?? []);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Room name<input className={fieldClassName} defaultValue={initial?.name} disabled={pending} maxLength={150} minLength={3} name="name" required /><FieldError errors={state.errors?.name} /></label>
        <label className="text-sm font-semibold">Bed type<input className={fieldClassName} defaultValue={initial?.bedType} disabled={pending} maxLength={100} name="bedType" placeholder="1 king bed" required /><FieldError errors={state.errors?.bedType} /></label>
      </div>
      <label className="block text-sm font-semibold">Description<textarea className={textAreaClassName} defaultValue={initial?.description} disabled={pending} maxLength={5000} minLength={20} name="description" required rows={3} /><FieldError errors={state.errors?.description} /></label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-semibold">Adults<input className={fieldClassName} defaultValue={initial?.adultCapacity ?? 2} disabled={pending} max={10} min={1} name="adultCapacity" required type="number" /><FieldError errors={state.errors?.adultCapacity} /></label>
        <label className="text-sm font-semibold">Children<input className={fieldClassName} defaultValue={initial?.childCapacity ?? 0} disabled={pending} max={10} min={0} name="childCapacity" required type="number" /><FieldError errors={state.errors?.childCapacity} /></label>
        <label className="text-sm font-semibold">Size m²<input className={fieldClassName} defaultValue={initial?.sizeSqm ?? ""} disabled={pending} min={1} name="sizeSqm" type="number" /><FieldError errors={state.errors?.sizeSqm} /></label>
        <label className="text-sm font-semibold">Base price IDR<input className={fieldClassName} defaultValue={initial?.basePrice} disabled={pending} min={1} name="basePrice" required type="number" /><FieldError errors={state.errors?.basePrice} /></label>
        <label className="text-sm font-semibold">Total units<input className={fieldClassName} defaultValue={initial?.totalUnits ?? 1} disabled={pending} max={100} min={1} name="totalUnits" required type="number" /><FieldError errors={state.errors?.totalUnits} /></label>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Room facilities</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {facilities.map((facility) => (
            <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs" key={facility.id}>
              <input defaultChecked={selectedFacilities.has(facility.id)} disabled={pending} name="facilityIds" type="checkbox" value={facility.id} />{facility.name}
            </label>
          ))}
        </div>
      </fieldset>
      <FormMessage state={state} />
      <button className="min-h-10 rounded-xl bg-foreground px-5 text-sm font-bold text-white transition hover:bg-primary disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : initial ? "Save room" : "Add room type"}</button>
    </form>
  );
}
