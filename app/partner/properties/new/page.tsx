import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PropertyForm } from "@/components/partner/supply-forms";
import { listSupplyFacilities } from "@/lib/supply/properties";

export const metadata: Metadata = { title: "Create property" };

export default async function NewPropertyPage() {
  const facilities = await listSupplyFacilities();
  return (
    <div className="mx-auto max-w-5xl">
      <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" href="/partner/properties"><ArrowLeft className="size-4" aria-hidden="true" />Back to properties</Link>
      <PageHeader className="mt-6" description="Start with accurate guest-facing information. Ownership is assigned securely from your authenticated Partner profile." eyebrow="New supply" title="Create a draft property" />
      <section className="mt-8 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8"><PropertyForm facilities={facilities} /></section>
    </div>
  );
}
