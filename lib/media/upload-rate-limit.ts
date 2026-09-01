import "server-only";

const WINDOW_MS = 60_000;
const MAX_UPLOAD_BATCHES = 10;
const attempts = new Map<string, number[]>();

export function assertUploadRateLimit(actorId: string) {
  const now = Date.now();
  const recent = (attempts.get(actorId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_UPLOAD_BATCHES) {
    attempts.set(actorId, recent);
    throw new Error("Upload limit reached. Wait a minute before trying again.");
  }
  recent.push(now);
  attempts.set(actorId, recent);
}
