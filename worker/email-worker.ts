import "dotenv/config";

import { createServer } from "node:http";
import { Worker } from "bullmq";
import { dispatchPendingEmailEvents } from "@/lib/notification/dispatcher";
import { processEmailJob } from "@/lib/notification/processor";
import { EMAIL_QUEUE_NAME, getRedisConnection } from "@/lib/notification/queue";
import { createCorrelationId, writeLog } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

function getHealthPort() {
  const port = Number(process.env.WORKER_HEALTH_PORT ?? "3001");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("WORKER_HEALTH_PORT must be an integer between 1 and 65535.");
  }
  return port;
}

const worker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
  connection: getRedisConnection(),
  concurrency: 5,
});
let workerReady = false;

worker.on("ready", () => {
  workerReady = true;
  writeLog("info", "email_worker_ready");
});

worker.on("error", (error) => {
  workerReady = false;
  writeLog("error", "email_worker_error", { error });
});

let dispatching = false;
async function dispatch() {
  if (dispatching) return;
  dispatching = true;
  try {
    const result = await dispatchPendingEmailEvents();
    if (result.dispatched || result.failed) {
      writeLog("info", "email_outbox_dispatched", {
        correlationId: createCorrelationId(),
        ...result,
      });
    }
  } catch (error) {
    writeLog("error", "email_outbox_dispatch_failed", {
      correlationId: createCorrelationId(),
      error,
    });
  } finally {
    dispatching = false;
  }
}

worker.on("failed", (job, error) => {
  writeLog("error", "email_job_failed", {
    correlationId: job?.id ?? createCorrelationId(),
    jobId: job?.id ?? null,
    attemptsMade: job?.attemptsMade ?? null,
    error,
  });
});

const healthServer = createServer(async (request, response) => {
  const correlationId = createCorrelationId(
    typeof request.headers["x-request-id"] === "string"
      ? request.headers["x-request-id"]
      : undefined,
  );
  response.setHeader("content-type", "application/json");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-request-id", correlationId);

  if (request.method !== "GET") {
    response.writeHead(405).end(JSON.stringify({ status: "method_not_allowed" }));
    return;
  }
  if (request.url === "/live") {
    response.writeHead(200).end(JSON.stringify({ status: "ok", service: "staybali-email-worker" }));
    return;
  }
  if (request.url === "/ready") {
    let databaseReady = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseReady = true;
    } catch (error) {
      writeLog("error", "worker_readiness_database_failed", { correlationId, error });
    }
    const ready = workerReady && databaseReady;
    response.writeHead(ready ? 200 : 503).end(JSON.stringify({
      status: ready ? "ready" : "not_ready",
      service: "staybali-email-worker",
      checks: {
        database: databaseReady ? "up" : "down",
        redisWorker: workerReady ? "up" : "down",
      },
    }));
    return;
  }
  response.writeHead(404).end(JSON.stringify({ status: "not_found" }));
});

healthServer.listen(getHealthPort(), "127.0.0.1", () => {
  writeLog("info", "worker_health_server_listening", { port: getHealthPort() });
});

healthServer.on("error", (error) => {
  writeLog("error", "worker_health_server_error", { error });
  process.exitCode = 1;
});

const interval = setInterval(dispatch, 5_000);
void dispatch();

async function shutdown() {
  clearInterval(interval);
  workerReady = false;
  await new Promise<void>((resolve, reject) => {
    healthServer.close((error) => error ? reject(error) : resolve());
  });
  await worker.close();
  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.once("SIGTERM", () => void shutdown().then(() => process.exit(0)));
