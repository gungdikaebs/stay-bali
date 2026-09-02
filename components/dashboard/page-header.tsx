import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, action, className }: { eyebrow: string; title: string; description: string; action?: ReactNode; className?: string }) {
  return (
    <header className={cn("flex flex-col justify-between gap-5 md:flex-row md:items-end", className)}>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.045em] text-balance sm:text-4xl xl:text-[2.75rem]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{description}</p>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div> : null}
    </header>
  );
}
