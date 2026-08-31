import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PartnerStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      sessionVersion: true,
      partnerProfile: {
        select: {
          id: true,
          status: true,
          businessName: true,
        },
      },
    },
  });

  if (
    !user ||
    user.status !== UserStatus.ACTIVE ||
    user.sessionVersion !== session.user.sessionVersion
  ) {
    return null;
  }

  return user;
});

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return user;
}

export async function requireAdmin() {
  const user = await requireAuthenticatedUser();
  if (user.role !== UserRole.ADMIN) redirect("/");

  return user;
}

export async function requireTraveler() {
  const user = await requireAuthenticatedUser();
  if (user.role !== UserRole.TRAVELER) redirect("/");

  return user;
}

export async function requireActivePartner() {
  const user = await requireAuthenticatedUser();

  if (
    user.role !== UserRole.PARTNER ||
    !user.partnerProfile ||
    user.partnerProfile.status !== PartnerStatus.ACTIVE
  ) {
    redirect("/");
  }

  return {
    ...user,
    partnerProfile: user.partnerProfile,
  };
}

export async function requirePropertyAccess(propertyId: string) {
  const user = await requireAuthenticatedUser();

  const property = await prisma.property.findFirst({
    where:
      user.role === UserRole.ADMIN
        ? { id: propertyId }
        : user.role === UserRole.PARTNER &&
            user.partnerProfile?.status === PartnerStatus.ACTIVE
          ? { id: propertyId, ownerPartnerId: user.partnerProfile.id }
          : { id: "__not_authorized__" },
    select: {
      id: true,
      ownerPartnerId: true,
      status: true,
    },
  });

  if (!property) notFound();

  return { property, user };
}

export async function requireOwnedProperty(propertyId: string) {
  const partner = await requireActivePartner();
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerPartnerId: partner.partnerProfile.id,
      archivedAt: null,
    },
    select: {
      id: true,
      ownerPartnerId: true,
      status: true,
    },
  });

  if (!property) notFound();

  return { partner, property };
}
