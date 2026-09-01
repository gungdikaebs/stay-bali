import "server-only";

import type { Prisma, PropertyStatus } from "@/generated/prisma/client";
import { requireActivePartner, requireOwnedProperty } from "@/lib/auth/authorization";
import {
  commitStagedImage,
  discardStagedImage,
  removeCommittedFiles,
  stageImage,
  type StagedImage,
} from "@/lib/media/storage";
import { MAX_PROPERTY_MEDIA } from "@/lib/media/rules";
import { assertUploadRateLimit } from "@/lib/media/upload-rate-limit";
import { prisma } from "@/lib/prisma";
import { canPartnerEditProperty, statusAfterMaterialPartnerEdit } from "@/lib/supply/rules";

async function transitionAfterMediaEdit(
  transaction: Prisma.TransactionClient,
  property: { id: string; status: PropertyStatus },
  actorId: string,
) {
  const nextStatus = statusAfterMaterialPartnerEdit(property.status);
  if (nextStatus === property.status) return;
  await transaction.property.update({ where: { id: property.id }, data: { status: nextStatus } });
  await transaction.propertyReview.create({
    data: {
      propertyId: property.id,
      reviewerId: actorId,
      previousState: property.status,
      nextState: nextStatus,
      note: "Property media changed by Partner.",
    },
  });
}

