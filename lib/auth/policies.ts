import type { PartnerStatus, UserRole } from "@/generated/prisma/client";

export type AuthorizationSubject = {
  role: UserRole;
  partnerProfileId?: string | null;
  partnerStatus?: PartnerStatus | null;
};

const allowedPartnerTransitions: Record<PartnerStatus, readonly PartnerStatus[]> = {
  PENDING: ["ACTIVE", "REJECTED"],
  ACTIVE: ["SUSPENDED"],
  SUSPENDED: ["ACTIVE", "REJECTED"],
  REJECTED: ["PENDING"],
};

export function isPartnerStatusTransitionAllowed(
  currentStatus: PartnerStatus,
  nextStatus: PartnerStatus,
) {
  return allowedPartnerTransitions[currentStatus].includes(nextStatus);
}

export function getAllowedPartnerTransitions(currentStatus: PartnerStatus) {
  return allowedPartnerTransitions[currentStatus];
}

export function canAccessProtectedPath(role: UserRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/partner")) return role === "PARTNER";
  if (pathname.startsWith("/account")) return role === "TRAVELER";
  return true;
}

export function getRoleHome(role: UserRole) {
  if (role === "ADMIN") return "/admin";
  if (role === "PARTNER") return "/partner";
  return "/account";
}

export function canAccessProperty(
  subject: AuthorizationSubject,
  ownerPartnerId: string,
) {
  if (subject.role === "ADMIN") return true;

  return (
    subject.role === "PARTNER" &&
    subject.partnerStatus === "ACTIVE" &&
    subject.partnerProfileId === ownerPartnerId
  );
}
