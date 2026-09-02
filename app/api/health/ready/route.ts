import { prisma } from "@/lib/prisma";
import { createCorrelationId, writeLog } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = createCorrelationId(request.headers.get("x-request-id"));
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ready", service: "staybali-web", checks: { database: "up" } },
      {
        status: 200,
        headers: { "cache-control": "no-store", "x-request-id": correlationId },
      },
    );
  } catch (error) {
    writeLog("error", "web_readiness_failed", { correlationId, error });
    return Response.json(
      { status: "not_ready", service: "staybali-web", checks: { database: "down" } },
      {
        status: 503,
        headers: { "cache-control": "no-store", "x-request-id": correlationId },
      },
    );
  }
}
