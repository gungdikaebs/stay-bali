import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canPartnerEditProperty,
  canSubmitProperty,
  getSubmissionIssues,
  isAdminPropertyTransitionAllowed,
  slugifyPropertyName,
  statusAfterMaterialPartnerEdit,
} from "./rules";

describe("property submission checklist", () => {
  it("accepts the documented minimum supply", () => {
    assert.deepEqual(
      getSubmissionIssues({ facilityCount: 5, readyMediaCount: 3, activeRoomCount: 1 }),
      [],
    );
  });

  it("reports every incomplete requirement", () => {
    assert.deepEqual(
      getSubmissionIssues({ facilityCount: 4, readyMediaCount: 2, activeRoomCount: 0 }),
      [
        "Add at least 5 property facilities.",
        "Add at least 3 ready property photos.",
        "Add at least 1 active room type.",
      ],
    );
  });
});

describe("property state machine", () => {
  it("sends material published edits back to review", () => {
    assert.equal(canPartnerEditProperty("PUBLISHED"), true);
    assert.equal(statusAfterMaterialPartnerEdit("PUBLISHED"), "PENDING_REVIEW");
    assert.equal(statusAfterMaterialPartnerEdit("REJECTED"), "DRAFT");
  });

  it("only submits editable draft states", () => {
    assert.equal(canSubmitProperty("DRAFT"), true);
    assert.equal(canSubmitProperty("REJECTED"), true);
    assert.equal(canSubmitProperty("PENDING_REVIEW"), false);
  });

  it("restricts Admin review and suspension transitions", () => {
    assert.equal(isAdminPropertyTransitionAllowed("PENDING_REVIEW", "PUBLISHED"), true);
    assert.equal(isAdminPropertyTransitionAllowed("PENDING_REVIEW", "REJECTED"), true);
    assert.equal(isAdminPropertyTransitionAllowed("PUBLISHED", "SUSPENDED"), true);
    assert.equal(isAdminPropertyTransitionAllowed("SUSPENDED", "PUBLISHED"), true);
    assert.equal(isAdminPropertyTransitionAllowed("DRAFT", "PUBLISHED"), false);
  });
});

describe("property slug", () => {
  it("normalizes unsafe names", () => {
    assert.equal(slugifyPropertyName("  Uma Déwi & Spa  "), "uma-dewi-spa");
  });
});
