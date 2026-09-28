import assert from "node:assert/strict";
import test from "node:test";
import { displayScale } from "./display";

test("calculator text fits before scrolling and never falls below its readable size", () => {
  assert.equal(displayScale(180, 300, 56, 32), 1);
  assert.equal(displayScale(400, 300, 56, 32), 298 / 400);
  assert.equal(displayScale(1200, 300, 56, 32), 32 / 56);
  assert.equal(displayScale(1200, 250, 38, 28), 28 / 38);
});

test("calculator sizing recovers for shorter text, new widths, and initial layout", () => {
  assert.equal(displayScale(0, 300, 56, 32), 1);
  assert.equal(displayScale(400, 0, 56, 32), 1);
  assert.equal(displayScale(400, 500, 56, 32), 1);
  assert.equal(displayScale(120, 300, 56, 32), 1);
});

test("pending measurements keep the shrunken size without a full-size flash", () => {
  let scale = displayScale(400, 300, 56, 32);
  for (const width of [430, 460, 510, 580, 680, 800]) {
    const pending = displayScale(0, 300, 56, 32, scale);
    assert.equal(pending, scale);
    const settled = displayScale(width, 300, 56, 32, pending);
    assert.ok(settled <= scale);
    scale = settled;
  }
  assert.equal(scale, 32 / 56);
  assert.equal(displayScale(900, 300, 56, 32, scale), scale);
  assert.equal(displayScale(0, 0, 56, 32, scale), scale);
  assert.equal(displayScale(60, 300, 56, 32, scale), 1);
});
