import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { requireTraveler } from "@/lib/auth/authorization";

export default async function TravelerLayout({ children }: { children: ReactNode }) {
  const traveler = await requireTraveler();
  return <WorkspaceShell accountEmail={traveler.email} accountName={traveler.name} kind="traveler">{children}</WorkspaceShell>;
}
