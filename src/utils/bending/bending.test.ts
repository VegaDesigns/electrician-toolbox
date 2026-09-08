import assert from "node:assert/strict";
import test from "node:test";
import {
  BENDS,
  Bend,
  calculate,
  inches,
  initialDraft,
  parseInches,
} from "./bending";
const calc = (bend: Bend, patch = {}) =>
  calculate(bend, { ...initialDraft(bend), ...patch }, 6, "field", 16);
test("stub: measure ten, deduct six, arrow at four", () => {
  const r = calc("stub").result!;
  assert.equal(r.value, 4);
  assert.equal(r.marks[0].align, "Arrow");
});
test("offset spacing uses fractions, without an assumed first end distance", () => {
  const r = calc("offset").result!;
  assert.equal(r.value, 12);
  assert.equal(r.relative, true);
  assert.equal(
    calc("offset", { height: "3", angle: 22.5 }).result!.value,
    7.800000000000001,
  );
  assert.equal(inches(7.8), "7 13/16″");
});
test("absolute marks preserve user's first mark, no silent shrink", () => {
  assert.deepEqual(
    calc("offset", { location: "20" }).result!.marks.map((m) => m.at),
    [20, 32],
  );
});
test("saddle uses separate 2.5 multiplier and center correction", () => {
  const r = calc("saddle3", { location: "20" }).result!;
  assert.equal(r.value, 5);
  assert.deepEqual(
    r.marks.map((m) => m.at),
    [15.375, 20.375, 25.375],
  );
  assert.equal(r.marks[1].align, "45° center notch");
});
test("rolling uses combined rise and sideways travel", () => {
  const r = calc("rolling").result!;
  assert.equal(r.value, 20);
  assert.ok(Math.abs(r.rollAngle! - 53.1301) < 0.001);
});
test("four point: two offset pairs with explicit inner mark spacing", () => {
  assert.deepEqual(
    calc("saddle4").result!.marks.map((m) => m.at),
    [0, 12, 24, 36],
  );
});
test("back to back uses star and no deduction", () => {
  const r = calc("back").result!;
  assert.equal(r.value, 24);
  assert.equal(r.marks[0].align, "Star");
});
test("all supported bend defaults produce finite results", () => {
  for (const b of BENDS) {
    assert.ok(Number.isFinite(calc(b.id).result?.value));
  }
});
test("invalid and physically negative layouts do not produce marks", () => {
  for (const height of ["", "-2", "0", "oops", "1/0"]) {
    assert.ok(calc("offset", { height }).error);
  }
  assert.ok(calc("stub", { height: "5" }).error);
  assert.ok(calc("saddle3", { location: "1" }).error);
});
test("parser and tape fractions carry and reduce", () => {
  assert.equal(parseInches("6 1/2"), 6.5);
  assert.equal(parseInches("6-1/2″"), 6.5);
  assert.equal(inches(11.999), "12″");
  assert.equal(inches(0.5), "1/2″");
  assert.equal(inches(1 / 32, 32), "1/32″");
  assert.equal(parseInches("12001"), null);
});
