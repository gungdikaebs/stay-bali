"use client";

import { useActionState } from "react";
import { resolveCancellationAction } from "@/app/actions/cancellation-actions";
import type { CancellationActionState } from "@/lib/cancellation/schemas";

const initialState: CancellationActionState = { status: "idle", message: "" };

export function CancellationResolutionForm({ requestId, idempotencyKey, eligibleForFullRefund }: { requestId: string; idempotencyKey: string; eligibleForFullRefund: boolean }) {
  const [state, formAction, pending] = useActionState(resolveCancellationAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
      <input name="cancellationRequestId" type="hidden" value={requestId} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <label className="block text-sm font-semibold">Resolution note<textarea className="mt-2 min-h-20 w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary" disabled={pending || state.status === "success"} maxLength={500} minLength={10} name="resolutionNote" required /></label>
      {eligibleForFullRefund ? <label className="block text-sm font-semibold">Manual refund reference<input className="mt-2 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary" disabled={pending || state.status === "success"} maxLength={64} minLength={4} name="refundReference" placeholder="e.g. DEMO-REFUND-001" required /></label> : null}
      <div className="flex flex-wrap gap-3">
        <button className="min-h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={pending || state.status === "success"} name="decision" type="submit" value="APPROVE">Approve {eligibleForFullRefund ? "& record refund" : "without refund"}</button>
        <button className="min-h-10 rounded-xl border border-border px-4 text-sm font-bold hover:bg-secondary disabled:opacity-60" disabled={pending || state.status === "success"} name="decision" type="submit" value="REJECT">Reject request</button>
      </div>
      <p aria-live="polite" className={state.message ? `text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}` : "sr-only"}>{state.message}</p>
    </form>
  );
}
