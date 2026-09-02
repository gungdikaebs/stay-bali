import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <form action={logout}>
      <Button aria-label={compact ? "Sign out" : undefined} className={cn(className)} size={compact ? "icon" : "sm"} type="submit" variant="outline">
        <LogOut className="size-4" aria-hidden="true" />
        {compact ? <span className="sr-only">Sign out</span> : "Sign out"}
      </Button>
    </form>
  );
}
