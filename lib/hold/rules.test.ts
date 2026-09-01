import test from "node:test";
import assert from "node:assert/strict";
import { isHoldExpired } from "./rules";

test("isHoldExpired correctly identifies expired holds", () => {
  const past = new Date(Date.now() - 1000);
  assert.equal(isHoldExpired(past), true);

  const future = new Date(Date.now() + 10 * 60 * 1000);
  assert.equal(isHoldExpired(future), false);
});
