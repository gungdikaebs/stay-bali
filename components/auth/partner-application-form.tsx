"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import {
  submitPartnerApplication,
  type PartnerApplicationState,
} from "@/app/partner-application/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PartnerApplicationState = {
  submitted: false,
  message: "",
};

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return <p className="mt-2 text-sm text-destructive" id={id}>{errors[0]}</p>;
}

export function PartnerApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitPartnerApplication,
    initialState,
  );

  if (state.submitted) {
    return (
      <div className="mt-8 rounded-2xl border border-success/20 bg-success-subtle p-6 sm:p-7" aria-live="polite">
        <span className="flex size-12 items-center justify-center rounded-xl bg-white text-success shadow-sm">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h3 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.035em] text-foreground">Application received.</h3>
        <p className="mt-3 leading-7 text-muted-foreground">Our administrator will review your Partner profile. You can sign in after the application has been approved.</p>
        <div className="mt-5 grid gap-3 text-sm">
          <p className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /><span><strong className="text-foreground">Status: Pending review.</strong> Your workspace remains locked until approval.</span></p>
          <p className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /><span>Your role and approval status are controlled securely by StayBali.</span></p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild><Link href="/">Return home</Link></Button>
          <Button asChild variant="outline"><Link href="/sign-in?callbackUrl=/partner">Partner sign in</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Label className="block" htmlFor="partner-name">
          Full name
          <Input aria-describedby={state.errors?.name ? "partner-name-error" : undefined} aria-invalid={Boolean(state.errors?.name)} autoComplete="name" className="mt-2 h-12" id="partner-name" maxLength={100} name="name" placeholder="Your full name" required />
          <FieldError errors={state.errors?.name} id="partner-name-error" />
        </Label>
        <Label className="block" htmlFor="business-name">
          Business name
          <Input aria-describedby={state.errors?.businessName ? "business-name-error" : undefined} aria-invalid={Boolean(state.errors?.businessName)} autoComplete="organization" className="mt-2 h-12" id="business-name" maxLength={150} name="businessName" placeholder="Villa or company name" required />
          <FieldError errors={state.errors?.businessName} id="business-name-error" />
        </Label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label className="block" htmlFor="partner-email">
          Work email
          <Input aria-describedby={state.errors?.email ? "partner-email-error" : undefined} aria-invalid={Boolean(state.errors?.email)} autoComplete="email" className="mt-2 h-12" id="partner-email" maxLength={254} name="email" placeholder="you@business.com" required type="email" />
          <FieldError errors={state.errors?.email} id="partner-email-error" />
        </Label>
        <Label className="block" htmlFor="partner-phone">
          Phone number
          <Input aria-describedby={state.errors?.phone ? "partner-phone-error" : undefined} aria-invalid={Boolean(state.errors?.phone)} autoComplete="tel" className="mt-2 h-12" id="partner-phone" inputMode="tel" maxLength={30} name="phone" placeholder="+62 812 3456 7890" required type="tel" />
          <FieldError errors={state.errors?.phone} id="partner-phone-error" />
        </Label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label className="block" htmlFor="partner-password">
          Password
          <Input aria-describedby={state.errors?.password ? "partner-password-help partner-password-error" : "partner-password-help"} aria-invalid={Boolean(state.errors?.password)} autoComplete="new-password" className="mt-2 h-12" id="partner-password" maxLength={128} minLength={8} name="password" required type="password" />
          <span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground" id="partner-password-help">Use 8+ characters with a letter and number.</span>
          <FieldError errors={state.errors?.password} id="partner-password-error" />
        </Label>
        <Label className="block" htmlFor="partner-confirm-password">
          Confirm password
          <Input aria-describedby={state.errors?.confirmPassword ? "partner-confirm-password-error" : undefined} aria-invalid={Boolean(state.errors?.confirmPassword)} autoComplete="new-password" className="mt-2 h-12" id="partner-confirm-password" maxLength={128} minLength={8} name="confirmPassword" required type="password" />
          <FieldError errors={state.errors?.confirmPassword} id="partner-confirm-password-error" />
        </Label>
      </div>
      {state.message ? (
        <Alert aria-live="polite" variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Submitting application…" : "Apply as a StayBali Partner"}
      </Button>
      <p className="text-center text-sm leading-6 text-muted-foreground">Already approved? <Link className="font-bold text-primary hover:underline" href="/sign-in?callbackUrl=/partner">Sign in to your Partner workspace</Link></p>
    </form>
  );
}
