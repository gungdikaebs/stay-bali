"use client";

import { useActionState } from "react";
import { createManualBookingAction } from "@/app/actions/booking-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
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
        <Label className="block">
          Property and room
          <NativeSelect aria-invalid={Boolean(state.errors?.roomTypeId?.length)} className="mt-1.5" disabled={pending} name="roomTypeId" required>
            <option value="">Select a room type</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.property.name} — {room.name} · {formatIdr(room.basePrice)}/night · {room.adultCapacity} adults
              </option>
            ))}
          </NativeSelect>
          <FieldError errors={state.errors?.roomTypeId} />
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="block">
          Check-in
          <Input aria-invalid={Boolean(state.errors?.checkinDate?.length)} className="mt-1.5" disabled={pending} name="checkinDate" required type="date" />
          <FieldError errors={state.errors?.checkinDate} />
        </Label>
        <Label className="block">
          Check-out
          <Input aria-invalid={Boolean(state.errors?.checkoutDate?.length)} className="mt-1.5" disabled={pending} name="checkoutDate" required type="date" />
          <FieldError errors={state.errors?.checkoutDate} />
        </Label>
        <Label className="block">
          Adults
          <Input aria-invalid={Boolean(state.errors?.adultCount?.length)} className="mt-1.5" defaultValue={2} disabled={pending} max={10} min={1} name="adultCount" required type="number" />
          <FieldError errors={state.errors?.adultCount} />
        </Label>
        <Label className="block">
          Children
          <Input aria-invalid={Boolean(state.errors?.childCount?.length)} className="mt-1.5" defaultValue={0} disabled={pending} max={10} min={0} name="childCount" required type="number" />
          <FieldError errors={state.errors?.childCount} />
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="block sm:col-span-2">
          Guest name
          <Input aria-invalid={Boolean(state.errors?.guestName?.length)} autoComplete="name" className="mt-1.5" disabled={pending} maxLength={100} minLength={2} name="guestName" required />
          <FieldError errors={state.errors?.guestName} />
        </Label>
        <Label className="block">
          Guest email
          <Input aria-invalid={Boolean(state.errors?.guestEmail?.length)} autoComplete="email" className="mt-1.5" disabled={pending} maxLength={254} name="guestEmail" required type="email" />
          <FieldError errors={state.errors?.guestEmail} />
        </Label>
        <Label className="block">
          Guest phone
          <Input aria-invalid={Boolean(state.errors?.guestPhone?.length)} autoComplete="tel" className="mt-1.5" disabled={pending} maxLength={20} minLength={8} name="guestPhone" required type="tel" />
          <FieldError errors={state.errors?.guestPhone} />
        </Label>
      </div>

      <Label className="block">
        Internal reason
        <Textarea aria-invalid={Boolean(state.errors?.reason?.length)} className="mt-1.5 resize-y" disabled={pending} maxLength={500} minLength={10} name="reason" placeholder="Example: Walk-in guest paid at reception." required />
        <FieldError errors={state.errors?.reason} />
      </Label>

      <Label className="block">
        Guest request <span className="font-normal text-muted-foreground">(optional)</span>
        <Textarea aria-invalid={Boolean(state.errors?.specialRequest?.length)} className="mt-1.5 resize-y" disabled={pending} maxLength={500} name="specialRequest" placeholder="Arrival details, accessibility needs, or room preferences." />
        <FieldError errors={state.errors?.specialRequest} />
      </Label>

      {state.message ? (
        <Alert variant={state.status === "success" ? "success" : "destructive"} role={state.status === "error" ? "alert" : "status"}>
          <AlertDescription className="font-semibold">
          {state.message}
          {state.bookingCode ? <span className="mt-1 block">Booking code: {state.bookingCode}</span> : null}
          {state.status === "success" ? (
            <Button className="mt-2 h-auto min-h-0 p-0" onClick={() => window.location.reload()} type="button" variant="link">
              Create another reservation
            </Button>
          ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button disabled={pending || state.status === "success"} size="lg" type="submit">
        {pending ? "Creating reservation…" : "Create manual reservation"}
      </Button>
    </form>
  );
}
