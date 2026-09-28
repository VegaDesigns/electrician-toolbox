import assert from "node:assert/strict";
import test from "node:test";
import { editEquationFraction, editEquationKey, replaceSelection, type EquationEdit } from "./equationEdit";
import { parseSmartExpression } from "./parser";

const at = (text: string, start: number, end = start): EquationEdit => ({ text, selection: { start, end } });

test("insert a decimal into an earlier measurement without replacing the equation", () => {
  let draft = at("153in - 135in", 3);
  draft = editEquationKey(draft, ".");
  draft = editEquationKey(draft, "5");
  assert.deepEqual(draft, at("153.5in - 135in", 5));
  const result = parseSmartExpression(draft.text);
  assert.ok(result.ok);
  if (result.ok) assert.deepEqual(result.result, { kind: "measure", inches: 18.5 });
});

test("backspace at the cursor and replacement of a selection preserve the rest", () => {
  assert.deepEqual(editEquationKey(at("153.5in - 135in", 5), "⌫"), at("153.in - 135in", 4));
  assert.deepEqual(editEquationKey(at("153in - 135in", 0, 3), "4"), at("4in - 135in", 1));
  assert.deepEqual(editEquationKey(at("153in - 135in", 0), "⌫"), at("153in - 135in", 0));
  assert.deepEqual(editEquationKey(at("153in - 135in", 8, 11), "⌫"), at("153in - in", 8));
});

test("fraction picker inserts before units and replaces an existing fraction", () => {
  const first = editEquationFraction(at("153in - 135in", 3), "1/2");
  assert.deepEqual(first, at("153 1/2in - 135in", 7));
  assert.deepEqual(editEquationFraction(first, "3/4"), at("153 3/4in - 135in", 7));
  const parsed = parseSmartExpression(first.text);
  assert.ok(parsed.ok);
  if (parsed.ok) assert.deepEqual(parsed.result, { kind: "measure", inches: 18.5 });
});

test("editing supports units, operators, bounds, clear, and validation without silent repair", () => {
  assert.deepEqual(editEquationKey(at("12 - 4in", 2), "IN"), at("12in - 4in", 4));
  assert.equal(editEquationKey(at("12 4", 2, 3), "×").text, "12 × 4");
  assert.deepEqual(replaceSelection(at("12", 100, 200), "3"), at("123", 3));
  assert.deepEqual(editEquationKey(at("12in", 2), "C"), at("", 0));
  const invalid = editEquationKey(at("12.5in", 2), ".");
  assert.equal(parseSmartExpression(invalid.text).ok, false);
  assert.equal(invalid.text, "12..5in");
});

test("rapid editor keystrokes retain every digit at a middle caret", () => {
  let draft = at("1in - 2in", 1);
  for (let i = 0; i < 30; i++) draft = editEquationKey(draft, "3");
  assert.equal(draft.text, `1${"3".repeat(30)}in - 2in`);
  assert.equal(draft.selection.start, 31);
});
