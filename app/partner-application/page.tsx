import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import { PartnerApplicationForm } from "@/components/auth/partner-application-form";
import { StayBaliLogo } from "@/components/landing/public-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/authorization";
import { getRoleHome } from "@/lib/auth/policies";

export const metadata: Metadata = {
  title: "Become a Partner",
  description: "Apply to manage your Bali property with StayBali.",
};

const benefits = [
  "Manage properties, rooms, media, and nightly inventory.",
  "Receive online and manual reservations in one workspace.",
  "Publish only after StayBali administrator review.",
];

export default async function PartnerApplicationPage() {
  const user = await getCurrentUser();
  if (user) redirect(getRoleHome(user.role));

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,0.85fr)_minmax(600px,1fr)]">
      <section className="relative hidden overflow-hidden bg-foreground lg:block">
        <Image fill preload alt="A professionally managed Bali villa" className="object-cover" sizes="48vw" src="/images/stay-seminyak.jpg" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/35 to-foreground/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#8ce0d4]">StayBali for property partners</p>
          <h1 className="font-display mt-4 max-w-xl text-5xl font-extrabold tracking-[-0.05em]">Bring your Bali property into one connected workspace.</h1>
          <div className="mt-7 grid gap-3">
            {benefits.map((benefit) => (
              <p className="flex items-start gap-3 text-sm leading-6 text-white/80" key={benefit}><CheckCircle2 className="mt-1 size-4 shrink-0 text-[#8ce0d4]" aria-hidden="true" />{benefit}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <StayBaliLogo />
          <Button asChild variant="ghost"><Link href="/"><ArrowLeft className="size-4" />Home</Link></Button>
        </div>
        <div className="my-auto mx-auto w-full max-w-xl py-12">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><Building2 className="size-5" /></span>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-primary">Partner application</p>
          <h2 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Tell us about your business.</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Create your Partner credentials and submit your profile for administrator review. Access opens only after approval.</p>
          <PartnerApplicationForm />
        </div>
      </section>
    </main>
  );
}
