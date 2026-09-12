"use client";

import { useActionState } from "react";
import { cancelManualBookingAction, requestPartnerCancellationAction } from "@/app/actions/cancellation-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CancellationActionState } from "@/lib/cancellation/schemas";

const initialState: CancellationActionState = { status: "idle", message: "" };

export function OperatorCancellationForm({ bookingId, idempotencyKey, source }: { bookingId: string; idempotencyKey: string; source: "ONLINE" | "MANUAL" }) {
  const action = source === "MANUAL" ? cancelManualBookingAction : requestPartnerCancellationAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <details className="mt-4 rounded-xl border border-border p-3">
      <summary className="cursor-pointer text-sm font-bold text-red-700">{source === "MANUAL" ? "Cancel manual reservation" : "Report inability to host"}</summary>
      <form action={formAction} className="mt-3 space-y-3">
        <input name="bookingId" type="hidden" value={bookingId} />
        <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
        <label className="block text-sm font-semibold">Reason
          <Textarea aria-invalid={Boolean(state.errors?.reason)} disabled={pending || state.status === "success"} maxLength={500} minLength={10} name="reason" required />
        </label>
        {state.errors?.reason?.[0] ? <p className="text-xs font-semibold text-red-700">{state.errors.reason[0]}</p> : null}
        <p className="text-xs leading-5 text-muted-foreground">{source === "MANUAL" ? "This immediately cancels the offline reservation and releases inventory." : "Online bookings require StayBali Admin review and remain allocated until a decision is recorded."}</p>
        <Button disabled={pending || state.status === "success"} size="sm" type="submit" variant="destructive">{pending ? "Saving…" : source === "MANUAL" ? "Cancel reservation" : "Escalate to Admin"}</Button>
        <p aria-live="polite" className={state.message ? `text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}` : "sr-only"}>{state.message}</p>
      </form>
    </details>
  );
}
