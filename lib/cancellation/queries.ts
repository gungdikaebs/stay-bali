import "server-only";

import { PartnerStatus, UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { getCancellationEscalationCutoff } from "./rules";

const cancellationSelect = {
  id: true,
  type: true,
  reason: true,
  eligibleForFullRefund: true,
  requestedRefundAmount: true,
  status: true,
  resolutionNote: true,
  createdAt: true,
  resolvedAt: true,
  requester: { select: { name: true, email: true, role: true } },
  booking: {
    select: {
      id: true,
      bookingCode: true,
      propertyName: true,
      roomName: true,
      checkinDate: true,
      grandTotal: true,
      status: true,
      source: true,
    },
  },
  refund: { select: { amount: true, currency: true, reference: true, createdAt: true } },
} as const;

export async function getCancellationReviewRequests(audience: "ADMIN" | "PARTNER") {
  const actor = await getCurrentUser();
  if (!actor) throw new Error("Unauthorized.");

  if (audience === "ADMIN") {
    if (actor.role !== UserRole.ADMIN) throw new Error("Unauthorized.");
    const escalationDeadline = getCancellationEscalationCutoff();
    return prisma.cancellationRequest.findMany({
      where: {
        booking: { source: "ONLINE" },
        OR: [
          { type: "PARTNER_INITIATED" },
          { type: "POLICY_EXCEPTION", status: "PENDING", createdAt: { lte: escalationDeadline } },
        ],
      },
      select: cancellationSelect,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
  }

  if (
    actor.role !== UserRole.PARTNER ||
    actor.partnerProfile?.status !== PartnerStatus.ACTIVE
  ) throw new Error("Unauthorized.");
  return prisma.cancellationRequest.findMany({
    where: {
      type: "POLICY_EXCEPTION",
      booking: { roomType: { property: { ownerPartnerId: actor.partnerProfile.id } } },
    },
    select: cancellationSelect,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}