export async function addOwnedPropertyMedia(
  propertyId: string,
  files: File[],
  altText?: string,
) {
  const { partner, property } = await requireOwnedProperty(propertyId);
  if (!canPartnerEditProperty(property.status)) {
    throw new Error("Property media cannot be edited in its current state.");
  }
  assertUploadRateLimit(partner.id);
  if (!files.length || files.length > 10) {
    throw new Error("Upload between 1 and 10 images at a time.");
  }

  const existingCount = await prisma.propertyMedia.count({ where: { propertyId } });
  if (existingCount + files.length > MAX_PROPERTY_MEDIA) {
    throw new Error(`A property can have up to ${MAX_PROPERTY_MEDIA} images.`);
  }

  const stagedImages: StagedImage[] = [];
  const committedPaths: string[] = [];
  try {
    for (const file of files) stagedImages.push(await stageImage(file));

    await prisma.$transaction(async (transaction) => {
      const currentProperty = await transaction.property.findFirst({
        where: {
          id: propertyId,
          ownerPartnerId: partner.partnerProfile.id,
          archivedAt: null,
        },
        select: { id: true, status: true },
      });
      if (!currentProperty || !canPartnerEditProperty(currentProperty.status)) {
        throw new Error("Property media cannot be edited in its current state.");
      }
      const count = await transaction.propertyMedia.count({ where: { propertyId } });
      if (count + stagedImages.length > MAX_PROPERTY_MEDIA) {
        throw new Error(`A property can have up to ${MAX_PROPERTY_MEDIA} images.`);
      }

      for (const [index, staged] of stagedImages.entries()) {
        committedPaths.push(...await commitStagedImage(staged));
        const media = await transaction.mediaAsset.create({
          data: {
            uploadedById: partner.id,
            status: "READY",
            originalKey: staged.keys.original,
            displayKey: staged.keys.display,
            thumbnailKey: staged.keys.thumbnail,
            mimeType: "image/webp",
            sizeBytes: staged.sizeBytes,
            width: staged.width,
            height: staged.height,
            altText: altText?.trim() || null,
          },
          select: { id: true },
        });
        await transaction.propertyMedia.create({
          data: {
            propertyId,
            mediaId: media.id,
            sortOrder: count + index,
            isCover: count === 0 && index === 0,
          },
        });
      }

      await transitionAfterMediaEdit(transaction, currentProperty, partner.id);
      await transaction.auditLog.create({
        data: {
          actorId: partner.id,
          action: "PROPERTY_MEDIA_UPLOADED",
          entityType: "PROPERTY",
          entityId: propertyId,
          metadata: { count: stagedImages.length },
        },
      });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    await Promise.all(stagedImages.map(discardStagedImage));
    await removeCommittedFiles(committedPaths);
    throw error;
  }
}

export async function archiveOwnedPropertyMedia(propertyId: string, mediaId: string) {
  const partner = await requireActivePartner();
  await prisma.$transaction(async (transaction) => {
    const link = await transaction.propertyMedia.findFirst({
      where: {
        propertyId,
        mediaId,
        property: {
          ownerPartnerId: partner.partnerProfile.id,
          archivedAt: null,
        },
      },
      select: {
        isCover: true,
        property: { select: { id: true, status: true } },
      },
    });
    if (!link || !canPartnerEditProperty(link.property.status)) {
      throw new Error("Property image cannot be archived.");
    }

    await transaction.propertyMedia.delete({ where: { propertyId_mediaId: { propertyId, mediaId } } });
    const references = await Promise.all([
      transaction.propertyMedia.count({ where: { mediaId } }),
      transaction.roomMedia.count({ where: { mediaId } }),
    ]);
    if (references[0] + references[1] === 0) {
      await transaction.mediaAsset.update({
        where: { id: mediaId },
        data: { status: "ORPHANED", orphanedAt: new Date() },
      });
    }

    if (link.isCover) {
      const next = await transaction.propertyMedia.findFirst({
        where: { propertyId },
        orderBy: { sortOrder: "asc" },
        select: { mediaId: true },
      });
      if (next) {
        await transaction.propertyMedia.update({
          where: { propertyId_mediaId: { propertyId, mediaId: next.mediaId } },
          data: { isCover: true },
        });
      }
    }

    await transitionAfterMediaEdit(transaction, link.property, partner.id);
    await transaction.auditLog.create({
      data: {
        actorId: partner.id,
        action: "PROPERTY_MEDIA_ARCHIVED",
        entityType: "MEDIA_ASSET",
        entityId: mediaId,
        metadata: { propertyId },
      },
    });
  });
}

export async function setOwnedPropertyCover(propertyId: string, mediaId: string) {
  const partner = await requireActivePartner();
  await prisma.$transaction(async (transaction) => {
    const link = await transaction.propertyMedia.findFirst({
      where: { propertyId, mediaId, property: { ownerPartnerId: partner.partnerProfile.id, archivedAt: null } },
      select: { property: { select: { id: true, status: true } } },
    });
    if (!link || !canPartnerEditProperty(link.property.status)) throw new Error("Cover image cannot be changed.");
    await transaction.propertyMedia.updateMany({ where: { propertyId }, data: { isCover: false } });
    await transaction.propertyMedia.update({
      where: { propertyId_mediaId: { propertyId, mediaId } },
      data: { isCover: true },
    });
    await transitionAfterMediaEdit(transaction, link.property, partner.id);
    await transaction.auditLog.create({
      data: { actorId: partner.id, action: "PROPERTY_MEDIA_COVER_CHANGED", entityType: "MEDIA_ASSET", entityId: mediaId, metadata: { propertyId } },
    });
  });
}

export async function moveOwnedPropertyMedia(
  propertyId: string,
  mediaId: string,
  direction: "up" | "down",
) {
  const partner = await requireActivePartner();
  await prisma.$transaction(async (transaction) => {
    const property = await transaction.property.findFirst({
      where: { id: propertyId, ownerPartnerId: partner.partnerProfile.id, archivedAt: null },
      select: { id: true, status: true },
    });
    if (!property || !canPartnerEditProperty(property.status)) throw new Error("Images cannot be reordered.");
    const links = await transaction.propertyMedia.findMany({
      where: { propertyId },
      select: { mediaId: true },
      orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    });
    const currentIndex = links.findIndex((link) => link.mediaId === mediaId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= links.length) return;
    [links[currentIndex], links[targetIndex]] = [links[targetIndex], links[currentIndex]];
    await Promise.all(links.map((link, sortOrder) => transaction.propertyMedia.update({
      where: { propertyId_mediaId: { propertyId, mediaId: link.mediaId } },
      data: { sortOrder },
    })));
    await transitionAfterMediaEdit(transaction, property, partner.id);
    await transaction.auditLog.create({
      data: { actorId: partner.id, action: "PROPERTY_MEDIA_REORDERED", entityType: "PROPERTY", entityId: propertyId },
    });
  });
}
