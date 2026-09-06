import assert from "node:assert/strict";
import test from "node:test";

import {
  getDailyTradeTalkEntry,
  normalizeDictionaryText,
  searchTradeTalk,
} from "./dictionary";

test("finds an exact slang term and connects it to the proper name", () => {
  const [result] = searchTradeTalk("battleship");
  assert.equal(result.id, "battleship");
  assert.equal(result.officialName, "Old-work box support strap");
});

test("finds entries by alternate names", () => {
  assert.equal(searchTradeTalk("snake")[0].id, "fish-tape");
  assert.equal(searchTradeTalk("1900 box")[0].id, "four-square");
});

test("understands a phrase containing more than one trade term", () => {
  const ids = searchTradeTalk("grab a beater and a battleship").map(({ id }) => id);
  assert.ok(ids.includes("beater"));
  assert.ok(ids.includes("battleship"));
});

test("tolerates a common misspelling", () => {
  assert.equal(searchTradeTalk("battlship")[0].id, "battleship");
});

test("normalizes punctuation and spacing", () => {
  assert.equal(normalizeDictionaryText("  Lineman’s   Pliers! "), "linemans pliers");
});

test("daily entry is stable for a given date", () => {
  const date = new Date("2026-09-06T12:00:00Z");
  assert.equal(getDailyTradeTalkEntry(date).id, getDailyTradeTalkEntry(date).id);
});
