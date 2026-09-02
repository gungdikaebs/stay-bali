import "server-only";

import { hash } from "bcryptjs";
import { Prisma, UserRole, UserStatus } from "@/generated/prisma/client";
import type { RegistrationInput } from "@/lib/auth/registration-schema";
import { prisma } from "@/lib/prisma";

export type RegistrationResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "EMAIL_IN_USE" };

export async function registerTraveler(
  input: RegistrationInput,
): Promise<RegistrationResult> {
  const passwordHash = await hash(input.password, 12);

  try {
    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email: input.email,
          name: input.name,
          phone: input.phone,
          role: UserRole.TRAVELER,
          status: UserStatus.ACTIVE,
          credential: {
            create: { passwordHash },
          },
        },
        select: { id: true },
      });

      await transaction.auditLog.create({
        data: {
          actorId: createdUser.id,
          action: "AUTH_SIGN_UP",
          entityType: "USER",
          entityId: createdUser.id,
          metadata: { role: UserRole.TRAVELER },
        },
      });

      return createdUser;
    });

    return { ok: true, userId: user.id };
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
