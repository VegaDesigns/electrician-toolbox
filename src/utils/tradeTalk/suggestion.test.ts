import assert from "node:assert/strict";
import test from "node:test";
import { formatTermSuggestion, SUGGESTION_LIMITS, validateTermSuggestion } from "./suggestion";

test("term suggestions require a word and meaning and enforce each length limit", () => {
  const value = { term: "A", meaning: "A unit symbol", region: "" };
  assert.equal(validateTermSuggestion(value), null);
  assert.equal(validateTermSuggestion({ ...value, term: "  " }), "Enter the word or term.");
  assert.equal(validateTermSuggestion({ ...value, meaning: "\n" }), "Tell us what it means.");
  for (const field of ["term", "meaning", "region"] as const) {
    assert.ok(validateTermSuggestion({ ...value, [field]: "a".repeat(SUGGESTION_LIMITS[field] + 1) }));
    assert.equal(validateTermSuggestion({ ...value, [field]: "a".repeat(SUGGESTION_LIMITS[field]) }), null);
  }
  assert.throws(() => formatTermSuggestion({ ...value, meaning: "" }), /what it means/);
});

test("Spanish suggestion previews translate only labels and include no hidden metadata", () => {
  const value = { term: "  Happy  ", meaning: "My crew says this.\nA second line.", region: "Puerto Rico" };
  const before = JSON.stringify(value);
  assert.equal(formatTermSuggestion(value, "es"), [
    "Electrician Toolbox — Propuesta de término", "", "Palabra o término: Happy", "", "Significado propuesto:",
    "My crew says this.\nA second line.", "", "País o región: Puerto Rico", "",
    "Propuesta de la comunidad: sin revisar y sin agregar al diccionario.",
  ].join("\n"));
  assert.equal(JSON.stringify(value), before);
  assert.ok(!formatTermSuggestion({ ...value, region: "" }).includes("Country or region"));
});
