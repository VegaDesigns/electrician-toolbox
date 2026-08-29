import assert from "node:assert/strict";
import test from "node:test";

import {
  BUILT_IN_PANEL_SCHEMES,
  getNearbyCircuits,
  getPhaseForCircuit,
  makeConductorColor,
} from "./phase";

test("matches the supplied adjacent-pair panel example", () => {
  assert.equal(getPhaseForCircuit(78), "A");
  assert.equal(getPhaseForCircuit(79), "A");
  assert.equal(getPhaseForCircuit(80), "B");
  assert.equal(getPhaseForCircuit(81), "B");
  assert.equal(getPhaseForCircuit(82), "C");
});

test("rejects invalid circuit numbers", () => {
  assert.throws(() => getPhaseForCircuit(0), RangeError);
  assert.throws(() => getPhaseForCircuit(1.5), RangeError);
});

test("returns nearby circuits with the active scheme colors", () => {
  const scheme = BUILT_IN_PANEL_SCHEMES[0];
  const nearby = getNearbyCircuits(80, scheme);

  assert.deepEqual(
    nearby.map(({ circuit, color, phase }) => [circuit, phase, color.name]),
    [
      [78, "A", "Black"],
      [79, "A", "Black"],
      [80, "B", "Red"],
      [81, "B", "Red"],
      [82, "C", "Blue"],
    ],
  );
});

test("recognizes common custom conductor colors", () => {
  assert.equal(makeConductorColor("Purple").hex, "#8B5BD6");
  assert.equal(makeConductorColor("Green / Bare").hex, "#29945B");
});

