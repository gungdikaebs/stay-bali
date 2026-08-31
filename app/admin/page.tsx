import type { Metadata } from "next";
import { Building2, CircleCheckBig, Clock3, DoorOpen } from "lucide-react";
import { PropertyStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin overview",
  description: "StayBali marketplace operations overview.",
};

export default async function AdminPage() {
  await requireAdmin();

  const [activePartners, pendingProperties, publishedProperties, activeRooms] = await Promise.all([
    prisma.partnerProfile.count({ where: { status: "ACTIVE" } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING_REVIEW } }),
    prisma.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
    prisma.roomType.count({ where: { isActive: true, archivedAt: null } }),
  ]);

  const metrics = [
    { label: "Active partners", value: activePartners, icon: CircleCheckBig, accent: "bg-success-subtle text-success" },
    { label: "Pending review", value: pendingProperties, icon: Clock3, accent: "bg-warning-subtle text-warning" },
    { label: "Published stays", value: publishedProperties, icon: Building2, accent: "bg-brand-teal-subtle text-primary" },
    { label: "Active room types", value: activeRooms, icon: DoorOpen, accent: "bg-secondary text-foreground" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Operations overview</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">Good to see you.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">A live snapshot of the StayBali supply foundation. Review queues and operational actions will appear here as we build them.</p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace metrics">
        {metrics.map(({ label, value, icon: Icon, accent }) => (
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm" key={label}>
            <span className={`flex size-10 items-center justify-center rounded-xl ${accent}`}><Icon className="size-5" aria-hidden="true" /></span>
            <p className="font-display mt-5 text-4xl font-extrabold tracking-[-0.04em]">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-white p-6 sm:p-8">
        <p className="text-sm font-bold text-primary">Foundation ready</p>
        <h2 className="font-display mt-2 text-2xl font-extrabold tracking-[-0.03em]">Authentication is the first operational checkpoint.</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">This workspace now reads authenticated admin identity and current database state on the server. Partner review and property approval workflows are the next dashboard capabilities.</p>
      </section>
    </div>
  );
}
