import { ANGLES, Angle, Bend, Draft, Method, Precision, Result, calculate, inches, isRounded } from "./bending";

// Screening examples, not the user's identified shoe. Greenlee Site-Rite manual,
// 52034125 REV 02, p.4: 840A, 841A, 842A, 843A. See docs/bending-methods.md.
export const REFERENCE_RADII = [4.1875, 5.125, 6.5, 9.625] as const;
export type FitIssue = { title: string; message: string; blocksLayout: boolean };
export type FitReview = { issues: FitIssue[]; suggestedAngle?: Angle; referenceRadius: number };
export function minimumOffsetHeight(radius: number, angle: number) {
  return 2 * radius * (1 - Math.cos(angle * Math.PI / 180));
}

export function reviewFit(bend: Bend, r: Result, size: number, precision: Precision): FitReview {
  const radius = REFERENCE_RADII[size] ?? REFERENCE_RADII[1];
  const f = (n: number) => `${isRounded(n, precision) ? "≈ " : ""}${inches(n, precision)}`;
  const issues: FitIssue[] = [];
  const add = (title: string, message: string, blocksLayout = false) => issues.push({ title, message, blocksLayout });
  const rounded = r.marks.map(m => Math.round(m.at * precision));
  if (Math.round(r.value * precision) === 0 || rounded.some((n, i) => i > 0 && n <= rounded[i - 1])) {
    add("Marks are too close to display", "At this precision, the layout rounds to zero or puts two marks at the same location. Use finer precision or increase the dimensions.", true);
  }
  if (bend === "stub") {
    if (r.value < 1) add("Check the minimum stub", `The mark is only ${f(r.value)} from the tip. A positive mark does not guarantee the hook can grip it. Check your shoe’s minimum stub length.`);
  } else if (bend === "back") {
    if (r.span < 2 * radius) add("Tight back-to-back bends", `The ${f(r.span)} span is smaller than two reference bend radii (${f(2 * radius)}). Check your actual shoe radius and clearance before making the second 90°.`);
  } else {
    const height = bend === "rolling" ? Math.hypot(r.height, r.roll) : r.height;
    const minimum = minimumOffsetHeight(radius, r.angle);
    if (height < minimum - 1e-8) {
      add("Likely too tight for the bender", `At ${r.angle}°, this ${f(height)} height is below the ${f(minimum)} ideal minimum for the reference shoe. The calculated ${f(r.value)} mark spacing does not prove it can be bent. ${bend === "saddle3" ? "Increase the height or use a suitable tool." : "Try a smaller angle or a suitable offset tool."}`);
    } else if (r.gaps.some(gap => gap < 4)) {
      add("Check room for the bender", `The closest marks are ${f(Math.min(...r.gaps))} apart. Check that the shoe can seat without hitting a previous bend.${bend === "box" ? " A box-offset tool may be needed." : ""}`);
    }
    if (!r.relative && r.marks[0].at < 1) add("First mark is close to the tip", `The first mark is ${f(r.marks[0].at)} from the tip. Verify hook engagement or move the layout farther along the pipe.`);
  }
  return { issues, referenceRadius: radius };
}

export function fitForDraft(bend: Bend, r: Result, draft: Draft, size: number, deduction: number, method: Method, precision: Precision): FitReview {
  const review = reviewFit(bend, r, size, precision);
  if (!["offset", "rolling", "box", "saddle4"].includes(bend) || !review.issues.some(i => i.blocksLayout || i.title === "Likely too tight for the bender" || i.title === "Check room for the bender")) return review;
  // Suggest a lower angle only if its radius screen clears; still not a shoe-fit guarantee.
  const candidate = [...ANGLES].reverse().find(angle => {
    if (angle >= draft.angle) return false;
    const result = calculate(bend, { ...draft, angle }, deduction, method, precision).result;
    if (!result) return false;
    const height = bend === "rolling" ? Math.hypot(result.height, result.roll) : result.height;
    return height >= minimumOffsetHeight(review.referenceRadius, angle) &&
      !reviewFit(bend, result, size, precision).issues.some(i => i.blocksLayout);
  });
  return { ...review, suggestedAngle: candidate };
}
