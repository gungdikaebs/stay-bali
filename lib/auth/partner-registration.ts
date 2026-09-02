import "server-only";

import { hash } from "bcryptjs";
import {
  PartnerStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";
import type { PartnerApplicationInput } from "@/lib/auth/partner-application-schema";
import { prisma } from "@/lib/prisma";

export type PartnerApplicationResult =
  | { ok: true; partnerId: string }
  | { ok: false; reason: "EMAIL_IN_USE" };

export async function registerPendingPartner(
  input: PartnerApplicationInput,
): Promise<PartnerApplicationResult> {
  const passwordHash = await hash(input.password, 12);

  try {
    const partner = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          email: input.email,
          name: input.name,
          phone: input.phone,
          role: UserRole.PARTNER,
          status: UserStatus.ACTIVE,
          credential: { create: { passwordHash } },
          partnerProfile: {
            create: {
              businessName: input.businessName,
              status: PartnerStatus.PENDING,
            },
          },
        },
        select: {
          id: true,
          partnerProfile: { select: { id: true } },
        },
      });

      if (!user.partnerProfile) {
        throw new Error("Partner profile was not created.");
      }

      await transaction.auditLog.create({
        data: {
          actorId: user.id,
          action: "PARTNER_APPLICATION_CREATED",
          entityType: "PARTNER_PROFILE",
          entityId: user.partnerProfile.id,
          metadata: { status: PartnerStatus.PENDING },
        },
      });

      return user.partnerProfile;
    });

    return { ok: true, partnerId: partner.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, reason: "EMAIL_IN_USE" };
    }

    throw error;
  }
}
