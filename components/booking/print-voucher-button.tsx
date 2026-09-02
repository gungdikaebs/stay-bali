"use client";

import { Printer } from "lucide-react";

export function PrintVoucherButton() {
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={() => window.print()}
      type="button"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print voucher
    </button>
  );
}
