import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const accents = {
  teal: "bg-brand-teal-subtle text-primary",
  green: "bg-success-subtle text-success",
  amber: "bg-warning-subtle text-warning",
  coral: "bg-accent text-accent-foreground",
  neutral: "bg-secondary text-foreground",
  blue: "bg-info-subtle text-info",
};

export function MetricCard({ label, value, helper, icon: Icon, accent = "teal", trend }: { label: string; value: string | number; helper?: string; icon: LucideIcon; accent?: keyof typeof accents; trend?: { value: string; direction: "up" | "down" | "neutral" } }) {
  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;
  return (
    <article className="group rounded-2xl border border-border/90 bg-white p-5 shadow-[0_1px_2px_rgba(23,33,29,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("flex size-10 items-center justify-center rounded-xl", accents[accent])}><Icon className="size-5" aria-hidden="true" /></span>
        {trend ? <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"><TrendIcon className="size-3.5" aria-hidden="true" />{trend.value}</span> : null}
      </div>
      <p className="font-display mt-5 text-3xl font-extrabold tracking-[-0.04em] tabular-nums sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{label}</p>
      {helper ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </article>
  );
}
