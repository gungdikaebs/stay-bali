import "server-only";

import type { PropertyStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { getSubmissionIssues, isAdminPropertyTransitionAllowed } from "@/lib/supply/rules";

export async function listPropertiesForAdmin() {
  await requireAdmin();
  return prisma.property.findMany({
    where: { archivedAt: null },
    select: {
      id: true,
      name: true,
      area: true,
      status: true,
      updatedAt: true,
      owner: { select: { businessName: true } },
      _count: {
        select: {
          facilities: true,
          media: { where: { media: { status: "READY" } } },
          rooms: { where: { isActive: true, archivedAt: null } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function changePropertyStatus(input: {
  propertyId: string;
  nextStatus: PropertyStatus;
  note?: string;
}) {
  const admin = await requireAdmin();

  await prisma.$transaction(async (transaction) => {
    const property = await transaction.property.findUnique({
      where: { id: input.propertyId },
      select: {
        id: true,
        status: true,
        _count: {
          select: {
            facilities: true,
            media: { where: { media: { status: "READY" } } },
            rooms: { where: { isActive: true, archivedAt: null } },
          },
        },
      },
    });
    if (!property || !isAdminPropertyTransitionAllowed(property.status, input.nextStatus)) {
      throw new Error("Invalid property status transition.");
    }

    if (input.nextStatus === "PUBLISHED") {
      const issues = getSubmissionIssues({
        facilityCount: property._count.facilities,
        readyMediaCount: property._count.media,
        activeRoomCount: property._count.rooms,
      });
      if (issues.length) throw new Error(issues.join(" "));
    }

    await transaction.property.update({
      where: { id: property.id },
      data: {
        status: input.nextStatus,
        publishedAt: input.nextStatus === "PUBLISHED" ? new Date() : undefined,
      },
    });
    await transaction.propertyReview.create({
      data: {
        propertyId: property.id,
        reviewerId: admin.id,
        previousState: property.status,
        nextState: input.nextStatus,
        note: input.note || null,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: admin.id,
        action: "PROPERTY_STATUS_CHANGED",
        entityType: "PROPERTY",
        entityId: property.id,
        metadata: {
          previousStatus: property.status,
          nextStatus: input.nextStatus,
          note: input.note || null,
        },
      },
    });
  });
}
