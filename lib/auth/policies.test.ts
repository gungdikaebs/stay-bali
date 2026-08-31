import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAccessProperty,
  canAccessProtectedPath,
  getRoleHome,
  isPartnerStatusTransitionAllowed,
} from "./policies";

describe("protected route policy", () => {
  it("isolates each workspace by role", () => {
    assert.equal(canAccessProtectedPath("ADMIN", "/admin/partners"), true);
    assert.equal(canAccessProtectedPath("ADMIN", "/partner"), false);
    assert.equal(canAccessProtectedPath("PARTNER", "/partner/properties"), true);
    assert.equal(canAccessProtectedPath("PARTNER", "/admin"), false);
    assert.equal(canAccessProtectedPath("TRAVELER", "/account"), true);
    assert.equal(canAccessProtectedPath("TRAVELER", "/partner"), false);
  });

  it("maps roles to fixed server-controlled destinations", () => {
    assert.equal(getRoleHome("ADMIN"), "/admin");
    assert.equal(getRoleHome("PARTNER"), "/partner");
    assert.equal(getRoleHome("TRAVELER"), "/account");
  });
});

describe("partner lifecycle policy", () => {
  it("accepts documented administrative transitions", () => {
    assert.equal(isPartnerStatusTransitionAllowed("PENDING", "ACTIVE"), true);
    assert.equal(isPartnerStatusTransitionAllowed("PENDING", "REJECTED"), true);
    assert.equal(isPartnerStatusTransitionAllowed("ACTIVE", "SUSPENDED"), true);
    assert.equal(isPartnerStatusTransitionAllowed("SUSPENDED", "ACTIVE"), true);
    assert.equal(isPartnerStatusTransitionAllowed("REJECTED", "PENDING"), true);
  });

  it("rejects skips and no-op transitions", () => {
    assert.equal(isPartnerStatusTransitionAllowed("PENDING", "SUSPENDED"), false);
    assert.equal(isPartnerStatusTransitionAllowed("ACTIVE", "REJECTED"), false);
    assert.equal(isPartnerStatusTransitionAllowed("ACTIVE", "ACTIVE"), false);
  });
});

describe("property ownership policy", () => {
  it("allows Admin access to any owner", () => {
    assert.equal(canAccessProperty({ role: "ADMIN" }, "partner-b"), true);
  });

  it("allows only the active owning Partner", () => {
    assert.equal(
      canAccessProperty(
        {
          role: "PARTNER",
          partnerProfileId: "partner-a",
          partnerStatus: "ACTIVE",
        },
        "partner-a",
      ),
      true,
    );
    assert.equal(
      canAccessProperty(
        {
          role: "PARTNER",
          partnerProfileId: "partner-a",
          partnerStatus: "ACTIVE",
        },
        "partner-b",
      ),
      false,
    );
    assert.equal(
      canAccessProperty(
        {
          role: "PARTNER",
          partnerProfileId: "partner-a",
          partnerStatus: "SUSPENDED",
        },
        "partner-a",
      ),
      false,
    );
  });

  it("never grants Traveler property management access", () => {
    assert.equal(canAccessProperty({ role: "TRAVELER" }, "partner-a"), false);
  });
});
