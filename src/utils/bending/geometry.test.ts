import { fitForDraft, minimumOffsetHeight, reviewFit } from "./feasibility";
import { guideGeometry, backPreviewGeometry } from "./guideGeometry";
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

test("every bend guide preserves calculated layout instructions with valid mark highlights", () => {
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
      assert.ok(content.steps.length >= 4);
      assert.equal(content.steps[0].finished, false);
      assert.equal(content.steps[content.steps.length - 1].finished, true);
      for (const instruction of r.steps.slice(0, id === "rolling" ? 3 : 2))
        assert.ok(
          content.steps.some((s) => s.instruction.includes(instruction)),
          id + ": " + instruction,
        );
      for (const step of content.steps) {
        assert.ok(step.label.length <= 8);
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
    assert.deepEqual(content.steps[3].marks, [0]);
    assert.deepEqual(content.steps[4].marks, [2]);
    assert.deepEqual(content.steps[2].formed, [1]);
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

test("offset guide separates both bends and the pipe rotation", () => {
  const r = calculate("offset", initialDraft("offset"), 6, "field", 16).result!;
  const guide = bendPresentation("offset", r, 16).steps;
  assert.deepEqual(guide.map(s => s.label), ["Place", "Space", "Bend 1", "Flip", "Bend 2", "Check"]);
  assert.deepEqual(guide[2].formed, [0]);
  assert.deepEqual(guide[3].formed, [0]);
  assert.equal(guide[3].flip, true);
  assert.deepEqual(guide[4].formed, [0, 1]);
});
test("guided pipe remains in the stage through every transition and keeps the active material mark fixed", () => {
  for (const bend of ["offset", "box", "rolling", "saddle3", "saddle4"] as const) {
    for (const angle of ANGLES) {
      const r = calculate(bend, { ...initialDraft(bend), angle, center: angle === 60 ? 60 : 45 }, 6, "field", 16).result!;
      let previous = r.marks.map(() => 0);
      let previousFlip = 0;
      for (const step of bendPresentation(bend, r, 16).steps) {
        const next = r.marks.map((_, i) => Number(step.formed?.includes(i) ?? false));
        const nextFlip = Number(step.flip ?? false);
        const before = guideGeometry(bend, r.angle, previous, previousFlip).points;
        const changed = next.findIndex((v, i) => v !== previous[i]);
        for (let t = 0; t <= 100; t++) {
          const amounts = next.map((v, i) => previous[i] + (v - previous[i]) * t / 100);
          const g = guideGeometry(bend, r.angle, amounts, previousFlip + (nextFlip - previousFlip) * t / 100);
          for (const [x, y] of g.points) assert.ok(x >= 20 && x <= 380 && y >= 20 && y <= 265, bend + ": " + [x,y]);
          if (changed >= 0 && nextFlip === previousFlip) assert.ok(g.points[changed + 1].every((v, axis) => Math.abs(v - before[changed + 1][axis]) < 1e-8));
        }
        previous = next; previousFlip = nextFlip;
      }
      const g = guideGeometry(bend, r.angle, r.marks.map(() => 1));
      assert.ok(Math.abs(g.headings[g.headings.length - 1]) < 1e-8, "Finished legs must be parallel");
    }
  }
});

test("half-inch box offset at 45 degrees warns and suggests a viable smaller angle", () => {
  const draft = { ...initialDraft("box"), angle: 45 as const };
  for (let size = 0; size < 4; size++) {
    const result = calculate("box", draft, 6, "field", 16).result!;
    assert.equal(Math.round(result.value * 16) / 16, 11 / 16);
    const fit = fitForDraft("box", result, draft, size, 6, "field", 16);
    assert.ok(fit.issues.some(i => i.title === "Likely too tight for the bender"));
    assert.equal(fit.suggestedAngle, 10);
    assert.ok(!fit.issues.some(i => i.blocksLayout)); // Actual shoe is unidentified.
  }
});
test("fit warnings cover saddle height, inner bridge, short stubs, tight U and tip engagement", () => {
  for (const bend of ["saddle3", "saddle4", "rolling", "offset"] as const) {
    const r = calculate(bend, { ...initialDraft(bend), height: ".1", roll: ".1", angle: 60, bridge: ".1" }, 6, "field", 32).result!;
    assert.ok(reviewFit(bend, r, 1, 32).issues.length > 0);
  }
  const stub = calculate("stub", { ...initialDraft("stub"), height: "6.5" }, 6, "field", 16).result!;
  assert.match(reviewFit("stub", stub, 1, 16).issues[0].title, /minimum stub/);
  const back = calculate("back", { ...initialDraft("back"), span: "1" }, 6, "field", 16).result!;
  assert.match(reviewFit("back", back, 1, 16).issues[0].title, /back-to-back/);
  const offset = calculate("offset", { ...initialDraft("offset"), location: "0" }, 6, "field", 16).result!;
  assert.match(reviewFit("offset", offset, 1, 16).issues[0].title, /tip/);
});
test("rounding collisions are withheld and checked on absolute mark positions", () => {
  const tiny = calculate("offset", { ...initialDraft("offset"), height: ".001", location: "15" }, 6, "field", 16).result!;
  assert.equal(reviewFit("offset", tiny, 1, 16).issues[0].blocksLayout, true);
  const normal = calculate("offset", initialDraft("offset"), 6, "field", 16).result!;
  assert.equal(reviewFit("offset", normal, 1, 16).issues.length, 0);
  assert.ok(Math.abs(minimumOffsetHeight(4, 60) - 4) < 1e-8);
});
test("back-to-back animation preserves the existing bend and star mark, with no clipped frames", () => {
  for (let i = 0; i <= 100; i++) {
    const g = backPreviewGeometry(i / 100);
    assert.deepEqual(g.points[0], [70, 85]);
    assert.deepEqual(g.points[1], [70, 190]);
    assert.deepEqual(g.points[2], [250, 190]);
    for (const [x,y] of g.points) assert.ok(x >= 20 && x <= 380 && y >= 20 && y <= 265);
  }
  assert.equal(backPreviewGeometry(1).angle, Math.PI / 2);
});
