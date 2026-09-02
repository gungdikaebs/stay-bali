import { createCorrelationId } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const correlationId = createCorrelationId(request.headers.get("x-request-id"));
  return Response.json(
    { status: "ok", service: "staybali-web" },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "x-request-id": correlationId,
      },
    },
  );
}
