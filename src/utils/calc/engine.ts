// src/utils/calc/engine.ts
import { ftToIn } from "./measure";

export type Op = "+" | "-" | "*" | "/";

export type Token =
  | { kind: "number"; value: number; display?: string }
  | { kind: "measure"; inches: number; display?: string }
  | { kind: "op"; op: Op };

export type CalcKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "×"
  | "÷"
  | "="
  | "C"
  | "⌫"
  | "FT"
  | "IN"
  | "FRAC";

export type CalcResult =
  | { kind: "number"; value: number }
  | { kind: "measure"; inches: number };

export type CalcMode = "number" | "measure";

export type CalcState = {
  tokens: Token[];
  buffer: string;
  mode: CalcMode;
  lastResult: CalcResult | null;
  lastExpression: string;
  error: string | null;
};

export function createInitialCalcState(): CalcState {
  return {
    tokens: [],
    buffer: "",
    mode: "number",
    lastResult: null,
    lastExpression: "",
    error: null,
  };
}

function opFromKey(k: CalcKey): Op | null {
  if (k === "+") return "+";
  if (k === "-") return "-";
  if (k === "×") return "*";
  if (k === "÷") return "/";
  return null;
}

function isDigitKey(k: CalcKey): boolean {
  return k >= "0" && k <= "9";
}

function formatNumberForToken(n: number, maxDecimals = 6): string {
  if (!Number.isFinite(n)) return "0";

  const factor = Math.pow(10, maxDecimals);
  const rounded =
    Math.round((n + Math.sign(n) * Number.EPSILON) * factor) / factor;

  if (Object.is(rounded, -0)) return "0";

  return rounded.toFixed(maxDecimals).replace(/\.?0+$/, "");
}

function parseBufferNumber(buffer: string): number | null {
  const b = buffer.trim();

  if (b.length === 0 || b === ".") return null;

  // Normal number input.
  // Examples: 5, 10.44, 0.9375
  const normalNumber = Number(b);

  if (Number.isFinite(normalNumber)) {
    return normalNumber;
  }

  // Fraction or mixed fraction input.
  // Examples:
  // 15/16
  // 5 15/16
  // 12/8
  const fractionMatch = b.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);

  if (!fractionMatch) return null;

  const wholeRaw = fractionMatch[1];
  const numeratorRaw = fractionMatch[2];
  const denominatorRaw = fractionMatch[3];

  const whole = wholeRaw ? Number(wholeRaw) : 0;
  const numerator = Number(numeratorRaw);
  const denominator = Number(denominatorRaw);

  if (
    !Number.isFinite(whole) ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return null;
  }

  return whole + numerator / denominator;
}

function replaceTrailingOp(tokens: Token[], op: Op): Token[] {
  if (tokens.length === 0) return tokens;

  const last = tokens[tokens.length - 1];

  if (last.kind === "op") {
    return [...tokens.slice(0, -1), { kind: "op", op }];
  }

  return tokens;
}

function formatOpToken(op: Op): string {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op;
}

function formatToken(t: Token): string {
  if (t.kind === "op") return formatOpToken(t.op);
  if (t.display) return t.display;

  if (t.kind === "number") {
    return formatNumberForToken(t.value);
  }

  return `${formatNumberForToken(t.inches)}in`;
}

export function getExpressionString(state: CalcState): string {
  if (
    state.tokens.length === 0 &&
    state.buffer.length === 0 &&
    state.lastResult &&
    state.lastExpression.length > 0
  ) {
    return state.lastExpression;
  }

  const parts: string[] = [];

  for (const t of state.tokens) {
    parts.push(formatToken(t));
  }

  if (state.buffer.length > 0) {
    parts.push(state.buffer);
  }

  return parts.join(" ");
}

