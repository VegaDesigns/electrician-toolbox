import assert from "node:assert/strict";
import test from "node:test";

import { calculateBoxFill, getNextStandardBox } from "./boxFill";

test("calculates the mixed-wire field example", () => {
  const result = calculateBoxFill({
    availableVolume: 30.3,
    deviceCount: 0,
    deviceWireSize: "12",
    hasInternalClamp: false,
    wires: [
      { quantity: 3, role: "insulated", size: "10" },
      { quantity: 1, role: "ground", size: "12" },
      { quantity: 5, role: "insulated", size: "12" },
    ],
  });

  assert.equal(result.requiredVolume, 21);
  assert.ok(Math.abs(result.remainingVolume - 9.3) < 0.000001);
  assert.equal(result.fits, true);
});

test("uses one ground allowance for up to four grounds", () => {
  const fourGrounds = calculateBoxFill({
    availableVolume: 30.3,
    deviceCount: 0,
    deviceWireSize: "12",
    hasInternalClamp: false,
    wires: [{ quantity: 4, role: "ground", size: "12" }],
  });
  const fiveGrounds = calculateBoxFill({
    availableVolume: 30.3,
    deviceCount: 0,
    deviceWireSize: "12",
    hasInternalClamp: false,
    wires: [{ quantity: 5, role: "ground", size: "12" }],
  });

  assert.equal(fourGrounds.breakdown.grounds, 2.25);
  assert.equal(fiveGrounds.breakdown.grounds, 2.8125);
});

test("counts each device yoke as two conductor allowances", () => {
  const result = calculateBoxFill({
    availableVolume: 21,
    deviceCount: 1,
    deviceWireSize: "12",
    hasInternalClamp: true,
    wires: [{ quantity: 4, role: "insulated", size: "12" }],
  });

  assert.equal(result.breakdown.insulated, 9);
  assert.equal(result.breakdown.devices, 4.5);
  assert.equal(result.breakdown.clamps, 2.25);
  assert.equal(result.requiredVolume, 15.75);
});

test("finds the next box in a preferred family", () => {
  assert.deepEqual(getNextStandardBox(21.1, "four-square"), {
    depth: "2-1/8",
    family: "four-square",
    volume: 30.3,
  });
});

test("includes constrained octagon and device-box presets", () => {
  assert.deepEqual(getNextStandardBox(20, "four-octagon"), {
    depth: "2-1/8",
    family: "four-octagon",
    volume: 21.5,
  });
  assert.deepEqual(getNextStandardBox(10, "three-two-device"), {
    depth: "2-1/4",
    family: "three-two-device",
    volume: 10.5,
  });
});
