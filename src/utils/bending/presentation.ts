import { Bend, inches, Precision, Result } from "./bending";

export type OtherBend = Exclude<Bend, "stub">;
export interface GuideStep {
  label: string;
  instruction: string;
  finished: boolean;
  marks: number[];
  formed?: number[];
  flip?: boolean;
}

// Presentation only: measurement rules and complete instructions stay in calculate().
export function bendPresentation(bend: OtherBend, r: Result, p: Precision) {
  const f = (n: number) => inches(n, p);
  const step = (
    label: string,
    instruction: string,
    finished = false,
    marks: number[] = [],
  ): GuideStep => ({ label, instruction, finished, marks });
  const all = r.marks.map((_, i) => i);
  let steps: GuideStep[];
  switch (bend) {
    case "back":
      steps = [
        step("Start", r.steps[0]),
        step("Measure", r.steps[1], false, [0]),
        step("Star", r.steps[2], false, [0]),
        step("Bend", r.steps[3], true, [0]),
        step("Check", "Check the outside back-to-back distance, both resting 90° angles and that the legs lie in the same plane.", true),
      ];
      break;
    case "saddle3":
      steps = [
        step("Locate", r.steps[0], false, [1]),
        step("Mark", r.steps[1], false, all),
        step("Center", r.steps[2], false, [1]),
        step("Returns", r.steps[3], true, [0, 2]),
      ];
      break;
    case "rolling":
      steps = [
        step("Measure", r.steps[0]),
        step("Marks", `${r.steps[1]} ${r.steps[2]}`, false, all),
        step("Bend", r.steps[3], true, all),
        step("Check", r.steps[4], true),
      ];
      break;
    default:
      steps = [
        step("Place", r.steps[0], false, [0]),
        step(bend === "saddle4" ? "Marks" : "Space", r.steps[1], false, all),
        step("Bend", r.steps[2], true, all),
        step("Check", r.steps[3], true),
      ];
  }
  // Each physical bend gets its own view. The calculator remains authoritative.
  if (bend !== "back") {
    const formedStep = (label: string, instruction: string, formed: number[], marks: number[], flip = false): GuideStep =>
      ({ label, instruction, formed, marks, flip, finished: formed.length === r.marks.length });
    if (bend === "saddle3") {
      steps = [
        steps[0], steps[1],
        formedStep("Center", r.steps[2], [1], [1]),
        formedStep("Return 1", `Arrow on the near return mark. Bend ${r.angle}° opposite the center bend, in the same plane.`, [1, 0], [0]),
        formedStep("Return 2", `Arrow on the far return mark. Make the other ${r.angle}° return opposite the center bend. Keep all bends in one plane.`, [1, 0, 2], [2]),
        formedStep("Check", "Check saddle height, parallel legs, and obstacle clearance after springback.", all, []),
      ];
    } else if (bend === "saddle4") {
      steps = [steps[0], steps[1],
        ...all.map((i) => formedStep(`Bend ${i + 1}`,
          `Arrow on mark ${i + 1}: bend ${r.angle}°. ${["Start the first offset.", "Rotate the pipe 180°; bring the first pair parallel.", "Start the return pair toward the original level.", "Rotate the pipe 180°; bring the final leg parallel."][i]}`, all.slice(0, i + 1), [i])),
        formedStep("Check", r.steps[3], all, []),
      ];
    } else {
      const base = bend === "rolling" ? 1 : 0;
      steps = [
        ...(bend === "rolling" ? [steps[0]] : []),
        step("Place", r.steps[base], false, [0]),
        step("Space", r.steps[base + 1], false, all),
        formedStep("Bend 1", `Arrow on the first mark. Make the first ${r.angle}° bend; check the resting angle.`, [0], [0]),
        formedStep("Flip", "Rotate the conduit 180° around its length. Keep the second bend in the same plane to avoid a dogleg.", [0], [1], true),
        formedStep("Bend 2", `Arrow on the second mark. Bend ${r.angle}° in the opposite direction until both legs are parallel.`, all, [1], true),
        formedStep("Check", r.steps[base + 3], all, [], true),
      ];
    }
  }
  const marking =
    bend === "back"
      ? "Measure from the outside back of the existing 90—not the pipe tip. Align the star with the new mark."
      : bend === "saddle3"
        ? `Bend the ${r.angle * 2}° center first using the matching notch. Use the arrow for both ${r.angle}° returns.`
        : bend === "saddle4"
          ? "Arrow on all four marks. The first pair goes up; the second pair returns to the original level."
          : "Place your first mark where the job needs it. Use the arrow for both bends, in opposite directions.";
  const finished =
    bend === "back"
      ? "Check the outside back-to-back distance and both resting 90° angles after springback."
      : bend === "saddle3" || bend === "saddle4"
        ? "Keep the bends in one plane. Check the height, parallel legs and clearance after springback."
        : bend === "rolling"
          ? `Check ${f(r.height)} of rise and ${f(r.roll)} of sideways travel, with both legs parallel.`
          : `Check the ${f(r.height)} offset and parallel legs after springback.`;
  const notice =
    bend === "back"
      ? "Star method · no deduction · not a cut length"
      : bend === "saddle4"
        ? "Inner-mark spacing is not clear obstacle width. Check shoe clearance."
        : bend === "box"
          ? "Check minimum shoe spacing; a box-offset tool may be needed."
          : bend === "saddle3"
            ? "Use the notch for your center angle; verify clearance and fit."
            : bend === "rolling"
              ? "Side view is in the bending plane. Mirror sideways travel to suit the job."
              : "Verify your shoe’s marks and the resting angles.";
  return {
    steps,
    marking,
    finished,
    notice,
    closeMarks: r.gaps.some((gap) => gap < 4),
    summaryLabel:
      bend === "back"
        ? "Outside back to star mark"
        : bend === "saddle3"
          ? "Each side of the center mark"
          : bend === "saddle4"
            ? "Between marks 1–2 and 3–4"
            : "Between the two marks",
  };
}
