import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import {
  MediaStatus,
  PartnerStatus,
  PrismaClient,
  PropertyStatus,
  PropertyType,
  UserRole,
} from "../generated/prisma/client";
import { demoStays } from "../lib/demo-stays";

const connectionString = process.env.DATABASE_URL;
const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD ?? "";
const partnerSeedPassword = process.env.PARTNER_SEED_PASSWORD ?? adminSeedPassword;
const travelerSeedPassword = process.env.TRAVELER_SEED_PASSWORD ?? adminSeedPassword;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

if (!adminSeedPassword) {
  throw new Error("ADMIN_SEED_PASSWORD is required to seed the admin credential.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const propertyTypeByLabel = {
  Villa: PropertyType.VILLA,
  Hotel: PropertyType.HOTEL,
  Homestay: PropertyType.HOMESTAY,
} as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function clearSeedData() {
  await prisma.auditLog.deleteMany();
  await prisma.propertyReview.deleteMany();
  await prisma.quoteNight.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.inventoryDate.deleteMany();
  await prisma.roomMedia.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.roomFacility.deleteMany();
  await prisma.propertyFacility.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.accountCredential.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearSeedData();
  const adminPasswordHash = await hash(adminSeedPassword, 12);
  const partnerPasswordHash = await hash(partnerSeedPassword, 12);
  const travelerPasswordHash = await hash(travelerSeedPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@staybali.test",
      name: "StayBali Admin",
      phone: "+628110000001",
      role: UserRole.ADMIN,
      credential: {
        create: {
          passwordHash: adminPasswordHash,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "traveler@staybali.test",
      name: "StayBali Traveler",
      phone: "+628110000002",
      role: UserRole.TRAVELER,
      credential: {
        create: {
          passwordHash: travelerPasswordHash,
        },
      },
    },
  });

  const partnerNames = ["Island Homes Bali", "Bali Local Stays", "Nusantara Hospitality"];
  const partners = [];

  for (const [index, businessName] of partnerNames.entries()) {
    const user = await prisma.user.create({
      data: {
        email: `partner${index + 1}@staybali.test`,
        name: `${businessName} Manager`,
        phone: `+62812000000${index + 1}`,
        role: UserRole.PARTNER,
        credential: {
          create: {
            passwordHash: partnerPasswordHash,
          },
        },
      },
    });

    partners.push(
      await prisma.partnerProfile.create({
        data: {
          userId: user.id,
          businessName,
          status: PartnerStatus.ACTIVE,
        },
      }),
    );
  }

  const facilityNames = [...new Set(demoStays.flatMap((stay) => stay.amenities))].sort();

  await prisma.facility.createMany({
    data: facilityNames.map((name) => ({ name, slug: slugify(name) })),
  });

  const facilities = await prisma.facility.findMany();
  const facilityIdByName = new Map(facilities.map((facility) => [facility.name, facility.id]));
  const inventoryStart = new Date("2026-09-01T00:00:00.000Z");

  for (const [index, stay] of demoStays.entries()) {
    const owner = partners[index % partners.length];
    const publishedAt = new Date("2026-08-28T08:00:00.000Z");
    const property = await prisma.property.create({
      data: {
        ownerPartnerId: owner.id,
        name: stay.name,
        slug: stay.slug,
        type: propertyTypeByLabel[stay.type],
        status: PropertyStatus.PUBLISHED,
        description: stay.description,
        area: stay.area,
        address: `${index + 1} StayBali Lane, ${stay.area}, Bali`,
        cancellationPolicy: "Free cancellation until 3 days before check-in. After that, the booking is non-refundable.",
        publishedAt,
        facilities: {
          create: stay.amenities.map((name) => ({
            facilityId: facilityIdByName.get(name)!,
          })),
        },
      },
    });

    const room = await prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: stay.roomName,
        description: `${stay.roomName} at ${stay.name}, prepared for up to ${stay.guests} guests.`,
        adultCapacity: stay.guests,
        childCapacity: Math.min(2, Math.max(0, stay.guests - 1)),
        bedType: stay.bed,
        sizeSqm: 32 + index * 4,
        basePrice: stay.pricePerNight,
        totalUnits: 2 + (index % 4),
        facilities: {
          create: stay.amenities.map((name) => ({
            facilityId: facilityIdByName.get(name)!,
          })),
        },
      },
    });

    for (let mediaIndex = 0; mediaIndex < 3; mediaIndex += 1) {
      const assetName = `${stay.slug}-${mediaIndex + 1}`;
      const media = await prisma.mediaAsset.create({
        data: {
          uploadedById: admin.id,
          status: MediaStatus.READY,
          originalKey: `originals/2026/08/${assetName}.jpg`,
          displayKey: `display/2026/08/${assetName}.webp`,
          thumbnailKey: `thumbnails/2026/08/${assetName}.webp`,
          mimeType: "image/jpeg",
          sizeBytes: 850_000 + mediaIndex * 25_000,
          width: 1600,
          height: 1200,
          altText: `${stay.name} in ${stay.area}, view ${mediaIndex + 1}`,
        },
      });

      await prisma.propertyMedia.create({
        data: {
          propertyId: property.id,
          mediaId: media.id,
          sortOrder: mediaIndex,
          isCover: mediaIndex === 0,
        },
      });
    }

    const inventoryRows = Array.from({ length: 60 }, (_, dayIndex) => {
      const stayDate = new Date(inventoryStart);
      stayDate.setUTCDate(stayDate.getUTCDate() + dayIndex);
      const weekend = stayDate.getUTCDay() === 5 || stayDate.getUTCDay() === 6;

      return {
        roomTypeId: room.id,
        stayDate,
        priceOverride: weekend ? Math.round(stay.pricePerNight * 1.15) : null,
        stopSell: dayIndex > 0 && dayIndex % 19 === 0,
      };
    });

    await prisma.inventoryDate.createMany({ data: inventoryRows });

    await prisma.propertyReview.create({
      data: {
        propertyId: property.id,
        reviewerId: admin.id,
        previousState: PropertyStatus.PENDING_REVIEW,
        nextState: PropertyStatus.PUBLISHED,
        note: "Seed property approved for the StayBali catalog.",
        createdAt: publishedAt,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_COMPLETED",
      entityType: "SYSTEM",
      entityId: "staybali-demo",
      metadata: {
        propertyCount: demoStays.length,
        inventoryDaysPerRoom: 60,
        demoAccountCount: partners.length + 2,
      },
    },
  });

  console.info(`Seeded ${demoStays.length} properties across ${partners.length} active partners.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
