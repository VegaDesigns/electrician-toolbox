// Field methods are referenced in docs/bending-methods.md. All lengths are inches.
export const BENDS = [
  {
    id: "stub",
    title: "90° stub-up",
    hint: "Turn up from the end of a pipe",
    icon: "└",
  },
  {
    id: "offset",
    title: "Offset",
    hint: "Change elevation with two bends",
    icon: "⌁",
  },
  {
    id: "rolling",
    title: "Rolling offset",
    hint: "Move up and sideways together",
    icon: "↗",
  },
  {
    id: "saddle3",
    title: "3-point saddle",
    hint: "Bridge a narrow obstruction",
    icon: "⌃",
  },
  {
    id: "saddle4",
    title: "4-point saddle",
    hint: "Two offsets with a bridge between",
    icon: "⊓",
  },
  {
    id: "back",
    title: "Back-to-back 90s",
    hint: "Measure from an existing 90",
    icon: "∪",
  },
  {
    id: "box",
    title: "Box offset",
    hint: "A small change into a box",
    icon: "⌁",
  },
] as const;
export type Bend = (typeof BENDS)[number]["id"];
export const ANGLES = [10, 22.5, 30, 45, 60] as const;
export type Angle = (typeof ANGLES)[number];
export type Precision = 8 | 16 | 32;
export type Method = "field" | "geometry";
export type Field = "height" | "roll" | "bridge" | "span" | "location";
export type Draft = Record<Field, string> & { angle: Angle; center: 45 | 60 };
export const DEFAULT_DRAFT: Draft = {
  height: "6",
  roll: "8",
  bridge: "12",
  span: "24",
  location: "",
  angle: 30,
  center: 45,
};
export function initialDraft(bend: Bend): Draft {
  return {
    ...DEFAULT_DRAFT,
    height:
      bend === "stub"
        ? "10"
        : bend === "box"
          ? "1/2"
          : bend === "saddle3"
            ? "2"
            : "6",
    angle: bend === "box" ? 10 : 30,
  };
}
export function parseInches(raw: string): number | null {
  const value = raw.trim().replace(/[″"]/g, "").trim();
  if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
    const n = Number(value);
    return n <= 12000 ? n : null;
  }
  const m = value.match(/^(?:(\d+)[ -]+)?(\d+)\/(\d+)$/);
  if (!m || Number(m[3]) === 0) return null;
  const n = Number(m[1] ?? 0) + Number(m[2]) / Number(m[3]);
  return n <= 12000 ? n : null;
}
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
export function inches(n: number, precision: Precision = 16): string {
  if (!Number.isFinite(n)) return "—";
  const units = Math.round(Math.abs(n) * precision);
  const whole = Math.floor(units / precision),
    part = units % precision;
  const d = gcd(part, precision);
  return `${n < 0 ? "−" : ""}${whole || !part ? whole : ""}${whole && part ? " " : ""}${part ? `${part / d}/${precision / d}` : ""}″`;
}
export const isRounded = (n: number, precision: Precision) =>
  Math.abs(n - Math.round(n * precision) / precision) > 1e-7;
const multiplier: Record<Angle, number> = {
  10: 6,
  22.5: 2.6,
  30: 2,
  45: 1.4,
  60: 1.2,
};
const shrinkFactor: Record<Angle, number> = {
  10: 1 / 16,
  22.5: 3 / 16,
  30: 1 / 4,
  45: 3 / 8,
  60: 1 / 2,
};
export interface Mark {
  label: string;
  at: number;
  angle: number;
  align: string;
}
export interface Result {
  value: number;
  label: string;
  marks: Mark[];
  gaps: number[];
  steps: string[];
  warnings: string[];
  height: number;
  angle: number;
  bridge: number;
  roll: number;
  span: number;
  deduction: number;
  origin: string;
  shrink?: number;
  factor?: number;
  rollAngle?: number;
  relative: boolean;
  method: string;
}
export type Calculation =
  { result: Result; error?: never } | { error: string; result?: never };
export function calculate(
  bend: Bend,
  draft: Draft,
  deduction: number,
  method: Method,
  precision: Precision,
): Calculation {
  const f = (n: number) => inches(n, precision);
  const height = parseInches(draft.height),
    roll = parseInches(draft.roll),
    bridge = parseInches(draft.bridge),
    span = parseInches(draft.span);
  if (
    !(ANGLES as readonly number[]).includes(draft.angle) ||
    ![45, 60].includes(draft.center)
  )
    return { error: "Choose a supported bend angle." };
  if (bend !== "back" && (height === null || height <= 0))
    return { error: "Enter a height greater than zero, in inches." };
  const location = draft.location.trim() ? parseInches(draft.location) : null;
  if (draft.location.trim() && location === null)
    return {
      error: "Check the mark location. Use inches, such as 24 or 24 1/2.",
    };
  const r: Result = {
    value: 0,
    label: "Distance between marks",
    marks: [],
    gaps: [],
    steps: [],
    warnings: [],
    height: height ?? 0,
    angle: draft.angle,
    bridge: bridge ?? 0,
    roll: roll ?? 0,
    span: span ?? 0,
    deduction,
    origin:
      location === null
        ? "First mark · place where needed"
        : "From starting end",
    relative: location === null,
    method: "Field method",
  };
  if (bend === "stub") {
    if (!Number.isFinite(deduction) || deduction <= 0 || deduction > 48)
      return {
        error:
          "Set a valid deduction from your bender (greater than zero, up to 48″).",
      };
    if (r.height <= deduction)
      return {
        error: `Height must exceed the ${f(deduction)} deduction. Check the bender's minimum stub length.`,
      };
    r.value = r.height - deduction;
    r.label = "Mark from the end";
    r.angle = 90;
    r.relative = false;
    r.origin = "Starting end";
    r.marks = [{ label: "Bend mark", at: r.value, angle: 90, align: "Arrow" }];
    r.steps = [
      `Measure ${f(r.height)} from the end you want to turn up.`,
      `Come back ${f(deduction)} toward that end. Your bend mark is ${f(r.value)} from the end.`,
      "Align the arrow with the bend mark; face the hook toward the short end.",
      "Bend and check for a resting 90° after springback. Verify finished height to the outside back of the pipe.",
    ];
    return { result: r };
  }
  if (bend === "back") {
    if (span === null || span <= 0)
      return { error: "Enter the outside back-to-back distance in inches." };
    r.value = span;
    r.label = "Measure from the first 90's back";
    r.angle = 90;
    r.relative = false;
    r.origin = "Back of existing 90 · not pipe tip";
    r.marks = [{ label: "Second 90", at: span, angle: 90, align: "Star" }];
    r.steps = [
      "Make and verify the first 90° before taking this measurement.",
      `Measure ${f(span)} along the straight leg from the outside back of that first 90. Mark that location.`,
      "Align the bender's star with this mark, with the hook toward the free end away from the first bend.",
      "Make the second 90° in the same plane. Check the outside back-to-back distance; trim free legs separately if needed.",
    ];
    r.warnings.push(
      "No deduction is applied with this star method. Confirm the shoe fits between bends; this is not a cut-length calculation.",
    );
    return { result: r };
  }
  if (bend === "saddle3") {
    const center = draft.center,
      factor = center === 45 ? 2.5 : 2;
    const gap = r.height * factor,
      correction = r.height * (center === 45 ? 3 / 16 : 1 / 4);
    const middle = location === null ? gap : location + correction;
    if (middle < gap)
      return {
        error:
          "The near return mark would fall before the pipe end. Move the saddle farther from the end.",
      };
    r.value = gap;
    r.label = "Each side of the center mark";
    r.angle = center / 2;
    r.factor = factor;
    r.shrink = correction;
    r.origin =
      location === null
        ? "Center mark · place where needed"
        : "From starting end · center correction included";
    r.marks = [
      {
        label: "Near return",
        at: middle - gap,
        angle: center / 2,
        align: "Arrow",
      },
      {
        label: "Center · bend first",
        at: middle,
        angle: center,
        align: `${center}° center notch`,
      },
      {
        label: "Far return",
        at: middle + gap,
        angle: center / 2,
        align: "Arrow",
      },
    ];
    r.gaps = [gap, gap];
    r.method = "Klein saddle field method";
    r.steps = [
      location === null
        ? "Choose the saddle center location. For a known obstruction location, enter its distance under Mark location."
        : `Add the ${f(correction)} center-location correction to ${f(location)}: center mark ${f(middle)}.`,
      `Place a return mark ${f(gap)} on each side of the center mark.`,
      `Use the bender's matching ${center}° center notch at the center mark; bend the center first to ${center}°.`,
      `Use the arrow for both ${center / 2}° return bends in the opposite direction to the center bend. Keep all bends in one plane.`,
    ];
    r.warnings.push(
      "Use the matching saddle center notch, not the arrow for the middle bend. Height and spacing are field estimates; allow clearance and verify the fit.",
    );
    return { result: r };
  }
  if (bend === "rolling" && (roll === null || roll <= 0))
    return { error: "Enter a sideways travel greater than zero." };
  if (bend === "saddle4" && (bridge === null || bridge <= 0))
    return { error: "Enter the spacing between the two inner marks." };
  const trueHeight =
    bend === "rolling" ? Math.hypot(r.height, r.roll) : r.height;
  const factor =
    method === "field"
      ? multiplier[draft.angle]
      : 1 / Math.sin((draft.angle * Math.PI) / 180);
  const gap = trueHeight * factor;
  r.value = gap;
  r.factor = factor;
  r.method =
    method === "field"
      ? "Rounded hand-bender multiplier"
      : "Ideal centerline geometry";
  r.shrink =
    trueHeight *
    (method === "field"
      ? shrinkFactor[draft.angle]
      : Math.tan((draft.angle * Math.PI) / 360));
  const base = location ?? 0;
  r.marks = [
    { label: "Mark 1", at: base, angle: draft.angle, align: "Arrow" },
    { label: "Mark 2", at: base + gap, angle: draft.angle, align: "Arrow" },
  ];
  r.gaps = [gap];
  r.steps = [
    location === null
      ? "Choose the first mark's location to suit the job. No end distance is assumed."
      : `Place the first mark ${f(base)} from your starting end.`,
    `Place the second mark ${f(gap)} from the first.`,
    `Align the arrow at each mark. Make two ${draft.angle}° bends in opposite directions, rotating the pipe 180° between bends.`,
    "Check that the legs are parallel and the offset fits after springback.",
  ];
  if (bend === "rolling") {
    r.rollAngle = (Math.atan2(r.roll, r.height) * 180) / Math.PI;
    r.steps.unshift(
      `Combine rise and sideways travel: true offset ${f(trueHeight)}. Work in a plane ${r.rollAngle.toFixed(1)}° from vertical toward the sideways travel.`,
    );
    r.warnings.push(
      "The pipe side view is in the bending plane. The end-view inset shows rise and sideways travel; mirror the roll direction to suit the job.",
    );
  }
  if (bend === "saddle4") {
    r.marks.push(
      {
        label: "Mark 3",
        at: base + gap + r.bridge,
        angle: draft.angle,
        align: "Arrow",
      },
      {
        label: "Mark 4",
        at: base + 2 * gap + r.bridge,
        angle: draft.angle,
        align: "Arrow",
      },
    );
    r.gaps = [gap, r.bridge, gap];
    r.label = "Spacing for each offset pair";
    r.steps = [
      r.steps[0],
      `Marks 1–2: ${f(gap)}. Marks 2–3: your ${f(r.bridge)} bridge-mark spacing. Marks 3–4: ${f(gap)}.`,
      `Form the first two marks as a ${draft.angle}° offset, then the last two as a returning offset. Bend directions along the pipe: up, level, down, level.`,
      "Keep all four bends in one plane and check clearance before final installation.",
    ];
    r.warnings.push(
      "Bridge spacing means distance between inner layout marks, NOT guaranteed clear obstacle width. Shoe radius consumes clearance. Include extra room and check fit.",
    );
    r.shrink *= 2;
  }
  if (bend === "box")
    r.warnings.push(
      "Small offsets may not fit a standard shoe. Check minimum spacing and use a suitable box-offset tool if required.",
    );
  if (gap < 4)
    r.warnings.push(
      "Close bend marks: check that the bender can seat without overlapping the previous bend.",
    );
  return { result: r };
}
