import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export function generateIdempotencyKey(): string {
  return randomBytes(16).toString("hex");
}

export async function checkIdempotency(
  scope: string,
  key: string,
  actorId: string | null,
  requestHash: string
): Promise<{ exists: boolean }> {
  const record = await prisma.idempotencyRecord.findUnique({
    where: { scope_key: { scope, key } },
  });
  if (!record) return { exists: false };
  if (record.actorId !== actorId || record.request !== requestHash) {
    throw new Error("Duplicate submission from different actor or request.");
  }
  return { exists: true };
}
