import assert from "node:assert/strict";
import test from "node:test";

import {
  getDailyTradeTalkEntry,
  TRADE_TALK_ENTRIES,
  normalizeDictionaryText,
  searchTradeTalk,
} from "./dictionary";
import { localizeTradeTalkEntry, TRADE_TALK_ES } from "./spanish";
import { QUIZ_QUESTIONS } from "./quiz";
import { translate } from "../../i18n/core";

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

test("every dictionary entry has Spanish explanations without changing canonical content", () => {
  const before = JSON.stringify(TRADE_TALK_ENTRIES);
  assert.deepEqual(Object.keys(TRADE_TALK_ES).sort(), TRADE_TALK_ENTRIES.map(entry => entry.id).sort());
  for (const entry of TRADE_TALK_ENTRIES) {
    const display = localizeTradeTalkEntry(entry, "es");
    assert.equal(display.id, entry.id);
    assert.equal(display.kind, entry.kind);
    assert.equal(display.category, entry.category);
    assert.deepEqual(display.aliases, entry.aliases);
    assert.ok(display.definition.length > 20);
    assert.ok(display.fieldUse.length > 20);
    assert.notEqual(display.definition, entry.definition);
    if (entry.safetyNote) {
      assert.ok(display.safetyNote);
      assert.notEqual(display.safetyNote, entry.safetyNote);
    }
    if (entry.kind !== "formal") assert.equal(display.term, entry.term, "do not invent regional slang translations");
    assert.equal(localizeTradeTalkEntry(entry, "en"), entry);
  }
  assert.equal(JSON.stringify(TRADE_TALK_ENTRIES), before);
});

test("Spanish and English dictionary search share the same canonical IDs", () => {
  for (const [spanish, english, id] of [
    ["CAÍDA DE VOLTAJE", "voltage drop", "voltage-drop"],
    ["guia pasacables", "fish tape", "fish-tape"],
    ["union equipotencial", "bonding", "bonding"],
    ["detector de voltaje sin contacto", "ticker", "ticker"],
    ["caja cuadrada de 4 pulgadas", "1900 box", "four-square"],
  ]) {
    assert.equal(searchTradeTalk(spanish)[0].id, id);
    assert.equal(searchTradeTalk(english)[0].id, id);
  }
  assert.equal(normalizeDictionaryText("Caída de voltaje"), "caida de voltaje");
  assert.equal(searchTradeTalk("guía", { category: "tools", limit: 1 })[0].id, "fish-tape");
});

test("the offline quiz is readable in Spanish with the same correct answers", () => {
  assert.deepEqual(QUIZ_QUESTIONS.map(question => [question.entryId, question.correct]), [
    ["battleship", 0], ["smurf-tube", 1], ["ticker", 2], ["dogleg", 0],
  ]);
  for (const question of QUIZ_QUESTIONS) {
    assert.ok(TRADE_TALK_ENTRIES.some(entry => entry.id === question.entryId));
    assert.notEqual(translate(question.prompt, {}, "es"), question.prompt);
    for (const answer of question.answers) {
      if (/^[A-Z]{2,4}$/.test(answer)) assert.equal(translate(answer, {}, "es"), answer);
      else assert.notEqual(translate(answer, {}, "es"), answer);
    }
  }
});
