// src/utils/calc/measure.ts
export type Precision = 2 | 4 | 8 | 16;

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x || 1;
}

export function reduceFraction(
  num: number,
  den: number,
): { num: number; den: number } {
  if (den === 0) return { num, den };
  if (num === 0) return { num: 0, den: 1 };

  const d = gcd(num, den);
  return { num: num / d, den: den / d };
}

/** Convert feet to inches */
export function ftToIn(ft: number): number {
  return ft * 12;
}

/** Convert inches to feet */
export function inToFt(inches: number): number {
  return inches / 12;
}

/** Round inches to chosen fraction precision, nearest or always-up. */
export function roundInches(
  inches: number,
  precision: Precision,
  mode: "nearest" | "up" = "nearest",
): number {
  if (!Number.isFinite(inches)) return NaN;

  const scaled = inches * precision;
  const rounded =
    mode === "up" ? Math.ceil(scaled - 1e-12) : Math.round(scaled);

  return rounded / precision;
}

/**
 * Format inches into a clean field measurement.
 *
 * Examples:
 * 10.44"  -> 10 7/16"
 * 13"     -> 1' 1"
 * 12"     -> 1'
 * 24.5"   -> 2' 1/2"
 * 0.5"    -> 1/2"
 */
export function formatFeetInches(
  totalInches: number,
  precision: Precision,
): string {
  if (!Number.isFinite(totalInches)) return "--";

  const sign = totalInches < 0 ? "-" : "";
  const absIn = Math.abs(totalInches);

  // Convert to precision units to avoid floating point display issues.
  const totalUnits = Math.round(absIn * precision);

  const unitsPerFoot = 12 * precision;

  const feet = Math.floor(totalUnits / unitsPerFoot);
  const remainingUnitsAfterFeet = totalUnits - feet * unitsPerFoot;

  const wholeInches = Math.floor(remainingUnitsAfterFeet / precision);
  const fractionUnits = remainingUnitsAfterFeet - wholeInches * precision;

  const inchParts: string[] = [];

  if (wholeInches > 0) {
    inchParts.push(String(wholeInches));
  }

  if (fractionUnits > 0) {
    const reduced = reduceFraction(fractionUnits, precision);
    inchParts.push(`${reduced.num}/${reduced.den}`);
  }

  const inchesText = inchParts.join(" ");

  // Exact zero.
  if (feet === 0 && inchesText.length === 0) {
    return '0"';
  }

  // Less than 12 inches: hide 0'.
  if (feet === 0) {
    return `${sign}${inchesText}"`;
  }

  // Exact feet.
  // Example: 12" -> 1'
  if (inchesText.length === 0) {
    return `${sign}${feet}'`;
  }

  // Feet plus inches.
  // Example: 13" -> 1' 1"
  return `${sign}${feet}' ${inchesText}"`;
}
