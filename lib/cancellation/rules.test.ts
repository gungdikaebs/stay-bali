import assert from "node:assert/strict";
import test from "node:test";

import { getCancellationEscalationCutoff, isCancellationEscalated } from "./rules";

test("cancellation exceptions escalate at the 24-hour boundary", () => {
  const now = new Date("2026-09-12T08:00:00.000Z");

  assert.equal(getCancellationEscalationCutoff(now).toISOString(), "2026-09-11T08:00:00.000Z");
  assert.equal(isCancellationEscalated(new Date("2026-09-11T08:00:00.000Z"), now), true);
  assert.equal(isCancellationEscalated(new Date("2026-09-11T08:00:00.001Z"), now), false);
});
