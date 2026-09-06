import assert from "node:assert/strict";
import test from "node:test";

import {
  inferPreferredResultFormat,
  shouldOfferUnitToggle,
  shouldShowInterpretation,
} from "./outputIntent";

test("keeps inch-only calculations in inches", () => {
  assert.equal(inferPreferredResultFormat("80in ÷ 2", "measure"), "rounded-in");
  assert.equal(inferPreferredResultFormat('24" + 12"', "measure"), "rounded-in");
});

test("uses feet and inches when feet appear anywhere", () => {
  assert.equal(inferPreferredResultFormat("8ft + 6in", "measure"), "ft-in");
  assert.equal(inferPreferredResultFormat("12' ÷ 2", "measure"), "ft-in");
});

test("treats unitless fractions as field inches", () => {
  assert.equal(
    inferPreferredResultFormat("5 3/8 + 2 1/4", "measure"),
    "rounded-in",
  );
});

test("keeps plain arithmetic unitless", () => {
  assert.equal(inferPreferredResultFormat("80 ÷ 2", "number"), "standard");
});

test("only surfaces interpretation when the shorthand may need confirmation", () => {
  assert.equal(shouldShowInterpretation("24in + 12in", "2' + 1'", "measure"), false);
  assert.equal(shouldShowInterpretation("5 and 4/8th", '5 1/2"', "measure"), true);
  assert.equal(shouldShowInterpretation("5 3/8 + 2 1/4", '5 3/8" + 2 1/4"', "measure"), true);
});

test("only offers the quick unit toggle for measurements of at least one foot", () => {
  assert.equal(shouldOfferUnitToggle({ kind: "measure", inches: 11.999 }), false);
  assert.equal(shouldOfferUnitToggle({ kind: "measure", inches: 12 }), true);
  assert.equal(shouldOfferUnitToggle({ kind: "measure", inches: -24 }), true);
  assert.equal(shouldOfferUnitToggle({ kind: "number", value: 24 }), false);
});
