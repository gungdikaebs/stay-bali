import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSearchQuery } from "./search-query";

describe("search query", () => {
  it("parses adult, child, price, and pagination filters", () => {
    const result = parseSearchQuery({
      guests: "3",
      children: "2",
      minPrice: "500000",
      maxPrice: "1500000",
      page: "2",
      pageSize: "24",
    });

    assert.equal(result.values.guests, 3);
    assert.equal(result.values.children, 2);
    assert.equal(result.values.minPrice, 500_000);
    assert.equal(result.values.maxPrice, 1_500_000);
    assert.equal(result.values.page, 2);
    assert.equal(result.values.pageSize, 24);
    assert.deepEqual(result.errors, []);
  });

  it("rejects inverted prices and unsafe guest counts", () => {
    const result = parseSearchQuery({
      guests: "0",
      children: "11",
      minPrice: "2000000",
      maxPrice: "1000000",
    });

    assert.equal(result.values.guests, 2);
    assert.equal(result.values.children, 0);
    assert.equal(result.errors.length, 3);
  });
});
