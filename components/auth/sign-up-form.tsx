"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignUpState } from "@/app/sign-up/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignUpState = { message: "" };

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-2 text-sm text-destructive" id={id}>
      {errors[0]}
    </p>
  );
}

export function SignUpForm({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <Label className="block" htmlFor="name">
        Full name
        <Input aria-describedby={state.errors?.name ? "name-error" : undefined} aria-invalid={Boolean(state.errors?.name)} autoComplete="name" className="mt-2 h-12" id="name" maxLength={100} name="name" placeholder="Your full name" required />
        <FieldError errors={state.errors?.name} id="name-error" />
      </Label>
      <Label className="block" htmlFor="email">
        Email address
        <Input aria-describedby={state.errors?.email ? "email-error" : undefined} aria-invalid={Boolean(state.errors?.email)} autoComplete="email" className="mt-2 h-12" id="email" maxLength={254} name="email" placeholder="you@example.com" required type="email" />
        <FieldError errors={state.errors?.email} id="email-error" />
      </Label>
      <Label className="block" htmlFor="phone">
        Phone number <span className="font-normal text-muted-foreground">(optional)</span>
        <Input aria-describedby={state.errors?.phone ? "phone-error" : undefined} aria-invalid={Boolean(state.errors?.phone)} autoComplete="tel" className="mt-2 h-12" id="phone" inputMode="tel" maxLength={30} name="phone" placeholder="+62 812 3456 7890" type="tel" />
        <FieldError errors={state.errors?.phone} id="phone-error" />
      </Label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label className="block" htmlFor="password">
          Password
          <Input aria-describedby={state.errors?.password ? "password-help password-error" : "password-help"} aria-invalid={Boolean(state.errors?.password)} autoComplete="new-password" className="mt-2 h-12" id="password" maxLength={128} minLength={8} name="password" required type="password" />
          <span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground" id="password-help">Use 8+ characters with a letter and number.</span>
          <FieldError errors={state.errors?.password} id="password-error" />
        </Label>
        <Label className="block" htmlFor="confirmPassword">
          Confirm password
          <Input aria-describedby={state.errors?.confirmPassword ? "confirm-password-error" : undefined} aria-invalid={Boolean(state.errors?.confirmPassword)} autoComplete="new-password" className="mt-2 h-12" id="confirmPassword" maxLength={128} minLength={8} name="confirmPassword" required type="password" />
          <FieldError errors={state.errors?.confirmPassword} id="confirm-password-error" />
        </Label>
      </div>
      {state.message ? (
        <Alert aria-live="polite" variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Creating account…" : "Create traveler account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-bold text-primary hover:underline" href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign in</Link>
      </p>
    </form>
  );
}
