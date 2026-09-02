"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-destructive/15 bg-white p-7 text-center shadow-sm sm:p-10">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive-subtle text-destructive"><AlertTriangle className="size-5" aria-hidden="true" /></span>
      <h1 className="font-display mt-5 text-2xl font-extrabold">We couldn&apos;t load this workspace</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Your data is safe. Try loading the page again; if the issue continues, check the service health before making changes.</p>
      <Button className="mt-6" onClick={reset} type="button"><RotateCcw className="size-4" aria-hidden="true" />Try again</Button>
    </section>
  );
}

export function WorkspaceLoading() {
  return (
    <div className="mx-auto max-w-[1500px] animate-pulse" aria-label="Loading workspace" role="status">
      <div className="h-3 w-28 rounded bg-muted" />
      <div className="mt-4 h-10 w-64 max-w-full rounded-xl bg-muted" />
      <div className="mt-4 h-4 w-[34rem] max-w-full rounded bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div className="h-44 rounded-2xl border border-border bg-white" key={item} />)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-2xl border border-border bg-white xl:col-span-2" />
        <div className="h-80 rounded-2xl border border-border bg-white" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
