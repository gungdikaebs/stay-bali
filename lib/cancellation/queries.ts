import "server-only";

import { UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function getAdminCancellationRequests() {
  const actor = await getCurrentUser();
  if (!actor || actor.role !== UserRole.ADMIN) throw new Error("Unauthorized.");

  return prisma.cancellationRequest.findMany({
    select: {
      id: true,
      reason: true,
      eligibleForFullRefund: true,
      requestedRefundAmount: true,
      status: true,
      resolutionNote: true,
      createdAt: true,
      resolvedAt: true,
      requester: { select: { name: true, email: true } },
      booking: {
        select: {
          id: true,
          bookingCode: true,
          propertyName: true,
          roomName: true,
          checkinDate: true,
          grandTotal: true,
          status: true,
        },
      },
      refund: { select: { amount: true, currency: true, reference: true, createdAt: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}
