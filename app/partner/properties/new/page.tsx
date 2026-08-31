import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/partner/supply-forms";
import { listSupplyFacilities } from "@/lib/supply/properties";

export const metadata: Metadata = { title: "Create property" };

export default async function NewPropertyPage() {
  const facilities = await listSupplyFacilities();
  return (
    <div className="mx-auto max-w-5xl">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" href="/partner/properties"><ArrowLeft className="size-4" />Back to properties</Link>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.12em] text-primary">New supply</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Create a draft property</h1>
      <p className="mt-3 text-muted-foreground">Ownership is assigned from your authenticated Partner profile.</p>
      <section className="mt-8 rounded-3xl border border-border bg-white p-5 sm:p-8"><PropertyForm facilities={facilities} /></section>
    </div>
  );
}
