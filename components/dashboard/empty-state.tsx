import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="px-5 py-12 text-center sm:px-8 sm:py-14">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="size-5" aria-hidden="true" /></span>
      <h3 className="font-display mt-4 text-lg font-extrabold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
