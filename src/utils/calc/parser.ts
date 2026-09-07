import { evaluateTokens, type CalcResult, type Op, type Token } from "./engine";

export type SmartParseSuccess = {
  ok: true;
  cleaned: string;
  result: CalcResult;
  tokens: Token[];
};

export type SmartParseFailure = {
  ok: false;
  error: string;
};

export type SmartParseResult = SmartParseSuccess | SmartParseFailure;

const NUMBER_SOURCE = String.raw`[+-]?(?:(?:\d+\s+)?\d+\/\d+|(?:\d+(?:\.\d*)?|\.\d+))`;
const FEET_PATTERN = new RegExp(
  `^(${NUMBER_SOURCE})\\s*(?:ft|')\\s*(?:(${NUMBER_SOURCE})\\s*(?:in|\")?)?$`,
  "i",
);
const INCHES_PATTERN = new RegExp(`^(${NUMBER_SOURCE})\\s*(?:in|\")$`, "i");

export function parseSmartExpression(input: string): SmartParseResult {
  const normalized = normalizeSmartInput(input);

  if (!normalized) {
    return { ok: false, error: "Enter a measurement or calculation" };
  }

  const split = splitExpression(normalized);

  if (!split.ok) return split;

  const tokens: Token[] = [];
  const cleanedParts: string[] = [];

  for (const part of split.parts) {
    if (part.kind === "op") {
      tokens.push({ kind: "op", op: part.op });
      cleanedParts.push(formatOperator(part.op));
      continue;
    }

    const parsed = parseLiteral(part.value);

    if (!parsed) {
      return {
        ok: false,
        error: `Could not understand “${part.value.trim()}”`,
      };
    }

    tokens.push(parsed.token);
    cleanedParts.push(parsed.cleaned);
  }

  const evaluated = evaluateTokens(tokens);

  if (!evaluated.result || evaluated.error) {
    return {
      ok: false,
      error: evaluated.error ?? "Could not calculate that expression",
    };
  }

  return {
    ok: true,
    cleaned: cleanedParts.join(" "),
    result: evaluated.result,
    tokens,
  };
}

export function normalizeSmartInput(input: string): string {
  return input
    .trim()
    .replace(/[′’]/g, "'")
    .replace(/[″“”]/g, '"')
    .replace(/\b(feet|foot)\b/gi, "ft")
    .replace(/\b(inches|inch)\b/gi, "in")
    .replace(/(\d+\s*\/\s*\d+)(?:st|nd|rd|th)\b/gi, "$1")
    .replace(/\band\b/gi, " ")
    .replace(/\s+\/\s+/g, " ÷ ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

type ExpressionPart =
  | { kind: "value"; value: string }
  | { kind: "op"; op: Op };

function splitExpression(
  input: string,
): { ok: true; parts: ExpressionPart[] } | SmartParseFailure {
  const parts: ExpressionPart[] = [];
  let buffer = "";
  let expectingValue = true;

  function flushValue(): boolean {
    const value = buffer.trim();
    buffer = "";

    if (!value) return false;

    parts.push({ kind: "value", value });
    expectingValue = false;
    return true;
  }

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const isMinus = char === "-";
    const isBasicOperator = char === "+" || char === "*" || char === "×" || char === "÷";

    if (isMinus && expectingValue && !buffer.trim()) {
      buffer += char;
      continue;
    }

    if (isBasicOperator || isMinus) {
      if (!flushValue()) {
        return { ok: false, error: "Check the operators in that calculation" };
      }

      parts.push({ kind: "op", op: toOperator(char) });
      expectingValue = true;
      continue;
    }

    buffer += char;
  }

  if (!flushValue()) {
    return { ok: false, error: "Finish the calculation after the operator" };
  }

  return { ok: true, parts };
}

function parseLiteral(
  value: string,
): { token: Token; cleaned: string } | null {
  const literal = value.trim();
  const feetMatch = literal.match(FEET_PATTERN);

  if (feetMatch) {
    const feet = parseFlexibleNumber(feetMatch[1]);
    const inches = feetMatch[2] ? parseFlexibleNumber(feetMatch[2]) : 0;

    if (feet === null || inches === null) return null;

    const sign = feet < 0 ? -1 : 1;
    const totalInches = feet * 12 + sign * Math.abs(inches);
    const cleaned = formatCanonicalMeasurement(totalInches);

    return {
      token: { kind: "measure", inches: totalInches, display: cleaned },
      cleaned,
    };
  }

  const inchesMatch = literal.match(INCHES_PATTERN);

  if (inchesMatch) {
    const inches = parseFlexibleNumber(inchesMatch[1]);

    if (inches === null) return null;

    const cleaned = formatCanonicalMeasurement(inches);
    return {
      token: { kind: "measure", inches, display: cleaned },
      cleaned,
    };
  }

  const bare = parseFlexibleNumber(literal);

  if (bare === null) return null;

  if (literal.includes("/")) {
    const cleaned = formatCanonicalMeasurement(bare);
    return {
      token: { kind: "measure", inches: bare, display: cleaned },
      cleaned,
    };
  }

  const cleaned = formatDecimal(bare);
  return {
    token: { kind: "number", value: bare, display: cleaned },
    cleaned,
  };
}

export function parseFlexibleNumber(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) return null;

  const decimal = Number(normalized);
  if (Number.isFinite(decimal)) return decimal;

  const fraction = normalized.match(/^([+-])?(?:(\d+)\s+)?(\d+)\/(\d+)$/);

  if (!fraction) return null;

  const sign = fraction[1] === "-" ? -1 : 1;
  const whole = fraction[2] ? Number(fraction[2]) : 0;
  const numerator = Number(fraction[3]);
  const denominator = Number(fraction[4]);

  if (denominator === 0) return null;

  return sign * (whole + numerator / denominator);
}

export function formatCanonicalMeasurement(totalInches: number): string {
  if (!Number.isFinite(totalInches)) return '--';

  const sign = totalInches < 0 ? "-" : "";
  const units = Math.round(Math.abs(totalInches) * 64);
  // Interpretation describes the input, not a second rounded answer.
  if (Math.abs(units / 64 - Math.abs(totalInches)) > 1e-9) {
    return `${formatDecimal(totalInches)}"`;
  }
  const unitsPerFoot = 12 * 64;
  const feet = Math.floor(units / unitsPerFoot);
  const remaining = units - feet * unitsPerFoot;
  const wholeInches = Math.floor(remaining / 64);
  const fractionUnits = remaining - wholeInches * 64;
  const inchParts: string[] = [];

  if (wholeInches) inchParts.push(String(wholeInches));

  if (fractionUnits) {
    const divisor = greatestCommonDivisor(fractionUnits, 64);
    inchParts.push(`${fractionUnits / divisor}/${64 / divisor}`);
  }

  if (feet === 0 && inchParts.length === 0) return '0"';
  if (feet === 0) return `${sign}${inchParts.join(" ")}"`;
  if (inchParts.length === 0) return `${sign}${feet}'`;
  return `${sign}${feet}' ${inchParts.join(" ")}"`;
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y) {
    const next = y;
    y = x % y;
    x = next;
  }

  return x || 1;
}

function formatDecimal(value: number): string {
  return Number(value.toFixed(8)).toString();
}

function toOperator(value: string): Op {
  if (value === "*" || value === "×") return "*";
  if (value === "÷") return "/";
  return value as Op;
}

function formatOperator(op: Op): string {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op;
}
