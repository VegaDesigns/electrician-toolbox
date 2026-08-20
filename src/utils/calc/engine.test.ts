import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateTokens, type Token } from "./engine";

describe("calculator engine safety", () => {
  it("uses standard arithmetic precedence", () => {
    const tokens: Token[] = [
      { kind: "number", value: 2 },
      { kind: "op", op: "+" },
      { kind: "number", value: 3 },
      { kind: "op", op: "*" },
      { kind: "number", value: 4 },
    ];

    assert.deepEqual(evaluateTokens(tokens), {
      result: { kind: "number", value: 14 },
      error: null,
    });
  });

  it("rejects adjacent values instead of silently dropping one", () => {
    const parsed = evaluateTokens([
      { kind: "number", value: 2 },
      { kind: "number", value: 3 },
    ]);

    assert.equal(parsed.result, null);
    assert.equal(parsed.error, "Add an operator between values");
  });

  it("rejects division by zero", () => {
    const parsed = evaluateTokens([
      { kind: "number", value: 2 },
      { kind: "op", op: "/" },
      { kind: "number", value: 0 },
    ]);

    assert.equal(parsed.result, null);
    assert.equal(parsed.error, "Divide by zero");
  });

  it("allows scaling one measurement but rejects dimensional ambiguity", () => {
    const scaled = evaluateTokens([
      { kind: "measure", inches: 24 },
      { kind: "op", op: "/" },
      { kind: "number", value: 2 },
    ]);
    assert.deepEqual(scaled, {
      result: { kind: "measure", inches: 12 },
      error: null,
    });

    const ambiguous = evaluateTokens([
      { kind: "measure", inches: 24 },
      { kind: "op", op: "/" },
      { kind: "measure", inches: 12 },
    ]);
    assert.equal(ambiguous.result, null);
    assert.match(ambiguous.error ?? "", /plain number/);
  });
});
