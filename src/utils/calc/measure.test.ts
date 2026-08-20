import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatFeetInches, reduceFraction, roundInches } from "./measure";

describe("measurement formatting", () => {
  it("reduces fractions", () => {
    assert.deepEqual(reduceFraction(4, 8), { num: 1, den: 2 });
    assert.deepEqual(reduceFraction(12, 16), { num: 3, den: 4 });
  });

  it("formats field measurements", () => {
    assert.equal(formatFeetInches(0, 16), '0"');
    assert.equal(formatFeetInches(12, 16), "1'");
    assert.equal(formatFeetInches(24.5, 16), `2' 1/2"`);
    assert.equal(formatFeetInches(-13.5, 16), `-1' 1 1/2"`);
  });

  it("supports nearest and round-up modes", () => {
    assert.equal(roundInches(10.44, 16, "nearest"), 10.4375);
    assert.equal(roundInches(10.44, 8, "up"), 10.5);
  });
});
