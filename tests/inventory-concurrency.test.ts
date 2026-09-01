import assert from "node:assert/strict";
import test from "node:test";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { reserveHeldInventory } from "@/lib/inventory/reservations";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for integration tests.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

test("two concurrent holds cannot reserve the last unit", async (context) => {
  const room = await prisma.roomType.findFirst({
    where: {
      archivedAt: null,
      isActive: true,
      property: { archivedAt: null, status: "PUBLISHED" },
    },
    select: { id: true },
  });
  assert.ok(room, "The integration database must contain a published room type.");

  const base = new Date("2099-01-01T00:00:00.000Z");
  let stayDate: Date | null = null;
  for (let offset = 0; offset < 365; offset++) {
    const candidate = new Date(base);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    const exists = await prisma.inventoryDate.findUnique({
      where: {
        roomTypeId_stayDate: { roomTypeId: room.id, stayDate: candidate },
      },
      select: { id: true },
    });
    if (!exists) {
      stayDate = candidate;
      break;
    }
  }
  assert.ok(stayDate, "Could not find an isolated inventory date for the test.");

  await prisma.inventoryDate.create({
    data: {
      roomTypeId: room.id,
      stayDate,
      totalUnitsOverride: 1,
    },
  });
  context.after(async () => {
    await prisma.inventoryDate.deleteMany({
      where: { roomTypeId: room.id, stayDate },
    });
    await prisma.$disconnect();
  });

  const attempts = await Promise.allSettled([
    prisma.$transaction(
      (transaction) => reserveHeldInventory(transaction, room.id, [stayDate]),
      { isolationLevel: "Serializable" },
    ),
    prisma.$transaction(
      (transaction) => reserveHeldInventory(transaction, room.id, [stayDate]),
      { isolationLevel: "Serializable" },
    ),
  ]);

  assert.equal(
    attempts.filter((attempt) => attempt.status === "fulfilled").length,
    1,
  );
  assert.equal(
    attempts.filter((attempt) => attempt.status === "rejected").length,
    1,
  );

  const inventory = await prisma.inventoryDate.findUniqueOrThrow({
    where: {
      roomTypeId_stayDate: { roomTypeId: room.id, stayDate },
    },
    select: { heldUnits: true, bookedUnits: true },
  });
  assert.deepEqual(inventory, { heldUnits: 1, bookedUnits: 0 });
});
