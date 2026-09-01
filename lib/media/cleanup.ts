import "server-only";

import { rm } from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { resolveStorageKey } from "@/lib/media/storage";

const SAFETY_PERIOD_MS = 24 * 60 * 60 * 1000;

export async function cleanupOrphanMedia(options: { dryRun: boolean; limit?: number }) {
  const cutoff = new Date(Date.now() - SAFETY_PERIOD_MS);
  const candidates = await prisma.mediaAsset.findMany({
    where: { status: "ORPHANED", orphanedAt: { lte: cutoff } },
    select: {
      id: true,
      originalKey: true,
      displayKey: true,
      thumbnailKey: true,
      _count: { select: { propertyLinks: true, roomLinks: true } },
    },
    orderBy: { orphanedAt: "asc" },
    take: options.limit ?? 100,
  });

  let cleaned = 0;
  let skipped = 0;
  for (const candidate of candidates) {
    if (candidate._count.propertyLinks + candidate._count.roomLinks > 0) {
      skipped += 1;
      continue;
    }
    if (options.dryRun) continue;

    const current = await prisma.mediaAsset.findFirst({
      where: {
        id: candidate.id,
        status: "ORPHANED",
        orphanedAt: { lte: cutoff },
        propertyLinks: { none: {} },
        roomLinks: { none: {} },
      },
      select: { id: true },
    });
    if (!current) {
      skipped += 1;
      continue;
    }

    const keys = [candidate.originalKey, candidate.displayKey, candidate.thumbnailKey].filter((key): key is string => Boolean(key));
    await Promise.all(keys.map((key) => rm(resolveStorageKey(key), { force: true })));
    await prisma.mediaAsset.delete({ where: { id: candidate.id } });
    cleaned += 1;
  }

  return { candidates: candidates.length, cleaned, skipped, dryRun: options.dryRun };
}
