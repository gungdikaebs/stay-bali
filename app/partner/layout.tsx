import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { requireActivePartner } from "@/lib/auth/authorization";

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const partner = await requireActivePartner();

  return (
    <WorkspaceShell
      accountEmail={partner.email}
      accountName={partner.name}
      kind="partner"
      workspaceName={partner.partnerProfile.businessName}
    >
      {children}
    </WorkspaceShell>
  );
}
