import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { registrationSchema } from "./registration-schema";

describe("traveler registration validation", () => {
  it("normalizes email and phone without exposing role input", () => {
    const result = registrationSchema.parse({
      name: "  Ayu Putri  ",
      email: "  AYU@EXAMPLE.COM ",
      phone: "+62 812-3456-7890",
      password: "baliStay2026",
      confirmPassword: "baliStay2026",
      role: "ADMIN",
    });

    assert.equal(result.name, "Ayu Putri");
    assert.equal(result.email, "ayu@example.com");
    assert.equal(result.phone, "6281234567890");
    assert.equal("role" in result, false);
  });

  it("requires a letter and number in passwords", () => {
    const result = registrationSchema.safeParse({
      name: "Ayu Putri",
      email: "ayu@example.com",
      phone: "",
      password: "onlyletters",
      confirmPassword: "onlyletters",
    });

    assert.equal(result.success, false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registrationSchema.safeParse({
      name: "Ayu Putri",
      email: "ayu@example.com",
      phone: "081234567890",
      password: "baliStay2026",
      confirmPassword: "different2026",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.deepEqual(result.error.flatten().fieldErrors.confirmPassword, [
        "Passwords do not match.",
      ]);
    }
  });
});