function commitBufferDefault(state: CalcState): CalcState {
  const n = parseBufferNumber(state.buffer);

  if (n === null) return state;

  const display = state.buffer.trim();

  if (state.mode === "number") {
    return {
      ...state,
      tokens: [
        ...state.tokens,
        {
          kind: "number",
          value: n,
          display,
        },
      ],
      buffer: "",
    };
  }

  const last = state.tokens[state.tokens.length - 1];

  if (last && last.kind === "measure") {
    const mergedInches = last.inches + n;
    const lastDisplay =
      last.display ?? `${formatNumberForToken(last.inches)}in`;

    const mergedDisplay = lastDisplay.endsWith("ft")
      ? `${lastDisplay} ${display}in`
      : `${lastDisplay} + ${display}in`;

    const nextTokens: Token[] = [
      ...state.tokens.slice(0, -1),
      {
        kind: "measure",
        inches: mergedInches,
        display: mergedDisplay,
      },
    ];

    return {
      ...state,
      tokens: nextTokens,
      buffer: "",
    };
  }

  return {
    ...state,
    tokens: [
      ...state.tokens,
      {
        kind: "measure",
        inches: n,
        display: `${display}in`,
      },
    ],
    buffer: "",
  };
}

function commitBufferAsUnit(state: CalcState, unit: "ft" | "in"): CalcState {
  const n = parseBufferNumber(state.buffer);

  if (n === null) return state;

  const display = state.buffer.trim();
  const nextMode: CalcMode = "measure";

  if (unit === "ft") {
    const inches = ftToIn(n);

    return {
      ...state,
      mode: nextMode,
      tokens: [
        ...state.tokens,
        {
          kind: "measure",
          inches,
          display: `${display}ft`,
        },
      ],
      buffer: "",
    };
  }

  const last = state.tokens[state.tokens.length - 1];

  if (last && last.kind === "measure") {
    const mergedInches = last.inches + n;
    const lastDisplay =
      last.display ?? `${formatNumberForToken(last.inches)}in`;

    const mergedDisplay = lastDisplay.endsWith("ft")
      ? `${lastDisplay} ${display}in`
      : `${lastDisplay} + ${display}in`;

    const nextTokens: Token[] = [
      ...state.tokens.slice(0, -1),
      {
        kind: "measure",
        inches: mergedInches,
        display: mergedDisplay,
      },
    ];

    return {
      ...state,
      mode: nextMode,
      tokens: nextTokens,
      buffer: "",
    };
  }

  return {
    ...state,
    mode: nextMode,
    tokens: [
      ...state.tokens,
      {
        kind: "measure",
        inches: n,
        display: `${display}in`,
      },
    ],
    buffer: "",
  };
}

export function evaluateTokens(tokens: Token[]): {
  result: CalcResult | null;
  error: string | null;
} {
  if (tokens.length === 0) {
    return {
      result: null,
      error: null,
    };
  }

  const hasExplicitMeasure = tokens.some((t) => t.kind === "measure");

  const hasFractionInput = tokens.some(
    (t) =>
      t.kind === "number" &&
      typeof t.display === "string" &&
      t.display.includes("/"),
  );

  // Field calculator behavior:
  // - If the expression has FT/IN, it is measurement math.
  // - If the expression has fractions, assume inches even if IN was forgotten.
  //
  // Example:
  // 5 11/16 - 4 1/8 =
  // should return:
  // 1 9/16"
  const isMeasureExpr = hasExplicitMeasure || hasFractionInput;

  const values: number[] = [];
  const ops: Op[] = [];

  function precedence(op: Op): number {
    return op === "*" || op === "/" ? 2 : 1;
  }

  function applyOp() {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();

    if (op === undefined || a === undefined || b === undefined) {
      throw new Error("Invalid expression");
    }

    if (op === "+") values.push(a + b);
    if (op === "-") values.push(a - b);
    if (op === "*") values.push(a * b);

    if (op === "/") {
      if (b === 0) throw new Error("Divide by zero");
      values.push(a / b);
    }
  }

  try {
    for (const t of tokens) {
      if (t.kind === "op") {
        while (
          ops.length > 0 &&
          precedence(ops[ops.length - 1]) >= precedence(t.op)
        ) {
          applyOp();
        }

        ops.push(t.op);
      } else {
        if (t.kind === "measure") {
          values.push(t.inches);
        } else {
          // If this is measurement-style math, bare numbers/fractions
          // are treated as inches.
          values.push(t.value);
        }
      }
    }

    while (ops.length > 0) {
      applyOp();
    }

    const out = values.pop();

    if (out === undefined || !Number.isFinite(out)) {
      return {
        result: null,
        error: "Invalid result",
      };
    }

    if (isMeasureExpr) {
      return {
        result: {
          kind: "measure",
          inches: out,
        },
        error: null,
      };
    }

    return {
      result: {
        kind: "number",
        value: out,
      },
      error: null,
    };
  } catch (e: any) {
    return {
      result: null,
      error: e?.message ?? "Error",
    };
  }
}

