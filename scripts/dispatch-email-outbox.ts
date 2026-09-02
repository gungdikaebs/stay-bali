import "dotenv/config";

import { dispatchPendingEmailEvents } from "@/lib/notification/dispatcher";
import { prisma } from "@/lib/prisma";

try {
  const result = await dispatchPendingEmailEvents();
  console.info(JSON.stringify({ event: "email_outbox_dispatch_complete", ...result }));
} finally {
  await prisma.$disconnect();
}
