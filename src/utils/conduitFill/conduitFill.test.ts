import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateConduitFill,
  findMinimumConduitSize,
  getFillLimitPercent,
  getMaxAdditionalConductors,
} from "./conduitFill";

test("uses the Chapter 9 fill limit for the conductor count", () => {
  assert.equal(getFillLimitPercent(1), 53);
  assert.equal(getFillLimitPercent(2), 31);
  assert.equal(getFillLimitPercent(3), 40);
  assert.equal(getFillLimitPercent(20), 40);
});

test("calculates a common mixed THHN fill", () => {
  const result = calculateConduitFill("emt", "3/4", [
    { quantity: 3, size: "10" },
    { quantity: 6, size: "12" },
  ]);

  assert.equal(result.conductorCount, 9);
  assert.ok(Math.abs(result.usedArea - 0.1431) < 0.000001);
  assert.equal(result.allowableArea, 0.213);
  assert.equal(result.fits, true);
});

test("finds the smallest listed conduit that fits", () => {
  assert.equal(
    findMinimumConduitSize("emt", [{ quantity: 12, size: "10" }]),
    "1",
  );
});

test("additional conductor count accounts for a changing fill limit", () => {
  assert.equal(
    getMaxAdditionalConductors("emt", "1/2", [{ quantity: 1, size: "4" }], "4"),
    0,
  );
});
