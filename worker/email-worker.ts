import "dotenv/config";

import { Worker } from "bullmq";
import { dispatchPendingEmailEvents } from "@/lib/notification/dispatcher";
import { processEmailJob } from "@/lib/notification/processor";
import { EMAIL_QUEUE_NAME, getRedisConnection } from "@/lib/notification/queue";

const worker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
  connection: getRedisConnection(),
  concurrency: 5,
});

let dispatching = false;
async function dispatch() {
  if (dispatching) return;
  dispatching = true;
  try {
    const result = await dispatchPendingEmailEvents();
    if (result.dispatched || result.failed) {
      console.info(JSON.stringify({ event: "email_outbox_dispatched", ...result }));
    }
  } catch (error) {
    console.error(JSON.stringify({
      event: "email_outbox_dispatch_failed",
      message: error instanceof Error ? error.message : "Unknown dispatch error",
    }));
  } finally {
    dispatching = false;
  }
}

worker.on("failed", (job, error) => {
  console.error(JSON.stringify({
    event: "email_job_failed",
    jobId: job?.id ?? null,
    attemptsMade: job?.attemptsMade ?? null,
    message: error.message,
  }));
});

const interval = setInterval(dispatch, 5_000);
void dispatch();

async function shutdown() {
  clearInterval(interval);
  await worker.close();
  await prismaDisconnect();
}

async function prismaDisconnect() {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.once("SIGTERM", () => void shutdown().then(() => process.exit(0)));
