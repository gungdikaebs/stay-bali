import "server-only";

import { randomUUID } from "node:crypto";

type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const sensitiveKey = /(authorization|cookie|credential|password|secret|token|email|phone|connection|string|payload|body)/i;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const credentialUrlPattern = /\b(redis(?:s)?|postgres(?:ql)?):\/\/[^\s@]+@/gi;

function sanitizeString(value: string) {
  return value
    .replace(credentialUrlPattern, "$1://[redacted]@")
    .replace(emailPattern, "[redacted-email]")
    .slice(0, 2_000);
}

export function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[max-depth]";
  if (value instanceof Error) {
    return { name: value.name, message: sanitizeString(value.message) };
  }
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitizeLogValue(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 100)
        .map(([key, item]) => [key, sensitiveKey.test(key) ? "[redacted]" : sanitizeLogValue(item, depth + 1)]),
    );
  }
  return String(value);
}

export function createCorrelationId(candidate?: string | null) {
  if (candidate && /^[A-Za-z0-9._-]{8,128}$/.test(candidate)) return candidate;
  return randomUUID();
}

export function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeLogValue(context) as LogContext,
  });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
