import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative grid gap-1 rounded-xl border px-4 py-3.5 text-sm [&>svg]:size-4", {
  variants: {
    variant: {
      default: "border-border bg-card text-card-foreground",
      success: "border-success/20 bg-success-subtle text-success",
      warning: "border-warning/20 bg-warning-subtle text-warning",
      destructive: "border-destructive/20 bg-destructive-subtle text-destructive",
      info: "border-info/20 bg-info-subtle text-info",
    },
  },
  defaultVariants: { variant: "default" },
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-bold", className)} {...props} />;
}
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("leading-6 opacity-90", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
