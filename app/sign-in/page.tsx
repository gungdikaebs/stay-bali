import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { PartnerStatus, UserRole } from "@/generated/prisma/client";
import { SignInForm } from "@/components/auth/sign-in-form";
import { StayBaliLogo } from "@/components/landing/public-header";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getRoleHome } from "@/lib/auth/policies";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure access to your StayBali workspace.",
};

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (
    user &&
    (user.role !== UserRole.PARTNER ||
      user.partnerProfile?.status === PartnerStatus.ACTIVE)
  ) {
    redirect(getRoleHome(user.role));
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.75fr)]">
      <section className="relative hidden overflow-hidden bg-foreground lg:block">
        <Image fill priority alt="A peaceful Bali villa surrounded by tropical greenery" className="object-cover" sizes="60vw" src="/images/stay-ubud.jpg" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-foreground/25" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#8ce0d4]">StayBali workspace</p>
          <h1 className="font-display mt-4 max-w-xl text-5xl font-extrabold tracking-[-0.05em]">One secure entrance for every StayBali journey.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">Manage stays, operate your properties, or continue planning your Bali trip.</p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <StayBaliLogo />
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:bg-secondary" href="/"><ArrowLeft className="size-4" />Home</Link>
        </div>
        <div className="my-auto mx-auto w-full max-w-md py-12">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><ShieldCheck className="size-5" /></span>
          <h2 className="font-display mt-5 text-4xl font-extrabold tracking-[-0.05em]">Welcome back.</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Use your credentials to access the workspace assigned to your account.</p>
          <SignInForm />
          <p className="mt-7 text-center text-sm text-muted-foreground">Looking for a stay? <Link className="font-bold text-primary hover:underline" href="/">Return to StayBali</Link></p>
        </div>
      </section>
    </main>
  );
}
