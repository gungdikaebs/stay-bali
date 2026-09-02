"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, UserRound } from "lucide-react";
import { confirmBookingAction } from "@/app/actions/booking-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingActionState } from "@/lib/booking/schemas";

const initialState: BookingActionState = { status: "idle", message: "" };
function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0]
    ? <span className="mt-1 block text-xs font-medium text-red-700">{errors[0]}</span>
    : null;
}

export function CheckoutBookingForm({
  quoteId,
  adultCount,
  childCount,
  idempotencyKey,
  cancellationPolicy,
}: {
  quoteId: string;
  adultCount: number;
  childCount: number;
  idempotencyKey: string;
  cancellationPolicy: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    confirmBookingAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success" && state.bookingId) {
      router.push(`/payment?booking=${encodeURIComponent(state.bookingId)}`);
    }
  }, [router, state.bookingId, state.status]);

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <input name="quoteId" type="hidden" value={quoteId} />
      <input name="adultCount" type="hidden" value={adultCount} />
      <input name="childCount" type="hidden" value={childCount} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />

      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <UserRound className="size-5 text-primary" />
          Guest details
        </CardTitle>
        </CardHeader>
        <CardContent className="mt-6 grid gap-5 sm:grid-cols-2">
          <Label className="block sm:col-span-2">
            Full name
            <Input aria-invalid={Boolean(state.errors?.guestName?.length)} autoComplete="name" className="mt-2 h-12" disabled={pending} maxLength={100} minLength={2} name="guestName" placeholder="Name as shown on ID" required />
            <FieldError errors={state.errors?.guestName} />
          </Label>
          <Label className="block">
            Email address
            <Input aria-invalid={Boolean(state.errors?.guestEmail?.length)} autoComplete="email" className="mt-2 h-12" disabled={pending} maxLength={254} name="guestEmail" placeholder="you@example.com" required type="email" />
            <FieldError errors={state.errors?.guestEmail} />
          </Label>
          <Label className="block">
            Phone number
            <Input aria-invalid={Boolean(state.errors?.guestPhone?.length)} autoComplete="tel" className="mt-2 h-12" disabled={pending} maxLength={20} minLength={8} name="guestPhone" placeholder="+62 812 3456 7890" required type="tel" />
            <FieldError errors={state.errors?.guestPhone} />
          </Label>
          <Label className="block sm:col-span-2">
            Special requests <span className="font-normal text-muted-foreground">(optional)</span>
            <Textarea aria-invalid={Boolean(state.errors?.specialRequest?.length)} className="mt-2 min-h-28 resize-y" disabled={pending} maxLength={500} name="specialRequest" placeholder="Arrival time, accessibility needs, or anything the property should know" />
            <FieldError errors={state.errors?.specialRequest} />
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-3">
          <CreditCard className="size-5 text-primary" />
          Payment method
        </CardTitle></CardHeader>
        <CardContent className="pt-6"><div className="flex items-start gap-4 rounded-xl border-2 border-primary bg-brand-teal-subtle p-4">
          <span className="flex-1">
            <strong className="block text-sm">Secure online payment</strong>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">Your room will be reserved before continuing to the payment page.</span>
          </span>
          <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
        </div></CardContent>
      </Card>

      <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input className="mt-1.5 accent-primary" disabled={pending} name="agreeCancellationPolicy" required type="checkbox" value="true" />
        <span>I agree to the property rules and cancellation policy: {cancellationPolicy}</span>
      </label>

      {state.message && state.status === "error" ? (
        <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>
      ) : null}

      <Button className="min-h-14 w-full" disabled={pending || state.status === "success"} size="lg" type="submit">
        {state.status === "success"
          ? "Reservation created. Redirecting…"
          : pending
            ? "Securing your reservation…"
            : "Reserve & continue to payment"}
      </Button>
    </form>
  );
}
