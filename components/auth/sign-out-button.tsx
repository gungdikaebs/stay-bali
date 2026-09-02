import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={logout}>
      <Button size="sm" type="submit" variant="outline">
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
