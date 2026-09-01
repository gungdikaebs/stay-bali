"use client";

import { useActionState } from "react";
import { updateInventoryAction } from "@/app/partner/properties/actions";
import type { InventoryActionState } from "@/lib/inventory/schemas";

const initialState: InventoryActionState = { status: "idle", message: "" };
const fieldClassName = "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary";

export function InventoryForm({ propertyId, roomTypeId }: { propertyId: string; roomTypeId: string }) {
  const action = updateInventoryAction.bind(null, propertyId, roomTypeId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 rounded-2xl bg-secondary/60 p-4 sm:p-5">
      <div className="mb-4">
        <h4 className="font-display text-lg font-bold">Bulk inventory</h4>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Apply one price, unit, and stop-sell rule to up to 90 days. Leave overrides blank to use room defaults.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <label className="text-xs font-bold">Start date
          <input className={fieldClassName} disabled={pending} name="startDate" required type="date" />
        </label>
        <label className="text-xs font-bold">End date
          <input className={fieldClassName} disabled={pending} name="endDate" required type="date" />
          {state.errors?.endDate?.[0] ? <span className="mt-1 block text-xs text-red-700">{state.errors.endDate[0]}</span> : null}
        </label>
        <label className="text-xs font-bold">Nightly price IDR
          <input className={fieldClassName} disabled={pending} min={1} name="priceOverride" placeholder="Room default" type="number" />
        </label>
        <label className="text-xs font-bold">Sellable units
          <input className={fieldClassName} disabled={pending} max={100} min={1} name="totalUnitsOverride" placeholder="Room default" type="number" />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold">
          <input disabled={pending} name="stopSell" type="checkbox" /> Stop sell
        </label>
      </div>
      {state.message ? (
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${state.status === "success" ? "bg-success-subtle text-success" : "bg-red-50 text-red-700"}`} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
      <button className="mt-4 min-h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Updating…" : "Update inventory"}
      </button>
    </form>
  );
}
