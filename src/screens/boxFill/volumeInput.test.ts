import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVolumeInput } from "./volumeInput";

test("volume entry accepts the Spanish decimal key without changing the stored number", () => {
  for (const [input, expected] of [["30,3", "30.3"], ["2,25", "2.25"], ["0,00", "0.00"], [",5", ".5"], ["30.3", "30.3"]]) {
    assert.equal(normalizeVolumeInput(input), expected);
    assert.equal(Number(normalizeVolumeInput(input)), Number(expected));
  }
});

test("volume drafts allow clearing and a pending decimal separator", () => {
  for (const [input, expected] of [["", ""], [",", "."], [".", "."], ["30,", "30."], ["30", "30"]]) {
    assert.equal(normalizeVolumeInput(input), expected);
  }
});

test("volume entry rejects grouping, mixed separators and unsupported precision", () => {
  for (const input of ["1,234", "1.234", "1.234,56", "1,234.56", "1,,2", "1,2,3", "1..2", "2-1/8", "-1", "1 000", "NaN", "Infinity"]) {
    assert.equal(normalizeVolumeInput(input), null, input);
  }
});
