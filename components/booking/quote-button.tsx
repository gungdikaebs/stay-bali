"use client";

import { useActionState } from "react";
import { createQuoteAction, type QuoteActionState } from "@/app/stays/quote-actions";

const initialState: QuoteActionState = { message: "" };

export function QuoteButton(props: {
  slug: string;
  checkin: string;
  checkout: string;
  adults: number;
  childGuests: number;
}) {
  const [state, formAction, pending] = useActionState(createQuoteAction, initialState);
  return (
    <form action={formAction}>
      <input name="slug" type="hidden" value={props.slug} />
      <input name="checkin" type="hidden" value={props.checkin} />
      <input name="checkout" type="hidden" value={props.checkout} />
      <input name="adults" type="hidden" value={props.adults} />
      <input name="children" type="hidden" value={props.childGuests} />
      {state.message ? <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{state.message}</p> : null}
      <button className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Creating secure quote…" : "Reserve this stay"}
      </button>
    </form>
  );
}
