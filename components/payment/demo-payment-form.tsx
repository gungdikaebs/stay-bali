"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, FlaskConical, XCircle } from "lucide-react";
import { simulatePaymentAction } from "@/app/actions/payment-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/demo-stays";
import type { PaymentActionState } from "@/lib/payment/schemas";

const initialState: PaymentActionState = { status: "idle", message: "" };

export function DemoPaymentForm({
  bookingId,
  idempotencyKey,
  total,
}: {
  bookingId: string;
  idempotencyKey: string;
  total: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(simulatePaymentAction, initialState);

  useEffect(() => {
    if (state.status === "success" && state.bookingId) {
      router.push(`/booking/confirmation?booking=${encodeURIComponent(state.bookingId)}`);
    }
  }, [router, state.bookingId, state.status]);

  return (
    <form action={formAction} className="mt-8">
      <input name="bookingId" type="hidden" value={bookingId} />
      <input
        name="idempotencyKey"
        type="hidden"
        value={state.nextIdempotencyKey ?? idempotencyKey}
      />

      <fieldset className="space-y-3" disabled={pending || state.status === "success"}>
        <legend className="sr-only">Choose a demo payment result</legend>
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-primary bg-brand-teal-subtle p-4">
          <input className="accent-primary" defaultChecked name="outcome" type="radio" value="APPROVE" />
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary"><CreditCard className="size-5" /></span>
          <span className="flex-1"><strong className="block text-sm">Approve demo payment</strong><span className="text-xs text-muted-foreground">Confirms the booking without charging real money.</span></span>
          <Check className="size-5 text-primary" aria-hidden="true" />
        </label>
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border p-4 hover:bg-secondary">
          <input className="accent-primary" name="outcome" type="radio" value="DECLINE" />
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground"><XCircle className="size-5" /></span>
          <span className="flex-1"><strong className="block text-sm">Decline demo payment</strong><span className="text-xs text-muted-foreground">Shows the retry and failed-payment state.</span></span>
        </label>
      </fieldset>

      <Button className="mt-8 min-h-14 w-full" disabled={pending || state.status === "success"} size="lg" type="submit">
        {state.status === "success" ? "Confirmed. Redirecting…" : pending ? "Processing demo payment…" : `Pay ${formatIdr(total)}`}
      </Button>

      <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-muted-foreground">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0" />Portfolio simulation only. No card, bank, wallet, or real funds are used.
      </p>
      {state.message ? (
        <Alert
          aria-live="polite"
          className="mt-4"
          role={state.status === "error" ? "alert" : "status"}
          variant={state.status === "success" ? "success" : state.status === "declined" ? "warning" : "destructive"}
        >
          <AlertDescription className="font-semibold">
            {state.message}
            {state.attemptReference ? <span className="mt-1 block text-xs font-medium">Reference: {state.attemptReference}</span> : null}
          </AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
