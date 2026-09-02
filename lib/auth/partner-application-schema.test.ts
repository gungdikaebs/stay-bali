import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { partnerApplicationSchema } from "./partner-application-schema";

describe("Partner application validation", () => {
  it("normalizes identity fields and accepts a valid business profile", () => {
    const result = partnerApplicationSchema.parse({
      name: "  Made Wijaya ",
      businessName: "  Wijaya Villas ",
      email: " MADE@EXAMPLE.COM ",
      phone: "+62 812-3456-7890",
      password: "partner2026",
      confirmPassword: "partner2026",
    });

    assert.equal(result.name, "Made Wijaya");
    assert.equal(result.businessName, "Wijaya Villas");
    assert.equal(result.email, "made@example.com");
    assert.equal(result.phone, "6281234567890");
  });

  it("requires contact details and matching passwords", () => {
    const result = partnerApplicationSchema.safeParse({
      name: "Made Wijaya",
      businessName: "Wijaya Villas",
      email: "made@example.com",
      phone: "",
      password: "partner2026",
      confirmPassword: "different2026",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      assert.ok(errors.phone?.length);
      assert.deepEqual(errors.confirmPassword, ["Passwords do not match."]);
    }
  });
});
