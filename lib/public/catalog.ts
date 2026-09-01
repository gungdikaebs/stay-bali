import "server-only";

import { connection } from "next/server";
import type { PropertyType } from "@/generated/prisma/client";
import { calculateStayPrice, listStayDates } from "@/lib/inventory/rules";
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
  media: {
    where: { media: { status: "READY" } },
    select: { mediaId: true },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
  },
  rooms: {
    where: { archivedAt: null, isActive: true },
    select: { adultCapacity: true, childCapacity: true, basePrice: true },
    orderBy: { basePrice: "asc" },
  },
} satisfies import("@/generated/prisma/client").Prisma.PropertySelect;

type PublicCardProperty = {
  name: string;
  slug: string;
  type: PropertyType;
  area: string;
  cancellationPolicy: string;
  media: { mediaId: string }[];
  rooms: { adultCapacity: number; childCapacity: number; basePrice: number }[];
};

function toPublicCard(
  property: PublicCardProperty,
  selectedRoom = property.rooms[0],
  pricePerNight = selectedRoom?.basePrice ?? 0,
) {
  return {
    slug: property.slug,
    name: property.name,
    area: property.area,
    type: typeLabels[property.type],
    guests: selectedRoom?.adultCapacity ?? 1,
    pricePerNight,
    image: property.media[0]
      ? `/media/${property.media[0].mediaId}/display`
      : imageFromArea(property.area),
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

  return properties.map((property) => toPublicCard(property));
}

function imageFromArea(area: string) {
  return `/images/stay-${locationFromArea(area)}.jpg`;
}

function shortPolicy(policy: string) {
  return policy.split(/(?<=[.!?])\s/, 1)[0] || "Clear cancellation policy";
}

export async function searchPublishedStays(values: SearchValues) {
  const requestedDates = listStayDates(values.checkin, values.checkout);
  const inventoryDateFilter = requestedDates
    ? {
        gte: new Date(`${requestedDates[0]}T00:00:00.000Z`),
        lt: new Date(`${values.checkout}T00:00:00.000Z`),
      }
    : undefined;
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
          childCapacity: { gte: values.children },
        },
      },
    },
    select: {
      ...publicCardSelect,
      rooms: {
        where: {
          archivedAt: null,
          isActive: true,
          adultCapacity: { gte: values.guests },
          childCapacity: { gte: values.children },
        },
        select: {
          adultCapacity: true,
          childCapacity: true,
          basePrice: true,
          totalUnits: true,
          inventory: {
            where: inventoryDateFilter ? { stayDate: inventoryDateFilter } : { id: "__no_inventory__" },
            select: {
              stayDate: true,
              priceOverride: true,
              totalUnitsOverride: true,
              heldUnits: true,
              bookedUnits: true,
              stopSell: true,
            },
            orderBy: { stayDate: "asc" },
          },
        },
        orderBy: { basePrice: "asc" },
      },
    },
    take: 250,
  });

  const stays = properties.flatMap((property) => {
    if (!requestedDates) return [toPublicCard(property)];

    const availableRooms = property.rooms.flatMap((room) => {
      const price = calculateStayPrice({
        checkin: values.checkin,
        checkout: values.checkout,
        basePrice: room.basePrice,
        totalUnits: room.totalUnits,
        inventory: room.inventory,
      });
      return price ? [{ room, price }] : [];
    }).sort((left, right) => left.price.averageNightlyPrice - right.price.averageNightlyPrice);
    const best = availableRooms[0];
    return best
      ? [toPublicCard(property, best.room, best.price.averageNightlyPrice)]
      : [];
  });

  const filteredStays = stays.filter((stay) =>
    (values.minPrice === null || stay.pricePerNight >= values.minPrice) &&
    (values.maxPrice === null || stay.pricePerNight <= values.maxPrice),
  ).sort((left, right) => {
    if (values.sort === "price-low") return left.pricePerNight - right.pricePerNight;
    if (values.sort === "price-high") return right.pricePerNight - left.pricePerNight;
    return left.name.localeCompare(right.name);
  });
  const total = filteredStays.length;
  const totalPages = Math.max(1, Math.ceil(total / values.pageSize));
  const page = Math.min(values.page, totalPages);
  const offset = (page - 1) * values.pageSize;

  return {
    stays: filteredStays.slice(offset, offset + values.pageSize),
    total,
    page,
    pageSize: values.pageSize,
    totalPages,
  };
}

export async function getPublishedStayBySlug(
  slug: string,
  search?: Pick<SearchValues, "checkin" | "checkout" | "guests" | "children">,
) {
  const requestedDates = search ? listStayDates(search.checkin, search.checkout) : null;
  const property = await prisma.property.findFirst({
    where: { slug, status: "PUBLISHED", archivedAt: null },
    select: {
      slug: true,
      name: true,
      area: true,
      type: true,
      description: true,
      cancellationPolicy: true,
      media: {
        where: { media: { status: "READY" } },
        select: { mediaId: true },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 5,
      },
      facilities: { select: { facility: { select: { name: true } } } },
      rooms: {
        where: {
          archivedAt: null,
          isActive: true,
        },
        select: {
          name: true,
          description: true,
          adultCapacity: true,
          childCapacity: true,
          bedType: true,
          basePrice: true,
          totalUnits: true,
          facilities: { select: { facility: { select: { name: true } } } },
          inventory: {
            where: requestedDates
              ? {
                  stayDate: {
                    gte: new Date(`${requestedDates[0]}T00:00:00.000Z`),
                    lt: new Date(`${search?.checkout}T00:00:00.000Z`),
                  },
                }
              : { id: "__no_inventory__" },
            select: {
              stayDate: true,
              priceOverride: true,
              totalUnitsOverride: true,
              heldUnits: true,
              bookedUnits: true,
              stopSell: true,
            },
            orderBy: { stayDate: "asc" },
          },
        },
        orderBy: { basePrice: "asc" },
      },
    },
  });
  const pricedRooms = requestedDates && search && property
    ? property.rooms.filter((room) =>
        room.adultCapacity >= search.guests &&
        room.childCapacity >= search.children,
      ).flatMap((room) => {
        const pricing = calculateStayPrice({
          checkin: search.checkin,
          checkout: search.checkout,
          basePrice: room.basePrice,
          totalUnits: room.totalUnits,
          inventory: room.inventory,
        });
        return pricing ? [{ room, pricing }] : [];
      }).sort((left, right) => left.pricing.averageNightlyPrice - right.pricing.averageNightlyPrice)
    : [];
  const pricedRoom = pricedRooms[0];
  const room = pricedRoom?.room ?? property?.rooms[0];
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
    children: room.childCapacity,
    pricePerNight: pricedRoom?.pricing.averageNightlyPrice ?? room.basePrice,
    pricing: pricedRoom?.pricing ?? null,
    isAvailable: requestedDates ? Boolean(pricedRoom) : null,
    image: property.media[0]
      ? `/media/${property.media[0].mediaId}/display`
      : imageFromArea(property.area),
    images: property.media.length
      ? property.media.map((item) => `/media/${item.mediaId}/display`)
      : [imageFromArea(property.area)],
    highlight: shortPolicy(property.cancellationPolicy),
    description: property.description,
    roomName: room.name,
    bed: room.bedType,
    amenities,
  };
}
