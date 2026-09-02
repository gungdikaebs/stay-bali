"use client";

import { WorkspaceError } from "@/components/dashboard/workspace-feedback";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <WorkspaceError reset={reset} />;
}
