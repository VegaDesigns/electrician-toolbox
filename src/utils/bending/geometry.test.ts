import assert from "node:assert/strict";
import test from "node:test";
import { ANGLES, BENDS, calculate, initialDraft, parseInches } from "./bending";
import { bendPresentation } from "./presentation";
import type { Result } from "./bending";
import {
  STUB_MARK,
  STUB_MARK_DISTANCE,
  stubPoint,
} from "./stubPreviewGeometry";

test("stub preview pivots around the marked material point at every frame", () => {
  for (let i = 0; i <= 100; i++) {
    const p = stubPoint(STUB_MARK_DISTANCE, i / 100);
    assert.ok(Math.abs(p.x - STUB_MARK.x) < 1e-8);
    assert.ok(Math.abs(p.y - STUB_MARK.y) < 1e-8);
  }
});
test("stub preview remains inside the stage and ends at ninety degrees", () => {
  for (let t = 0; t <= 100; t++)
    for (let s = 0; s <= 300; s += 2) {
      const p = stubPoint(s, t / 100);
      assert.ok(p.x >= 40 && p.x <= 365 && p.y >= 30 && p.y <= 200);
    }
  assert.equal(stubPoint(0, 1).a, Math.PI / 2);
  assert.equal(stubPoint(300, 1).a, 0);
});
test("ideal geometry recovers requested offset at every supported angle", () => {
  for (const angle of ANGLES) {
    const r = calculate(
      "offset",
      { ...initialDraft("offset"), height: "7 1/2", angle },
      6,
      "geometry",
      32,
    ).result!;
    assert.ok(
      Math.abs(r.value * Math.sin((angle * Math.PI) / 180) - 7.5) < 1e-8,
    );
  }
});
test("common decimal shorthand is accepted", () => {
  assert.equal(parseInches(".5"), 0.5);
  assert.equal(parseInches("6."), 6);
  assert.equal(parseInches("."), null);
});

test("every bend guide preserves all calculated steps with valid mark highlights", () => {
  for (const { id } of BENDS) {
    if (id === "stub") continue;
    for (const location of ["", "24 1/2"]) {
      const r: Result = calculate(
        id,
        { ...initialDraft(id), location },
        6,
        "field",
        16,
      ).result!;
      const content = bendPresentation(id, r, 16);
      assert.equal(content.steps.length, 4);
      assert.equal(content.steps[0].finished, false);
      assert.equal(content.steps[3].finished, true);
      for (const instruction of r.steps)
        assert.ok(
          content.steps.some((s) => s.instruction.includes(instruction)),
          id + ": " + instruction,
        );
      for (const step of content.steps) {
        assert.ok(step.label.length <= 7);
        for (const index of step.marks)
          assert.ok(index >= 0 && index < r.marks.length);
      }
    }
  }
});
test("saddle guide emphasizes the center notch before both returns", () => {
  for (const center of [45, 60] as const) {
    const r = calculate(
      "saddle3",
      { ...initialDraft("saddle3"), center },
      6,
      "field",
      16,
    ).result!;
    const content = bendPresentation("saddle3", r, 16);
    assert.deepEqual(content.steps[2].marks, [1]);
    assert.match(content.steps[2].instruction, /center first/);
    assert.ok(content.steps[2].instruction.includes(center + "° center notch"));
    assert.deepEqual(content.steps[3].marks, [0, 2]);
  }
});
test("back-to-back presentation never treats the star mark as a tip deduction", () => {
  const r = calculate("back", initialDraft("back"), 6, "field", 16).result!;
  const content = bendPresentation("back", r, 16);
  assert.equal(r.value, 24);
  assert.match(content.marking, /not the pipe tip/);
  assert.match(content.notice, /no deduction/);
  assert.match(content.summaryLabel, /Outside back to star/);
});
test("rolling guide keeps true-offset and plane information; close bends keep a warning", () => {
  const r = calculate(
    "rolling",
    initialDraft("rolling"),
    6,
    "field",
    16,
  ).result!;
  const content = bendPresentation("rolling", r, 16);
  assert.match(content.steps[0].instruction, /true offset 10″/);
  assert.match(content.steps[0].instruction, /53.1° from vertical/);
  assert.match(content.finished, /6″ of rise and 8″ of sideways/);
  const box = calculate("box", initialDraft("box"), 6, "field", 16).result!;
  assert.equal(bendPresentation("box", box, 16).closeMarks, true);
});
