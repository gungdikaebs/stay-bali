import type { Metadata } from "next";
import { changePartnerStatusAction } from "@/app/admin/partners/actions";
import { listPartnersForAdmin } from "@/lib/admin/partners";
import { getAllowedPartnerTransitions } from "@/lib/auth/policies";

export const metadata: Metadata = {
  title: "Partners",
};

export default async function AdminPartnersPage() {
  const partners = await listPartnersForAdmin();

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Supply partners</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Partners</h1>
      <p className="mt-3 text-muted-foreground">Review access for registered StayBali operators. Every status change revokes older sessions and writes an audit entry.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-white">
        {partners.map((partner) => (
          <article className="grid gap-5 border-b border-border p-5 last:border-b-0 xl:grid-cols-[minmax(0,1fr)_150px_minmax(320px,0.8fr)] xl:items-center" key={partner.id}>
            <div>
              <h2 className="font-bold">{partner.businessName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{partner.user.name} · {partner.user.email}</p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{partner._count.properties} properties · Updated {partner.updatedAt.toLocaleDateString("en-ID")}</p>
            </div>
            <span className="w-fit rounded-full bg-brand-teal-subtle px-3 py-1 text-xs font-bold text-primary">{partner.status}</span>
            <form action={changePartnerStatusAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input name="partnerId" type="hidden" value={partner.id} />
              <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                Decision
                <select className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-foreground" name="nextStatus" required>
                  {getAllowedPartnerTransitions(partner.status).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <button className="self-end rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary" type="submit">Apply</button>
              <label className="grid gap-1 text-xs font-bold text-muted-foreground sm:col-span-2">
                Admin note (optional)
                <input className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-normal text-foreground" defaultValue={partner.adminNote ?? ""} maxLength={500} name="adminNote" placeholder="Reason for this decision" />
              </label>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
