import type { PropertyStatus } from "@/generated/prisma/client";

export type SubmissionSnapshot = {
  facilityCount: number;
  readyMediaCount: number;
  activeRoomCount: number;
};

export function getSubmissionIssues(snapshot: SubmissionSnapshot) {
  const issues: string[] = [];
  if (snapshot.facilityCount < 5) issues.push("Add at least 5 property facilities.");
  if (snapshot.readyMediaCount < 3) issues.push("Add at least 3 ready property photos.");
  if (snapshot.activeRoomCount < 1) issues.push("Add at least 1 active room type.");
  return issues;
}

export function canPartnerEditProperty(status: PropertyStatus) {
  return status === "DRAFT" || status === "REJECTED" || status === "PUBLISHED";
}

export function statusAfterMaterialPartnerEdit(status: PropertyStatus): PropertyStatus {
  if (status === "PUBLISHED") return "PENDING_REVIEW";
  return "DRAFT";
}

export function canSubmitProperty(status: PropertyStatus) {
  return status === "DRAFT" || status === "REJECTED";
}

export function isAdminPropertyTransitionAllowed(
  currentStatus: PropertyStatus,
  nextStatus: PropertyStatus,
) {
  if (currentStatus === "PENDING_REVIEW") {
    return nextStatus === "PUBLISHED" || nextStatus === "REJECTED";
  }
  if (currentStatus === "PUBLISHED") return nextStatus === "SUSPENDED";
  if (currentStatus === "SUSPENDED") return nextStatus === "PUBLISHED";
  return false;
}

export function getAdminPropertyTransitions(status: PropertyStatus): readonly PropertyStatus[] {
  if (status === "PENDING_REVIEW") return ["PUBLISHED", "REJECTED"];
  if (status === "PUBLISHED") return ["SUSPENDED"];
  if (status === "SUSPENDED") return ["PUBLISHED"];
  return [];
}

export function slugifyPropertyName(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{M}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}
