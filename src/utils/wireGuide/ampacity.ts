export type ConductorMaterial = "copper" | "aluminum";
export type LugRating = "unknown" | "60" | "75" | "90";

export type CopperWireSize =
  | "14" | "12" | "10" | "8" | "6" | "4" | "3" | "2" | "1"
  | "1/0" | "2/0" | "3/0" | "4/0" | "250" | "300" | "350"
  | "400" | "500" | "600" | "700" | "750" | "800" | "900" | "1000";

export type AluminumWireSize = Exclude<CopperWireSize, "14">;
export type WireSize = CopperWireSize;

export type AmbientBand =
  | "50-or-less" | "51-59" | "60-68" | "69-77" | "78-86"
  | "87-95" | "96-104" | "105-113" | "114-122" | "123-131"
  | "132-140" | "141-149" | "150-158" | "159-167" | "168-176"
  | "177-185";

export type ConductorCountBand =
  | "1-3" | "4-6" | "7-9" | "10-20" | "21-30" | "31-40" | "41+";

export type AmpacityRow = {
  size: WireSize;
  c60: number;
  c75: number;
  c90: number;
};

export type AmpacityConditions = {
  ambientBand: AmbientBand;
  conductorCountBand: ConductorCountBand;
  lugRating: LugRating;
};

export type LimitingReason = "small-wire" | "termination" | "ambient" | "grouping";

export type AmpacityResult = {
  adjustedAmpacity: number;
  ambientFactor: number;
  baseAmpacity: number;
  conductorFactor: number;
  effectiveLugRating: "60" | "75" | "90";
  finalAmpacity: number;
  limitingReasons: LimitingReason[];
  row: AmpacityRow;
  smallWireLimit: number | null;
  terminationLimit: number;
};

export const DEFAULT_AMPACITY_CONDITIONS: AmpacityConditions = {
  ambientBand: "78-86",
  conductorCountBand: "1-3",
  lugRating: "unknown",
};

export const COPPER_AMPACITY: AmpacityRow[] = [
  { size: "14", c60: 15, c75: 20, c90: 25 },
  { size: "12", c60: 20, c75: 25, c90: 30 },
  { size: "10", c60: 30, c75: 35, c90: 40 },
  { size: "8", c60: 40, c75: 50, c90: 55 },
  { size: "6", c60: 55, c75: 65, c90: 75 },
  { size: "4", c60: 70, c75: 85, c90: 95 },
  { size: "3", c60: 85, c75: 100, c90: 115 },
  { size: "2", c60: 95, c75: 115, c90: 130 },
  { size: "1", c60: 110, c75: 130, c90: 145 },
  { size: "1/0", c60: 125, c75: 150, c90: 170 },
  { size: "2/0", c60: 145, c75: 175, c90: 195 },
  { size: "3/0", c60: 165, c75: 200, c90: 225 },
  { size: "4/0", c60: 195, c75: 230, c90: 260 },
  { size: "250", c60: 215, c75: 255, c90: 290 },
  { size: "300", c60: 240, c75: 285, c90: 320 },
  { size: "350", c60: 260, c75: 310, c90: 350 },
  { size: "400", c60: 280, c75: 335, c90: 380 },
  { size: "500", c60: 320, c75: 380, c90: 430 },
  { size: "600", c60: 350, c75: 420, c90: 475 },
  { size: "700", c60: 385, c75: 460, c90: 520 },
  { size: "750", c60: 400, c75: 475, c90: 535 },
  { size: "800", c60: 410, c75: 490, c90: 555 },
  { size: "900", c60: 435, c75: 520, c90: 585 },
  { size: "1000", c60: 455, c75: 545, c90: 615 },
];

export const ALUMINUM_AMPACITY: AmpacityRow[] = [
  { size: "12", c60: 15, c75: 20, c90: 25 },
  { size: "10", c60: 25, c75: 30, c90: 35 },
  { size: "8", c60: 35, c75: 40, c90: 45 },
  { size: "6", c60: 40, c75: 50, c90: 55 },
  { size: "4", c60: 55, c75: 65, c90: 75 },
  { size: "3", c60: 65, c75: 75, c90: 85 },
  { size: "2", c60: 75, c75: 90, c90: 100 },
  { size: "1", c60: 85, c75: 100, c90: 115 },
  { size: "1/0", c60: 100, c75: 120, c90: 135 },
  { size: "2/0", c60: 115, c75: 135, c90: 150 },
  { size: "3/0", c60: 130, c75: 155, c90: 175 },
  { size: "4/0", c60: 150, c75: 180, c90: 205 },
  { size: "250", c60: 170, c75: 205, c90: 230 },
  { size: "300", c60: 190, c75: 230, c90: 260 },
  { size: "350", c60: 210, c75: 250, c90: 280 },
  { size: "400", c60: 225, c75: 270, c90: 305 },
  { size: "500", c60: 260, c75: 310, c90: 350 },
  { size: "600", c60: 285, c75: 340, c90: 385 },
  { size: "700", c60: 310, c75: 375, c90: 425 },
  { size: "750", c60: 320, c75: 385, c90: 435 },
  { size: "800", c60: 330, c75: 395, c90: 445 },
  { size: "900", c60: 355, c75: 425, c90: 480 },
  { size: "1000", c60: 375, c75: 445, c90: 500 },
];

