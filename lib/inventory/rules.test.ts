import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateStayPrice, listInclusiveDates, listStayDates } from "./rules";

describe("inventory date rules", () => {
  it("uses the half-open stay interval and limits stays to 30 nights", () => {
    assert.deepEqual(listStayDates("2026-09-01", "2026-09-04"), [
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
    assert.equal(listStayDates("2026-09-01", "2026-10-02"), null);
  });

  it("limits atomic bulk updates to 90 inclusive dates", () => {
    assert.equal(listInclusiveDates("2026-09-01", "2026-11-29")?.length, 90);
    assert.equal(listInclusiveDates("2026-09-01", "2026-11-30"), null);
  });
});

describe("availability and pricing", () => {
  const baseInput = {
    checkin: "2026-09-01",
    checkout: "2026-09-04",
    basePrice: 1_000_000,
    totalUnits: 2,
  };

  it("falls back to room defaults and applies nightly overrides and the 5% fee", () => {
    const price = calculateStayPrice({
      ...baseInput,
      inventory: [{
        stayDate: "2026-09-02",
        priceOverride: 1_300_000,
        totalUnitsOverride: null,
        heldUnits: 0,
        bookedUnits: 0,
        stopSell: false,
      }],
    });

    assert.equal(price?.subtotal, 3_300_000);
    assert.equal(price?.serviceFee, 165_000);
    assert.equal(price?.grandTotal, 3_465_000);
    assert.equal(price?.averageNightlyPrice, 1_100_000);
  });

  it("requires every night to be sellable and available", () => {
    assert.equal(calculateStayPrice({
      ...baseInput,
      inventory: [{
        stayDate: "2026-09-02",
        priceOverride: null,
        totalUnitsOverride: 1,
        heldUnits: 1,
        bookedUnits: 0,
        stopSell: false,
      }],
    }), null);

    assert.equal(calculateStayPrice({
      ...baseInput,
      inventory: [{
        stayDate: "2026-09-03",
        priceOverride: null,
        totalUnitsOverride: null,
        heldUnits: 0,
        bookedUnits: 0,
        stopSell: true,
      }],
    }), null);
  });
});
