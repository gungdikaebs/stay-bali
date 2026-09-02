import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { StayBaliLogo } from "@/components/landing/public-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getRoleHome } from "@/lib/auth/policies";
import { safeInternalRedirect } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a StayBali traveler account and manage your bookings.",
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const rawCallback = (await searchParams).callbackUrl;
  const callbackUrl = safeInternalRedirect(Array.isArray(rawCallback) ? rawCallback[0] : rawCallback, "/account");
  const user = await getCurrentUser();
  if (user) redirect(getRoleHome(user.role));

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(540px,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-foreground lg:block">
        <Image fill priority alt="A tropical Bali stay surrounded by greenery" className="object-cover" sizes="55vw" src="/images/stay-sanur.jpg" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-foreground/25" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#8ce0d4]">Your Bali stays, in one place</p>
          <h1 className="font-display mt-4 max-w-xl text-5xl font-extrabold tracking-[-0.05em]">Save your booking journey from search to stay.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">Create a traveler account to complete checkout, follow booking status, and access your voucher.</p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <StayBaliLogo />
          <Button asChild variant="ghost"><Link href="/"><ArrowLeft className="size-4" />Home</Link></Button>
        </div>
        <div className="my-auto mx-auto w-full max-w-lg py-12">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><UserPlus className="size-5" /></span>
          <h2 className="font-display mt-5 text-4xl font-extrabold tracking-[-0.05em]">Create your account.</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Traveler accounts are free and let you securely manage your own StayBali bookings.</p>
          <SignUpForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
