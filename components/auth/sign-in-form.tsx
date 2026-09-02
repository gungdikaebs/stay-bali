"use client";

import { useActionState } from "react";
import { authenticate, type SignInState } from "@/app/sign-in/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignInState = { message: "" };

export function SignInForm({ callbackUrl = "/workspace" }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <Label className="block" htmlFor="email">
        Email address
        <Input className="mt-2 h-12" autoComplete="email" id="email" name="email" required type="email" placeholder="you@example.com" />
      </Label>
      <Label className="block" htmlFor="password">
        Password
        <Input className="mt-2 h-12" autoComplete="current-password" id="password" minLength={8} name="password" required type="password" placeholder="Enter your password" />
      </Label>
      {state.message ? (
        <Alert aria-live="polite" variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">Secure access for travelers, active partners, and administrators.</p>
    </form>
  );
}
