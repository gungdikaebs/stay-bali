import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";

export function SignOutButton() {
  return (
    <form action={logout}>
      <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold transition hover:bg-secondary" type="submit">
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}
