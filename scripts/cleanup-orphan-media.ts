import "dotenv/config";
import { cleanupOrphanMedia } from "../lib/media/cleanup";
import { prisma } from "../lib/prisma";

const dryRun = !process.argv.includes("--execute");

try {
  const result = await cleanupOrphanMedia({ dryRun });
  console.info(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
