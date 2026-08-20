import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseSmartExpression } from "./parser";

function expectMeasure(input: string, inches: number, cleaned?: string) {
  const parsed = parseSmartExpression(input);
  assert.equal(parsed.ok, true, input);

  if (!parsed.ok) return;

  assert.equal(parsed.result.kind, "measure", input);
  if (parsed.result.kind !== "measure") return;

  assert.ok(Math.abs(parsed.result.inches - inches) < 1e-9, input);
  if (cleaned) assert.equal(parsed.cleaned, cleaned, input);
}

describe("smart measurement parser", () => {
  it("normalizes the game-plan input examples", () => {
    expectMeasure('48"', 48, "4'");
    expectMeasure("1.5ft", 18, `1' 6"`);
    expectMeasure(`1' 6"`, 18, `1' 6"`);
    expectMeasure(`5 4/8"`, 5.5, `5 1/2"`);
    expectMeasure("5 and 4/8th", 5.5, `5 1/2"`);
    expectMeasure("12/8", 1.5, `1 1/2"`);
  });

  it("supports measurement arithmetic", () => {
    expectMeasure(`1' 6" + 5 1/2"`, 23.5, `1' 6" + 5 1/2"`);
    expectMeasure(`4' - 2' 3"`, 21, `4' - 2' 3"`);
  });

  it("supports scalar arithmetic", () => {
    const parsed = parseSmartExpression("2 * 3 + 1");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.result, { kind: "number", value: 7 });
  });

  it("rejects invalid or unsafe input", () => {
    assert.equal(parseSmartExpression("").ok, false);
    assert.equal(parseSmartExpression("5 / 0").ok, false);
    assert.equal(parseSmartExpression("banana").ok, false);
    assert.equal(parseSmartExpression("1 +").ok, false);
  });
});
