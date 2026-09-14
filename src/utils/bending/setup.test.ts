import assert from "node:assert/strict";
import test from "node:test";
import { decodeBenderSetup, defaultBenderSetup } from "./setup";

test("saved bender setup retains dimensions, bend, deduction, and precision", () => {
  const setup = defaultBenderSetup();
  setup.bend = "offset";
  setup.settings = { size: 2, deduction: 7.5, precision: 32, method: "geometry" };
  setup.drafts.offset.height = "8 1/2";
  setup.drafts.offset.location = "24";
  assert.deepEqual(decodeBenderSetup(JSON.stringify(setup)), setup);
});
test("unreadable setups fail loading rather than becoming saved defaults", () => {
  for (const raw of ["", "broken", "null", "[]", "{}", '{"settings":[],"drafts":{}}']) {
    assert.throws(() => decodeBenderSetup(raw), raw);
  }
});