function ensureStartFromLastResult(state: CalcState): CalcState {
  if (!state.lastResult) return state;
  if (state.tokens.length > 0) return state;
  if (state.buffer.length > 0) return state;

  if (state.lastResult.kind === "number") {
    return {
      ...state,
      mode: "number",
      tokens: [
        {
          kind: "number",
          value: state.lastResult.value,
          display: formatNumberForToken(state.lastResult.value),
        },
      ],
    };
  }

  return {
    ...state,
    mode: "measure",
    tokens: [
      {
        kind: "measure",
        inches: state.lastResult.inches,
        display: `${formatNumberForToken(state.lastResult.inches)}in`,
      },
    ],
  };
}

export function pressKey(prev: CalcState, key: CalcKey): CalcState {
  let state: CalcState = prev.error ? { ...prev, error: null } : prev;

  if (key === "C") {
    return createInitialCalcState();
  }

  if (key === "⌫") {
    if (state.buffer.length > 0) {
      return {
        ...state,
        buffer: state.buffer.slice(0, -1),
      };
    }

    if (state.tokens.length > 0) {
      return {
        ...state,
        tokens: state.tokens.slice(0, -1),
      };
    }

    return state;
  }

  if (key === "FRAC") {
    return state;
  }

  if (isDigitKey(key)) {
    if (state.lastResult && state.tokens.length === 0 && state.buffer === "") {
      state = createInitialCalcState();
    }

    return {
      ...state,
      buffer: state.buffer + key,
    };
  }

  if (key === ".") {
    if (state.lastResult && state.tokens.length === 0 && state.buffer === "") {
      state = createInitialCalcState();
    }

    if (state.buffer.includes(".")) {
      return state;
    }

    return {
      ...state,
      buffer: state.buffer.length === 0 ? "0." : state.buffer + ".",
    };
  }

  if (key === "FT") {
    const next = commitBufferAsUnit(state, "ft");

    if (next === state) {
      return {
        ...state,
        error: "Enter a number first",
      };
    }

    return next;
  }

  if (key === "IN") {
    const next = commitBufferAsUnit(state, "in");

    if (next === state) {
      return {
        ...state,
        error: "Enter a number first",
      };
    }

    return next;
  }

  const op = opFromKey(key);

  if (op) {
    state = ensureStartFromLastResult(state);
    state = commitBufferDefault(state);

    if (state.tokens.length === 0) {
      return {
        ...state,
        error: "Start with a number",
      };
    }

    const replaced: Token[] = replaceTrailingOp(state.tokens, op);
    const last = replaced[replaced.length - 1];

    const finalTokens: Token[] =
      last.kind !== "op" ? [...replaced, { kind: "op", op }] : replaced;

    return {
      ...state,
      tokens: finalTokens,
    };
  }

  if (key === "=") {
    state = ensureStartFromLastResult(state);
    state = commitBufferDefault(state);

    if (state.tokens.length === 0) {
      return state;
    }

    const last = state.tokens[state.tokens.length - 1];

    if (last.kind === "op") {
      return {
        ...state,
        error: "Expression incomplete",
      };
    }

    const expressionBeforeResult = getExpressionString(state);
    const res = evaluateTokens(state.tokens);

    if (res.error || !res.result) {
      return {
        ...state,
        error: res.error ?? "Error",
      };
    }

    return {
      tokens: [],
      buffer: "",
      mode: res.result.kind === "measure" ? "measure" : "number",
      lastResult: res.result,
      lastExpression: expressionBeforeResult,
      error: null,
    };
  }

  return state;
}
