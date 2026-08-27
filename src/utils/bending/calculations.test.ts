import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateFourPointSaddle,
  calculateOffset,
  calculateRollingOffset,
  calculateStub,
  calculateThreePointSaddle,
  calculateTowardObstructionMarks,
} from "./calculations";

describe("conduit bending calculations", () => {
  it("calculates a standard 30-degree offset", () => {
    const result = calculateOffset(4, 30);

    assert.equal(result.multiplier, 2);
    assert.equal(result.spacing, 8);
    assert.equal(result.shrink, 1);
  });

  it("combines rise and roll before laying out a rolling offset", () => {
    const result = calculateRollingOffset(3, 4, 30);

    assert.equal(result.trueOffset, 5);
    assert.ok(Math.abs(result.spacing - 10) < 0.0001);
  });

  it("moves the second offset mark past an obstruction and measures the first mark back", () => {
    const marks = calculateTowardObstructionMarks(36, calculateOffset(6, 30));

    assert.deepEqual(marks, { firstMark: 25.5, secondMark: 37.5 });
  });

  it("subtracts the bender deduct for a stub-up", () => {
    assert.deepEqual(calculateStub(18, 6), { mark: 12 });
  });

  it("lays out a standard three-point saddle around its adjusted center", () => {
    const result = calculateThreePointSaddle(2, 30);

    assert.equal(result.shrink, 0.375);
    assert.equal(result.centerMark, 30.375);
    assert.equal(result.firstMark, 25.375);
    assert.equal(result.thirdMark, 35.375);
  });

  it("lays out both sides of a four-point saddle", () => {
    const result = calculateFourPointSaddle(4, 10, 30);

    assert.ok(Math.abs(result.firstToSecond - 8) < 0.0001);
    assert.equal(result.secondToThird, 10);
    assert.ok(Math.abs(result.totalLayout - 26) < 0.0001);
  });
});
