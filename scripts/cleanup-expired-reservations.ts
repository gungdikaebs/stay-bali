import "dotenv/config";

import { cleanupExpiredPaymentBookings } from "../lib/booking/expiry";
import { cleanupExpiredHolds } from "../lib/hold/expiry";
import { prisma } from "../lib/prisma";

try {
  const holds = await cleanupExpiredHolds();
  const bookings = await cleanupExpiredPaymentBookings();

  console.info(JSON.stringify({
    job: "reservation-expiry",
    completedAt: new Date().toISOString(),
    holds,
    bookings,
  }));
} catch (error) {
  console.error(JSON.stringify({
    job: "reservation-expiry",
    failedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : "Unknown expiry job error",
  }));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
