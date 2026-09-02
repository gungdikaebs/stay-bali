import "server-only";

import { prisma } from "@/lib/prisma";
import { createEmailQueue } from "./queue";

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "Unknown queue error").slice(0, 1000);
}

export async function dispatchPendingEmailEvents(options: { batchSize?: number; now?: Date } = {}) {
  const batchSize = options.batchSize ?? 100;
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    throw new Error("Dispatch batch size must be an integer between 1 and 500.");
  }
  const now = options.now ?? new Date();
  const events = await prisma.outboxEvent.findMany({
    where: {
      topic: { startsWith: "email." },
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: 5 },
      availableAt: { lte: now },
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: batchSize,
    select: { id: true },
  });
  if (events.length === 0) return { dispatched: 0, failed: 0 };

  const queue = createEmailQueue();
  let dispatched = 0;
  let failed = 0;
  try {
    for (const event of events) {
      try {
        await queue.add("send-booking-email", { outboxEventId: event.id }, { jobId: event.id });
        const updated = await prisma.outboxEvent.updateMany({
          where: { id: event.id, status: { in: ["PENDING", "FAILED"] } },
          data: { status: "DISPATCHED", dispatchedAt: new Date(), lastError: null },
        });
        dispatched += updated.count;
      } catch (error) {
        failed += 1;
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: "FAILED",
            attempts: { increment: 1 },
            lastError: safeError(error),
            availableAt: new Date(now.getTime() + 30_000),
          },
        });
      }
    }
  } finally {
    await queue.close();
  }
  return { dispatched, failed };
}
