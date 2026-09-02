import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveStorageKey } from "@/lib/media/storage";

export const runtime = "nodejs";

function fallbackImage(area: string) {
  const normalized = area.toLowerCase();
  if (normalized.includes("canggu")) return "/images/stay-canggu.jpg";
  if (normalized.includes("seminyak") || normalized.includes("petitenget")) return "/images/stay-seminyak.jpg";
  if (normalized.includes("uluwatu") || normalized.includes("ungasan")) return "/images/stay-uluwatu.jpg";
  if (normalized.includes("sanur")) return "/images/stay-sanur.jpg";
  return "/images/stay-ubud.jpg";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; variant: string }> },
) {
  const { id, variant } = await context.params;
  if (variant !== "display" && variant !== "thumbnail") return new Response(null, { status: 404 });

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, status: "READY" },
    select: {
      displayKey: true,
      thumbnailKey: true,
      propertyLinks: {
        select: { property: { select: { status: true, area: true, ownerPartnerId: true, archivedAt: true } } },
      },
      roomLinks: {
        select: { roomType: { select: { property: { select: { status: true, area: true, ownerPartnerId: true, archivedAt: true } } } } },
      },
    },
  });
  if (!asset) return new Response(null, { status: 404 });

  const properties = [
    ...asset.propertyLinks.map((link) => link.property),
    ...asset.roomLinks.map((link) => link.roomType.property),
  ];
  const publicProperty = properties.find((property) => property.status === "PUBLISHED" && !property.archivedAt);
  let authorized = Boolean(publicProperty);
  if (!authorized) {
    const session = await auth();
    if (session?.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, status: true, sessionVersion: true, partnerProfile: { select: { id: true, status: true } } },
      });
      authorized = Boolean(
        user &&
        user.status === "ACTIVE" &&
        user.sessionVersion === session.user.sessionVersion &&
        (user.role === "ADMIN" ||
          (user.role === "PARTNER" &&
            user.partnerProfile?.status === "ACTIVE" &&
            properties.some((property) => property.ownerPartnerId === user.partnerProfile?.id))),
      );
    }
  }
  if (!authorized) return new Response(null, { status: 404 });

  const storageKey = variant === "display" ? asset.displayKey : asset.thumbnailKey;
  if (!storageKey) return new Response(null, { status: 404 });
  try {
    const body = await readFile(resolveStorageKey(storageKey));
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": publicProperty
          ? "public, max-age=86400, stale-while-revalidate=604800"
          : "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    const area = properties[0]?.area;
    if (!area) return new Response(null, { status: 404 });
    const fallbackPath = join(process.cwd(), "public", fallbackImage(area));
    const body = await readFile(fallbackPath);
    return new Response(body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}
