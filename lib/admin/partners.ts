import "server-only";

import type { PartnerStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { isPartnerStatusTransitionAllowed } from "@/lib/auth/policies";
import { prisma } from "@/lib/prisma";

export async function listPartnersForAdmin() {
  await requireAdmin();

  return prisma.partnerProfile.findMany({
    select: {
      id: true,
      businessName: true,
      status: true,
      adminNote: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
      _count: { select: { properties: true } },
    },
    orderBy: [{ status: "asc" }, { businessName: "asc" }],
  });
}

type ChangePartnerStatusInput = {
  partnerId: string;
  nextStatus: PartnerStatus;
  adminNote?: string;
};

export async function changePartnerStatus({
  partnerId,
  nextStatus,
  adminNote,
}: ChangePartnerStatusInput) {
  const admin = await requireAdmin();

  await prisma.$transaction(async (transaction) => {
    const partner = await transaction.partnerProfile.findUnique({
      where: { id: partnerId },
      select: { id: true, userId: true, status: true },
    });

    if (!partner) throw new Error("Partner not found.");
    if (!isPartnerStatusTransitionAllowed(partner.status, nextStatus)) {
      throw new Error("Invalid partner status transition.");
    }

    await transaction.partnerProfile.update({
      where: { id: partner.id },
      data: {
        status: nextStatus,
        adminNote: adminNote || null,
      },
    });

    // JWT sessions are stateless, so changing the version immediately revokes
    // any session issued before this administrative decision.
    await transaction.user.update({
      where: { id: partner.userId },
      data: { sessionVersion: { increment: 1 } },
    });

    await transaction.auditLog.create({
      data: {
        actorId: admin.id,
        action: "PARTNER_STATUS_CHANGED",
        entityType: "PARTNER_PROFILE",
        entityId: partner.id,
        metadata: {
          previousStatus: partner.status,
          nextStatus,
          adminNote: adminNote || null,
        },
      },
    });
  });
}
