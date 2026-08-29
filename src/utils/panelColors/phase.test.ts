import assert from "node:assert/strict";
import test from "node:test";

import {
  BUILT_IN_PANEL_SCHEMES,
  getNearbyCircuits,
  getPhaseForCircuit,
  makeConductorColor,
} from "./phase";

test("uses the standard A-B-C branch-panel row sequence", () => {
  const scheme = BUILT_IN_PANEL_SCHEMES[0];

  assert.equal(getPhaseForCircuit(1, scheme), "A");
  assert.equal(getPhaseForCircuit(2, scheme), "A");
  assert.equal(getPhaseForCircuit(3, scheme), "B");
  assert.equal(getPhaseForCircuit(4, scheme), "B");
  assert.equal(getPhaseForCircuit(5, scheme), "C");
  assert.equal(getPhaseForCircuit(6, scheme), "C");
  assert.equal(getPhaseForCircuit(55, scheme), "A");
});

test("uses the standard L1-L2 split-phase row sequence", () => {
  const scheme = BUILT_IN_PANEL_SCHEMES[2];

  assert.equal(getPhaseForCircuit(1, scheme), "L1");
  assert.equal(getPhaseForCircuit(2, scheme), "L1");
  assert.equal(getPhaseForCircuit(3, scheme), "L2");
  assert.equal(getPhaseForCircuit(4, scheme), "L2");
  assert.equal(getPhaseForCircuit(5, scheme), "L1");
});

test("rejects invalid circuit numbers", () => {
  assert.throws(() => getPhaseForCircuit(0), RangeError);
  assert.throws(() => getPhaseForCircuit(1.5), RangeError);
});

test("returns nearby circuits with the active scheme colors", () => {
  const scheme = BUILT_IN_PANEL_SCHEMES[0];
  const nearby = getNearbyCircuits(55, scheme);

  assert.deepEqual(
    nearby.map(({ circuit, color, phase }) => [circuit, phase, color.name]),
    [
      [53, "C", "Blue"],
      [54, "C", "Blue"],
      [55, "A", "Black"],
      [56, "A", "Black"],
      [57, "B", "Red"],
    ],
  );
});

test("recognizes common custom conductor colors", () => {
  assert.equal(makeConductorColor("Purple").hex, "#8B5BD6");
  assert.equal(makeConductorColor("Green / Bare").hex, "#29945B");
});
