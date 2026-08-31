"use client";

import { useActionState } from "react";
import { authenticate, type SignInState } from "@/app/sign-in/actions";

const initialState: SignInState = { message: "" };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  const fieldClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold" htmlFor="email">
        Email address
        <input className={fieldClassName} autoComplete="email" id="email" name="email" required type="email" placeholder="you@example.com" />
      </label>
      <label className="block text-sm font-semibold" htmlFor="password">
        Password
        <input className={fieldClassName} autoComplete="current-password" id="password" minLength={8} name="password" required type="password" placeholder="Enter your password" />
      </label>
      {state.message ? (
        <p aria-live="polite" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="min-h-12 w-full rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">Secure access for travelers, active partners, and administrators.</p>
    </form>
  );
}
