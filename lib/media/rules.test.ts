import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getImageValidationIssues, MAX_IMAGE_BYTES } from "@/lib/media/rules";

describe("property image validation", () => {
  it("accepts supported content at the documented boundaries", () => {
    assert.deepEqual(getImageValidationIssues(MAX_IMAGE_BYTES, { format: "webp", width: 800, height: 600 }), []);
    assert.deepEqual(getImageValidationIssues(1, { format: "jpeg", width: 6000, height: 6000 }), []);
  });

  it("reports size, content type, and dimension violations", () => {
    const issues = getImageValidationIssues(MAX_IMAGE_BYTES + 1, { format: "gif", width: 799, height: 599 });
    assert.equal(issues.length, 3);
  });
});
