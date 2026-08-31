import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StayBaliLogo } from "@/components/landing/public-header";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-white px-5 py-6 lg:flex lg:flex-col">
        <StayBaliLogo />
        <div className="mt-8 rounded-2xl bg-brand-teal-subtle p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary"><ShieldCheck className="size-4" />Admin workspace</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Review supply and oversee marketplace operations.</p>
        </div>
        <AdminNavigation />
        <Link className="mt-auto text-sm font-bold text-primary hover:underline" href="/">View public website</Link>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-white px-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Signed in as</p>
            <p className="mt-1 font-bold">{user.name}</p>
          </div>
          <SignOutButton />
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
