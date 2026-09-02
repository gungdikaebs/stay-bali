"use client";

import { useActionState } from "react";
import { requestCancellationAction } from "@/app/actions/cancellation-actions";
import type { CancellationActionState } from "@/lib/cancellation/schemas";

const initialState: CancellationActionState = { status: "idle", message: "" };

export function CancellationRequestForm({ bookingId, idempotencyKey }: { bookingId: string; idempotencyKey: string }) {
  const [state, formAction, pending] = useActionState(requestCancellationAction, initialState);

  return (
    <details className="mt-4 rounded-xl border border-border bg-white p-4">
      <summary className="cursor-pointer text-sm font-bold text-red-700">Request cancellation</summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input name="bookingId" type="hidden" value={bookingId} />
        <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
        <label className="block text-sm font-semibold">Reason<textarea className="mt-2 min-h-24 w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary" disabled={pending || state.status === "success"} maxLength={500} minLength={10} name="reason" required /></label>
        {state.errors?.reason?.[0] ? <p className="text-xs font-semibold text-red-700">{state.errors.reason[0]}</p> : null}
        <p className="text-xs leading-5 text-muted-foreground">Full refund eligibility is calculated on the server using the three-day cancellation rule. Submitting this request does not release inventory yet.</p>
        <button className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-60" disabled={pending || state.status === "success"} type="submit">{pending ? "Sending…" : state.status === "success" ? "Request sent" : "Send cancellation request"}</button>
        <p aria-live="polite" className={state.message ? `text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}` : "sr-only"}>{state.message}</p>
      </form>
    </details>
  );
}
