import assert from "node:assert/strict";
import test from "node:test";
import { createInitialCalcState, pressKey, type CalcKey } from "./engine";
import { parseSmartExpression } from "./parser";
import { calculateConduitFill, getMaxAdditionalConductors } from "../conduitFill/conduitFill";

test("keypad and typed entry agree on measurement scaling and continuation", () => {
  for (const [keys, input, expected] of [
    [["2", "FT", "×", "3", "="], "2ft * 3", 72],
    [["2", "FT", "÷", "2", "="], "2ft ÷ 2", 12],
    [["2", "×", "3", "FT", "="], "2 * 3ft", 72],
    [["2", "FT", "+", "3", "FT", "×", "2", "="], "2ft + 3ft * 2", 96],
    [["2", "FT", "=", "×", "3", "="], "2ft * 3", 72],
  ] as [CalcKey[], string, number][]) {
    const keypad = keys.reduce(pressKey, createInitialCalcState());
    const typed = parseSmartExpression(input);
    assert.equal(keypad.error, null, input);
    assert.deepEqual(keypad.lastResult, { kind: "measure", inches: expected });
    assert.ok(typed.ok, input);
    if (typed.ok) assert.deepEqual(typed.result, keypad.lastResult);
  }
});
test("fraction multipliers and signed zero feet keep their intended values", () => {
  for (const [input, expected] of [["2ft * 1/2", 12], ["1/2 * 2ft", 12], ["-0ft 6in", -6], ["-0' 1/2\"", -0.5]] as const) {
    const parsed = parseSmartExpression(input);
    assert.ok(parsed.ok, input);
    if (parsed.ok) assert.deepEqual(parsed.result, { kind: "measure", inches: expected });
  }
  for (const input of ["2ft * 3ft", "2 ÷ 1ft", "2ft ÷ 0"]) assert.equal(parseSmartExpression(input).ok, false);
});
test("invalid buffered input cannot silently calculate an earlier value", () => {
  const state = ["2", "FT"].reduce((s, k) => pressKey(s, k as CalcKey), createInitialCalcState());
  assert.ok(pressKey({ ...state, buffer: "1/2." }, "=").error);
});
test("additional-conductor search checks the two-to-three allowance transition", () => {
  const wires = [{ size: "1" as const, quantity: 1 }];
  assert.equal(getMaxAdditionalConductors("emt", "3/4", wires, "14"), 5);
  assert.equal(calculateConduitFill("emt", "3/4", [...wires, { size: "14", quantity: 5 }]).fits, true);
  assert.equal(calculateConduitFill("emt", "3/4", [...wires, { size: "14", quantity: 6 }]).fits, false);
});
