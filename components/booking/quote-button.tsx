"use client";

import { useActionState } from "react";
import { createQuoteAction, type QuoteActionState } from "@/app/stays/quote-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
      {state.message ? <Alert className="mb-3" variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Creating secure quote…" : "Reserve this stay"}
      </Button>
    </form>
  );
}
