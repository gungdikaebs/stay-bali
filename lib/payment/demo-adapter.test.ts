import assert from "node:assert/strict";
import test from "node:test";

import { DemoPaymentAdapter } from "./demo-adapter";

test("demo payment adapter preserves the trusted booking values", async () => {
  const result = await new DemoPaymentAdapter().charge({
    bookingReference: "SB-2026-DEMO12",
    amount: 1_250_000,
    currency: "IDR",
    outcome: "APPROVE",
  });

  assert.equal(result.bookingReference, "SB-2026-DEMO12");
  assert.equal(result.amount, 1_250_000);
  assert.equal(result.currency, "IDR");
  assert.equal(result.status, "SUCCEEDED");
  assert.match(result.providerReference, /^DEMO-/);
});

test("demo payment adapter can produce a declined portfolio scenario", async () => {
  const result = await new DemoPaymentAdapter().charge({
    bookingReference: "SB-2026-DEMO34",
    amount: 500_000,
    currency: "IDR",
    outcome: "DECLINE",
  });

  assert.equal(result.status, "FAILED");
  assert.equal(result.failureCode, "DEMO_DECLINED");
});
