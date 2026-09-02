"use client";

import { useActionState } from "react";
import { CircleCheckBig, LogIn } from "lucide-react";
import { transitionBookingOperationAction } from "@/app/actions/booking-actions";
import type { OperationalBookingActionState } from "@/lib/booking/schemas";

const initialState: OperationalBookingActionState = {
  status: "idle",
  message: "",
};

export function BookingOperationForm({
  bookingId,
  nextStatus,
}: {
  bookingId: string;
  nextStatus: "CHECKED_IN" | "COMPLETED";
}) {
  const [state, formAction, pending] = useActionState(
    transitionBookingOperationAction,
    initialState,
  );
  const isCheckIn = nextStatus === "CHECKED_IN";
  const Icon = isCheckIn ? LogIn : CircleCheckBig;

  return (
    <form action={formAction} className="mt-4">
      <input name="bookingId" type="hidden" value={bookingId} />
      <input name="nextStatus" type="hidden" value={nextStatus} />
      <button
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        disabled={pending || state.status === "success"}
        type="submit"
      >
        <Icon className="size-4" aria-hidden="true" />
        {pending ? "Saving…" : isCheckIn ? "Check in guest" : "Complete stay"}
      </button>
      <p
        aria-live="polite"
        className={state.message
          ? `mt-2 text-sm font-semibold ${state.status === "success" ? "text-success" : "text-red-700"}`
          : "sr-only"}
      >
        {state.message}
      </p>
    </form>
  );
}
