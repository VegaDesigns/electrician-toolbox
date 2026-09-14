import { ANGLES, BENDS, initialDraft, type Bend, type Draft, type Field, type Method, type Precision } from "./bending";
export type BenderSettings = { size: number; deduction: number; precision: Precision; method: Method };
export type BenderSetup = { settings: BenderSettings; bend: Bend; drafts: Record<Bend, Draft> };
export const BENDER_SIZES = [
  { name: "½″", deduct: 5 }, { name: "¾″", deduct: 6 },
  { name: "1″", deduct: 8 }, { name: "1¼″", deduct: 11 },
];
export function defaultBenderSetup(): BenderSetup {
  return { settings: { size: 1, deduction: 6, precision: 16, method: "field" }, bend: "stub",
    drafts: Object.fromEntries(BENDS.map(b => [b.id, initialDraft(b.id)])) as Record<Bend, Draft> };
}
export function decodeBenderSetup(raw: string): BenderSetup {
  const data = JSON.parse(raw) as Partial<BenderSetup>;
  if (!data || typeof data !== "object" || Array.isArray(data)
    || !data.settings || typeof data.settings !== "object" || Array.isArray(data.settings)
    || !data.drafts || typeof data.drafts !== "object" || Array.isArray(data.drafts)) throw Error("Unreadable bender setup");
  const next = defaultBenderSetup(), v = data.settings;
  next.settings = {
    size: Number.isInteger(v.size) && v.size >= 0 && v.size < BENDER_SIZES.length ? v.size : 1,
    deduction: typeof v.deduction === "number" && v.deduction > 0 && v.deduction <= 48 ? v.deduction : 6,
    precision: [8, 16, 32].includes(v.precision) ? v.precision : 16,
    method: v.method === "geometry" ? "geometry" : "field",
  };
  if (BENDS.some(b => b.id === data.bend)) next.bend = data.bend!;
  for (const b of BENDS) {
    const saved = data.drafts[b.id];
    if (!saved) continue;
    for (const key of ["height", "roll", "bridge", "span", "location"] as Field[]) {
      if (typeof saved[key] === "string" && saved[key].length < 40) next.drafts[b.id][key] = saved[key];
    }
    if (ANGLES.includes(saved.angle)) next.drafts[b.id].angle = saved.angle;
    if ([45, 60].includes(saved.center)) next.drafts[b.id].center = saved.center;
  }
  return next;
}
