import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatFeetInches,
  getRoundingDirection,
  reduceFraction,
  roundInches,
} from "./measure";

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

  it("supports normal fractional rounding and an unrounded mode", () => {
    assert.equal(roundInches(10.44, 16), 10.4375);
    assert.equal(roundInches(10.44, 8), 10.5);
    assert.equal(roundInches(10.44, 32), 10.4375);
    assert.equal(roundInches(10.44, "none"), 10.44);
    assert.equal(formatFeetInches(13.1234567, "none"), `1' 1.123457"`);
  });

  it("describes whether normal rounding moved the answer up or down", () => {
    assert.equal(getRoundingDirection(4.4, 4.375), "down");
    assert.equal(getRoundingDirection(4.45, 4.5), "up");
    assert.equal(getRoundingDirection(4.5, 4.5), null);
  });
});
