import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return <WorkspaceShell accountEmail={user.email} accountName={user.name} kind="admin">{children}</WorkspaceShell>;
}
