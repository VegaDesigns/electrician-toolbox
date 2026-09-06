import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAmpacity,
  DEFAULT_AMPACITY_CONDITIONS,
  resolveLugRating,
} from "./ampacity";

test("uses the small-conductor limit for common #12 copper", () => {
  const result = calculateAmpacity("copper", "12", DEFAULT_AMPACITY_CONDITIONS);
  assert.equal(result.finalAmpacity, 20);
  assert.deepEqual(result.limitingReasons, ["small-wire"]);
});

test("honors a marked 75 degree termination", () => {
  const result = calculateAmpacity("copper", "8", {
    ...DEFAULT_AMPACITY_CONDITIONS,
    lugRating: "75",
  });
  assert.equal(result.finalAmpacity, 50);
  assert.deepEqual(result.limitingReasons, ["termination"]);
});

test("applies heat and conductor grouping from the 90 degree conductor value", () => {
  const result = calculateAmpacity("copper", "6", {
    ambientBand: "96-104",
    conductorCountBand: "4-6",
    lugRating: "75",
  });
  assert.equal(result.adjustedAmpacity, 54.6);
  assert.equal(result.finalAmpacity, 54);
  assert.deepEqual(result.limitingReasons, ["ambient", "grouping"]);
});

test("applies the common small-conductor limit to #10 aluminum", () => {
  const result = calculateAmpacity("aluminum", "10", {
    ...DEFAULT_AMPACITY_CONDITIONS,
    lugRating: "75",
  });
  assert.equal(result.finalAmpacity, 25);
  assert.deepEqual(result.limitingReasons, ["small-wire"]);
});

test("not sure uses a conservative connection temperature by conductor size", () => {
  assert.equal(resolveLugRating("1", "unknown"), "60");
  assert.equal(resolveLugRating("1/0", "unknown"), "75");
});

test("rejects #14 aluminum because it is not in the supported reference set", () => {
  assert.throws(
    () => calculateAmpacity("aluminum", "14", DEFAULT_AMPACITY_CONDITIONS),
    /not available/,
  );
});
