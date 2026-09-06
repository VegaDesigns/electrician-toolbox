import type { CalcResult } from "./engine";

export type PreferredResultFormat = "standard" | "ft-in" | "rounded-in";

const FEET_INTENT = /(?:(?:ft|feet|foot)\b|['′’])/i;
const INCH_INTENT = /(?:(?:in|inch|inches)\b|["″“”])/i;
const FRACTION_INTENT = /(?:^|\s)\d+(?:\s+\d+)?\s*\/\s*\d+(?:\s|$)/;

export function inferPreferredResultFormat(
  expression: string,
  resultKind: CalcResult["kind"],
): PreferredResultFormat {
  if (resultKind === "number") return "standard";
  if (FEET_INTENT.test(expression)) return "ft-in";
  if (INCH_INTENT.test(expression) || FRACTION_INTENT.test(expression)) {
    return "rounded-in";
  }
  return "ft-in";
}

export function shouldShowInterpretation(
  expression: string,
  cleanedExpression: string,
  resultKind: CalcResult["kind"],
): boolean {
  const original = expression.trim();
  const cleaned = cleanedExpression.trim();

  if (resultKind !== "measure" || !cleaned || original === cleaned) {
    return false;
  }

  const usesConversationalFraction =
    /\band\b/i.test(original) ||
    /\d+\s*\/\s*\d+(?:st|nd|rd|th)\b/i.test(original);
  const containsFraction = /\d+\s*\/\s*\d+/.test(original);
  const containsExplicitUnit =
    /(?:(?:ft|feet|foot|in|inch|inches)\b|['"′’″“”])/i.test(original);

  return usesConversationalFraction ||
    (containsFraction && !containsExplicitUnit);
}

export function shouldOfferUnitToggle(result: CalcResult | null): boolean {
  return result?.kind === "measure" && Math.abs(result.inches) >= 12;
}
