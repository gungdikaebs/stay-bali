import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StayBaliLogo } from "@/components/landing/public-header";
import { PartnerNavigation } from "@/components/partner/partner-navigation";
import { requireActivePartner } from "@/lib/auth/authorization";

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const partner = await requireActivePartner();

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-white px-5 py-6 lg:flex lg:flex-col">
        <StayBaliLogo />
        <div className="mt-8 rounded-2xl bg-brand-teal-subtle p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary"><Building2 className="size-4" />Partner workspace</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Manage supply owned by {partner.partnerProfile.businessName}.</p>
        </div>
        <PartnerNavigation />
        <Link className="mt-auto text-sm font-bold text-primary hover:underline" href="/">View public website</Link>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-white px-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Active partner</p>
            <p className="mt-1 font-bold">{partner.partnerProfile.businessName}</p>
          </div>
          <SignOutButton />
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
