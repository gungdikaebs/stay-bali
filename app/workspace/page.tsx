import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { getRoleHome } from "@/lib/auth/policies";

export default async function WorkspaceRedirectPage() {
  const user = await requireAuthenticatedUser();
  redirect(getRoleHome(user.role));
}
