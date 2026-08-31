import "server-only";

import { connection } from "next/server";
import type { PropertyType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SearchValues } from "@/lib/search-query";

const typeLabels: Record<PropertyType, "Villa" | "Hotel" | "Homestay"> = {
  VILLA: "Villa",
  HOTEL: "Hotel",
  HOMESTAY: "Homestay",
};

const typeFilters: Record<Exclude<SearchValues["type"], "all">, PropertyType> = {
  villa: "VILLA",
  hotel: "HOTEL",
  homestay: "HOMESTAY",
};

function locationFromArea(area: string): Exclude<SearchValues["location"], "all"> {
  const normalized = area.toLowerCase();
  if (normalized.includes("canggu")) return "canggu";
  if (normalized.includes("seminyak") || normalized.includes("petitenget")) return "seminyak";
  if (normalized.includes("uluwatu") || normalized.includes("ungasan")) return "uluwatu";
  if (normalized.includes("sanur")) return "sanur";
  return "ubud";
}

const publicCardSelect = {
  name: true,
  slug: true,
  type: true,
  area: true,
  cancellationPolicy: true,
  rooms: {
    where: { archivedAt: null, isActive: true },
    select: { adultCapacity: true, basePrice: true },
    orderBy: { basePrice: "asc" },
  },
} satisfies import("@/generated/prisma/client").Prisma.PropertySelect;

function toPublicCard(property: {
  name: string;
  slug: string;
  type: PropertyType;
  area: string;
  cancellationPolicy: string;
  rooms: { adultCapacity: number; basePrice: number }[];
}) {
  return {
    slug: property.slug,
    name: property.name,
    area: property.area,
    type: typeLabels[property.type],
    guests: property.rooms[0]?.adultCapacity ?? 1,
    pricePerNight: property.rooms[0]?.basePrice ?? 0,
    image: imageFromArea(property.area),
    highlight: shortPolicy(property.cancellationPolicy),
  };
}

export async function listFeaturedPublishedStays(limit = 8) {
  await connection();
  const properties = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      rooms: { some: { archivedAt: null, isActive: true } },
    },
    select: publicCardSelect,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return properties.map(toPublicCard);
}

function imageFromArea(area: string) {
  return `/images/stay-${locationFromArea(area)}.jpg`;
}

function shortPolicy(policy: string) {
  return policy.split(/(?<=[.!?])\s/, 1)[0] || "Clear cancellation policy";
}

export async function searchPublishedStays(values: SearchValues) {
  const properties = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      archivedAt: null,
      area: values.location === "all"
        ? undefined
        : { contains: values.location, mode: "insensitive" },
      type: values.type === "all" ? undefined : typeFilters[values.type],
      rooms: {
        some: {
          archivedAt: null,
          isActive: true,
          adultCapacity: { gte: values.guests },
        },
      },
    },
    select: {
      ...publicCardSelect,
      rooms: {
        ...publicCardSelect.rooms,
        where: {
          archivedAt: null,
          isActive: true,
          adultCapacity: { gte: values.guests },
        },
      },
    },
    take: 24,
  });

  const stays = properties.map(toPublicCard);

  return stays.sort((left, right) => {
    if (values.sort === "price-low") return left.pricePerNight - right.pricePerNight;
    if (values.sort === "price-high") return right.pricePerNight - left.pricePerNight;
    return left.name.localeCompare(right.name);
  });
}

export async function getPublishedStayBySlug(slug: string) {
  const property = await prisma.property.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    select: {
      slug: true,
      name: true,
      area: true,
      type: true,
      description: true,
      cancellationPolicy: true,
      facilities: { select: { facility: { select: { name: true } } } },
      rooms: {
        where: { archivedAt: null, isActive: true },
        select: {
          name: true,
          description: true,
          adultCapacity: true,
          bedType: true,
          basePrice: true,
          facilities: { select: { facility: { select: { name: true } } } },
        },
        orderBy: { basePrice: "asc" },
      },
    },
  });
  const room = property?.rooms[0];
  if (!property || !room) return null;

  const amenities = [...new Set([
    ...property.facilities.map((item) => item.facility.name),
    ...room.facilities.map((item) => item.facility.name),
  ])];

  return {
    slug: property.slug,
    name: property.name,
    location: locationFromArea(property.area),
    area: property.area,
    type: typeLabels[property.type],
    guests: room.adultCapacity,
    pricePerNight: room.basePrice,
    image: imageFromArea(property.area),
    highlight: shortPolicy(property.cancellationPolicy),
    description: property.description,
    roomName: room.name,
    bed: room.bedType,
    amenities,
  };
}
