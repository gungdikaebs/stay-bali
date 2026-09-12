"use client";

import { useActionState } from "react";
import { resolveCancellationAction } from "@/app/actions/cancellation-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CancellationActionState } from "@/lib/cancellation/schemas";

const initialState: CancellationActionState = { status: "idle", message: "" };

export function CancellationResolutionForm({ requestId, idempotencyKey, approveLabel }: { requestId: string; idempotencyKey: string; approveLabel: string }) {
  const [state, formAction, pending] = useActionState(resolveCancellationAction, initialState);
  return (
    <form action={formAction} className="mt-4 space-y-3 border-t border-border pt-4">
      <input name="cancellationRequestId" type="hidden" value={requestId} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <label className="block text-sm font-semibold">Resolution note
        <Textarea aria-invalid={Boolean(state.errors?.resolutionNote)} disabled={pending || state.status === "success"} maxLength={500} minLength={10} name="resolutionNote" required />
      </label>
      {state.errors?.resolutionNote?.[0] ? <p className="text-xs font-semibold text-red-700">{state.errors.resolutionNote[0]}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending || state.status === "success"} name="decision" size="sm" type="submit" value="APPROVE">{approveLabel}</Button>
        <Button disabled={pending || state.status === "success"} name="decision" size="sm" type="submit" value="REJECT" variant="outline">Reject request</Button>
      </div>
      <p aria-live="polite" className={state.message ? `text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}` : "sr-only"}>{state.message}</p>
    </form>
  );
}
