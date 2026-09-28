import assert from "node:assert/strict";
import test from "node:test";
import { parseInches } from "./bending";
import { enterMeasurementKey, measurementEntry, measurementText, pickMeasurementFraction, removeMeasurementFraction } from "./measurementEntry";
import { COMMON_FRACTIONS } from "../calc/fractions";

test("opening measurement entry preserves exact decimals and fractions", () => {
  for (const value of ["6.5", "6 1/2", "1/2", "0", "", "7.8125", "3 7/32"]) {
    assert.equal(measurementText(measurementEntry(value)), value);
  }
});
test("first digit replaces the previous measurement including its fraction", () => {
  const first = enterMeasurementKey(measurementEntry("6 1/2"), "1");
  assert.equal(measurementText(enterMeasurementKey(first, "0")), "10");
});
test("number entry accepts decimals and ignores repeated decimal points", () => {
  let entry = measurementEntry("6");
  for (const key of [".", "5", ".", "2"]) entry = enterMeasurementKey(entry, key);
  assert.equal(measurementText(entry), "0.52");
});
test("all shared Workpad fractions append to whole inches or stand alone", () => {
  for (const fraction of COMMON_FRACTIONS) {
    assert.equal(parseInches(measurementText(pickMeasurementFraction(measurementEntry("6"), fraction.label)!)), 6 + fraction.value);
    assert.equal(measurementText(pickMeasurementFraction(measurementEntry(""), fraction.label)!), fraction.label);
  }
});
test("choosing another fraction replaces the old fraction rather than adding", () => {
  assert.equal(measurementText(pickMeasurementFraction(measurementEntry("6 1/2"), "3/4")!), "6 3/4");
  assert.equal(measurementText(pickMeasurementFraction(measurementEntry("6.5"), "3/4")!), "6 3/4");
  assert.equal(measurementText(pickMeasurementFraction(measurementEntry("1/2"), "1/8")!), "1/8");
});
test("custom fractions include thirty-seconds and reject invalid values", () => {
  assert.equal(measurementText(pickMeasurementFraction(measurementEntry("6"), "7/32")!), "6 7/32");
  for (const value of ["1/0", "0/8", "8/8", "9/8", "-1/2", "1.5/2", "hello"]) {
    assert.equal(pickMeasurementFraction(measurementEntry("6"), value), null);
  }
});
test("backspace removes a whole fraction first; Clear removes all of the measurement", () => {
  let entry = enterMeasurementKey(measurementEntry("16 1/2"), "backspace");
  assert.equal(entry.text, "16");
  entry = enterMeasurementKey(entry, "backspace");
  assert.equal(entry.text, "1");
  assert.equal(enterMeasurementKey(entry, "4").text, "14");
  assert.equal(removeMeasurementFraction(measurementEntry("1/2")).text, "");
  assert.equal(enterMeasurementKey(measurementEntry("6 1/2"), "clear").text, "");
});
