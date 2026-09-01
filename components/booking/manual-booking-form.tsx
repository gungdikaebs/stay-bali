"use client";

import { useActionState } from "react";
import { createManualBookingAction } from "@/app/actions/booking-actions";
import type { BookingActionState } from "@/lib/booking/schemas";
import { formatIdr } from "@/lib/demo-stays";

type RoomOption = {
  id: string;
  name: string;
  adultCapacity: number;
  childCapacity: number;
  basePrice: number;
  property: { name: string; area: string };
};

const initialState: BookingActionState = { status: "idle", message: "" };
const fieldClassName = "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary disabled:text-muted-foreground";
const textAreaClassName = "mt-1.5 min-h-24 w-full resize-y rounded-xl border border-border bg-white p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary disabled:text-muted-foreground";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0]
    ? <span className="mt-1 block text-xs font-medium text-red-700">{errors[0]}</span>
    : null;
}

export function ManualBookingForm({
  rooms,
  idempotencyKey,
}: {
  rooms: RoomOption[];
  idempotencyKey: string;
}) {
  const [state, formAction, pending] = useActionState(
    createManualBookingAction,
    initialState,
  );

  if (rooms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary/50 p-6 text-sm leading-6 text-muted-foreground">
        No published room types are available. Publish a property and activate at least one room before creating a manual reservation.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />

      <div>
        <label className="text-sm font-semibold">
          Property and room
          <select className={fieldClassName} disabled={pending} name="roomTypeId" required>
            <option value="">Select a room type</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.property.name} — {room.name} · {formatIdr(room.basePrice)}/night · {room.adultCapacity} adults
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.roomTypeId} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Check-in
          <input className={fieldClassName} disabled={pending} name="checkinDate" required type="date" />
          <FieldError errors={state.errors?.checkinDate} />
        </label>
        <label className="text-sm font-semibold">
          Check-out
          <input className={fieldClassName} disabled={pending} name="checkoutDate" required type="date" />
          <FieldError errors={state.errors?.checkoutDate} />
        </label>
        <label className="text-sm font-semibold">
          Adults
          <input className={fieldClassName} defaultValue={2} disabled={pending} max={10} min={1} name="adultCount" required type="number" />
          <FieldError errors={state.errors?.adultCount} />
        </label>
        <label className="text-sm font-semibold">
          Children
          <input className={fieldClassName} defaultValue={0} disabled={pending} max={10} min={0} name="childCount" required type="number" />
          <FieldError errors={state.errors?.childCount} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          Guest name
          <input autoComplete="name" className={fieldClassName} disabled={pending} maxLength={100} minLength={2} name="guestName" required />
          <FieldError errors={state.errors?.guestName} />
        </label>
        <label className="text-sm font-semibold">
          Guest email
          <input autoComplete="email" className={fieldClassName} disabled={pending} maxLength={254} name="guestEmail" required type="email" />
          <FieldError errors={state.errors?.guestEmail} />
        </label>
        <label className="text-sm font-semibold">
          Guest phone
          <input autoComplete="tel" className={fieldClassName} disabled={pending} maxLength={20} minLength={8} name="guestPhone" required type="tel" />
          <FieldError errors={state.errors?.guestPhone} />
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Internal reason
        <textarea className={textAreaClassName} disabled={pending} maxLength={500} minLength={10} name="reason" placeholder="Example: Walk-in guest paid at reception." required />
        <FieldError errors={state.errors?.reason} />
      </label>

      <label className="block text-sm font-semibold">
        Guest request <span className="font-normal text-muted-foreground">(optional)</span>
        <textarea className={textAreaClassName} disabled={pending} maxLength={500} name="specialRequest" placeholder="Arrival details, accessibility needs, or room preferences." />
        <FieldError errors={state.errors?.specialRequest} />
      </label>

      {state.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${state.status === "success" ? "bg-success-subtle text-success" : "bg-red-50 text-red-700"}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
          {state.bookingCode ? <span className="mt-1 block">Booking code: {state.bookingCode}</span> : null}
          {state.status === "success" ? (
            <button className="mt-3 block text-sm font-bold underline" onClick={() => window.location.reload()} type="button">
              Create another reservation
            </button>
          ) : null}
        </div>
      ) : null}

      <button className="min-h-12 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60" disabled={pending || state.status === "success"} type="submit">
        {pending ? "Creating reservation…" : "Create manual reservation"}
      </button>
    </form>
  );
}
