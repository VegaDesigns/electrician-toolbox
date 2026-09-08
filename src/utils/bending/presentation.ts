import { Bend, inches, Precision, Result } from "./bending";

export type OtherBend = Exclude<Bend, "stub">;
export interface GuideStep {
  label: string;
  instruction: string;
  finished: boolean;
  marks: number[];
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
