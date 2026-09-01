"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, UserRound } from "lucide-react";
import { confirmBookingAction } from "@/app/actions/booking-actions";
import type { BookingActionState } from "@/lib/booking/schemas";

const initialState: BookingActionState = { status: "idle", message: "" };
const fieldClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary";

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

      <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold">
          <UserRound className="size-5 text-primary" />
          Guest details
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Full name
            <input autoComplete="name" className={fieldClassName} disabled={pending} maxLength={100} minLength={2} name="guestName" placeholder="Name as shown on ID" required />
            <FieldError errors={state.errors?.guestName} />
          </label>
          <label className="text-sm font-semibold">
            Email address
            <input autoComplete="email" className={fieldClassName} disabled={pending} maxLength={254} name="guestEmail" placeholder="you@example.com" required type="email" />
            <FieldError errors={state.errors?.guestEmail} />
          </label>
          <label className="text-sm font-semibold">
            Phone number
            <input autoComplete="tel" className={fieldClassName} disabled={pending} maxLength={20} minLength={8} name="guestPhone" placeholder="+62 812 3456 7890" required type="tel" />
            <FieldError errors={state.errors?.guestPhone} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Special requests <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-white p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary" disabled={pending} maxLength={500} name="specialRequest" placeholder="Arrival time, accessibility needs, or anything the property should know" />
            <FieldError errors={state.errors?.specialRequest} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold">
          <CreditCard className="size-5 text-primary" />
          Payment method
        </h2>
        <div className="mt-6 flex items-start gap-4 rounded-xl border-2 border-primary bg-brand-teal-subtle p-4">
          <span className="flex-1">
            <strong className="block text-sm">Secure online payment</strong>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">Your room will be reserved before continuing to the payment page.</span>
          </span>
          <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input className="mt-1.5 accent-primary" disabled={pending} name="agreeCancellationPolicy" required type="checkbox" value="true" />
        <span>I agree to the property rules and cancellation policy: {cancellationPolicy}</span>
      </label>

      {state.message && state.status === "error" ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="min-h-14 w-full rounded-xl bg-primary px-6 text-base font-bold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60" disabled={pending || state.status === "success"} type="submit">
        {state.status === "success"
          ? "Reservation created. Redirecting…"
          : pending
            ? "Securing your reservation…"
            : "Reserve & continue to payment"}
      </button>
    </form>
  );
}
