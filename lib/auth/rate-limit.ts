import "server-only";

const WINDOW_MS = 15 * 60_000;
const MAX_REGISTRATION_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

export function consumeRegistrationAttempt(key: string, now = Date.now()) {
  const recent = (attempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_REGISTRATION_ATTEMPTS) {
    attempts.set(key, recent);
    return false;
  }

  recent.push(now);
  attempts.set(key, recent);
  return true;
}