export const AMBIENT_OPTIONS: { factor90: number; id: AmbientBand; label: string }[] = [
  { id: "50-or-less", label: "50°F or less", factor90: 1.15 },
  { id: "51-59", label: "51–59°F", factor90: 1.12 },
  { id: "60-68", label: "60–68°F", factor90: 1.08 },
  { id: "69-77", label: "69–77°F", factor90: 1.04 },
  { id: "78-86", label: "78–86°F", factor90: 1 },
  { id: "87-95", label: "87–95°F", factor90: 0.96 },
  { id: "96-104", label: "96–104°F", factor90: 0.91 },
  { id: "105-113", label: "105–113°F", factor90: 0.87 },
  { id: "114-122", label: "114–122°F", factor90: 0.82 },
  { id: "123-131", label: "123–131°F", factor90: 0.76 },
  { id: "132-140", label: "132–140°F", factor90: 0.71 },
  { id: "141-149", label: "141–149°F", factor90: 0.65 },
  { id: "150-158", label: "150–158°F", factor90: 0.58 },
  { id: "159-167", label: "159–167°F", factor90: 0.5 },
  { id: "168-176", label: "168–176°F", factor90: 0.41 },
  { id: "177-185", label: "177–185°F", factor90: 0.29 },
];

export const CONDUCTOR_COUNT_OPTIONS: { factor: number; id: ConductorCountBand; label: string }[] = [
  { id: "1-3", label: "1–3", factor: 1 },
  { id: "4-6", label: "4–6", factor: 0.8 },
  { id: "7-9", label: "7–9", factor: 0.7 },
  { id: "10-20", label: "10–20", factor: 0.5 },
  { id: "21-30", label: "21–30", factor: 0.45 },
  { id: "31-40", label: "31–40", factor: 0.4 },
  { id: "41+", label: "41+", factor: 0.35 },
];

export function getAmpacityRows(material: ConductorMaterial): AmpacityRow[] {
  return material === "copper" ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
}

export function formatWireSize(size: WireSize): string {
  return Number(size) >= 250 ? `${size} kcmil` : `#${size}`;
}

export function resolveLugRating(size: WireSize, rating: LugRating): "60" | "75" | "90" {
  if (rating !== "unknown") return rating;
  return ["1/0", "2/0", "3/0", "4/0", "250", "300", "350", "400", "500", "600", "700", "750", "800", "900", "1000"].includes(size)
    ? "75"
    : "60";
}

export function getSmallWireLimit(material: ConductorMaterial, size: WireSize): number | null {
  if (material === "copper") {
    if (size === "14") return 15;
    if (size === "12") return 20;
    if (size === "10") return 30;
  }
  if (material === "aluminum") {
    if (size === "12") return 15;
    if (size === "10") return 25;
  }
  return null;
}

export function calculateAmpacity(
  material: ConductorMaterial,
  size: WireSize,
  conditions: AmpacityConditions,
): AmpacityResult {
  const row = getAmpacityRows(material).find((candidate) => candidate.size === size);
  if (!row) throw new Error(`${formatWireSize(size)} is not available for ${material}.`);

  const ambientFactor = AMBIENT_OPTIONS.find(({ id }) => id === conditions.ambientBand)?.factor90 ?? 1;
  const conductorFactor = CONDUCTOR_COUNT_OPTIONS.find(({ id }) => id === conditions.conductorCountBand)?.factor ?? 1;
  const effectiveLugRating = resolveLugRating(size, conditions.lugRating);
  const terminationLimit = effectiveLugRating === "60" ? row.c60 : effectiveLugRating === "75" ? row.c75 : row.c90;
  const smallWireLimit = getSmallWireLimit(material, size);
  const adjustedAmpacity = row.c90 * ambientFactor * conductorFactor;
  const finalRaw = Math.min(adjustedAmpacity, terminationLimit, smallWireLimit ?? Number.POSITIVE_INFINITY);
  const limitingReasons: LimitingReason[] = [];
  const near = (value: number) => Math.abs(value - finalRaw) < 0.0001;

  if (smallWireLimit !== null && near(smallWireLimit)) limitingReasons.push("small-wire");
  if (near(terminationLimit) && !limitingReasons.includes("small-wire")) limitingReasons.push("termination");
  if (ambientFactor < 1 && near(adjustedAmpacity)) limitingReasons.push("ambient");
  if (conductorFactor < 1 && near(adjustedAmpacity)) limitingReasons.push("grouping");

  return {
    adjustedAmpacity,
    ambientFactor,
    baseAmpacity: row.c90,
    conductorFactor,
    effectiveLugRating,
    finalAmpacity: Math.floor(finalRaw + 1e-9),
    limitingReasons,
    row,
    smallWireLimit,
    terminationLimit,
  };
}
