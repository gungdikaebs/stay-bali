import assert from "node:assert/strict";
import test from "node:test";
import { createCorrelationId, sanitizeLogValue } from "./logger";

test("logger redacts secrets, contact data, and credential URLs", () => {
  const sanitized = sanitizeLogValue({
    actorEmail: "ayu@example.com",
    note: "Contact made@example.com using redis://user:pass@localhost:6379",
    nested: { password: "never-log-this", safeCount: 2 },
  });
  assert.deepEqual(sanitized, {
    actorEmail: "[redacted]",
    note: "Contact [redacted-email] using redis://[redacted]@localhost:6379",
    nested: { password: "[redacted]", safeCount: 2 },
  });
});

test("correlation IDs accept safe upstream values and replace unsafe input", () => {
  assert.equal(createCorrelationId("request_12345678"), "request_12345678");
  assert.match(createCorrelationId("bad value"), /^[0-9a-f-]{36}$/);
});
