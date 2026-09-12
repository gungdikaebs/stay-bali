"use client";

import { useActionState } from "react";
import {
  confirmStandardCancellationAction,
  requestCancellationExceptionAction,
} from "@/app/actions/cancellation-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CancellationActionState } from "@/lib/cancellation/schemas";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";

const initialState: CancellationActionState = { status: "idle", message: "" };

function Feedback({ state }: { state: CancellationActionState }) {
  return <p aria-live="polite" className={state.message ? `text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}` : "sr-only"}>{state.message}</p>;
}

export function CancellationRequestForm({
  bookingId,
  standardIdempotencyKey,
  exceptionIdempotencyKey,
  eligibleForFullRefund,
  refundAmount,
  deadline,
}: {
  bookingId: string;
  standardIdempotencyKey: string;
  exceptionIdempotencyKey: string;
  eligibleForFullRefund: boolean;
  refundAmount: number;
  deadline: string;
}) {
  const [standardState, standardAction, standardPending] = useActionState(confirmStandardCancellationAction, initialState);
  const [exceptionState, exceptionAction, exceptionPending] = useActionState(requestCancellationExceptionAction, initialState);

  return (
    <details className="mt-4 rounded-xl border border-border bg-white p-4">
      <summary className="cursor-pointer text-sm font-bold text-red-700">Cancel booking</summary>
      <div className="mt-4 space-y-4">
        <div className={eligibleForFullRefund ? "rounded-xl bg-success-subtle p-3 text-sm" : "rounded-xl bg-warning-subtle p-3 text-sm"}>
          <p className="font-bold">{eligibleForFullRefund ? `Full refund: ${formatIdr(refundAmount)}` : "Standard refund: Rp0"}</p>
          <p className="mt-1 leading-5 text-muted-foreground">Free cancellation deadline: {formatStayDate(deadline)}. Cancellation is final and releases the room immediately.</p>
        </div>
        <form action={standardAction} className="space-y-3">
          <input name="bookingId" type="hidden" value={bookingId} />
          <input name="idempotencyKey" type="hidden" value={standardIdempotencyKey} />
          <Button disabled={standardPending || standardState.status === "success"} type="submit" variant="destructive">
            {standardPending ? "Cancelling…" : eligibleForFullRefund ? "Cancel with full refund" : "Cancel without refund"}
          </Button>
          <Feedback state={standardState} />
        </form>

        {!eligibleForFullRefund ? (
          <form action={exceptionAction} className="space-y-3 border-t border-border pt-4">
            <div><p className="text-sm font-bold">Need a policy exception?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Ask the property Partner to waive the no-refund term. Your room remains allocated while they review it.</p></div>
            <input name="bookingId" type="hidden" value={bookingId} />
            <input name="idempotencyKey" type="hidden" value={exceptionIdempotencyKey} />
            <label className="block text-sm font-semibold">Reason
              <Textarea aria-invalid={Boolean(exceptionState.errors?.reason)} disabled={exceptionPending || exceptionState.status === "success"} maxLength={500} minLength={10} name="reason" required />
            </label>
            {exceptionState.errors?.reason?.[0] ? <p className="text-xs font-semibold text-red-700">{exceptionState.errors.reason[0]}</p> : null}
            <Button disabled={exceptionPending || exceptionState.status === "success"} type="submit" variant="outline">
              {exceptionPending ? "Sending…" : "Request an exception"}
            </Button>
            <Feedback state={exceptionState} />
          </form>
        ) : null}
      </div>
    </details>
  );
}
