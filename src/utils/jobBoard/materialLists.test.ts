import assert from "node:assert/strict";
import test from "node:test";
import { decodeLists, editLine, restoreLine, splitLines, materialParts, materialText } from "./materialLists";

test("notes survive storage and editing without changing legacy material rows", () => {
  const note = { id: "note", text: "Check storage", done: true, previous: [], kind: "note" as const };
  const legacy = { id: "item", text: "4 connectors", done: false, previous: [] };
  const data = { lists: [{ id: "run", title: "Run", createdAt: 1, completed: false, lines: [legacy, note] }] };
  assert.deepEqual(decodeLists(JSON.stringify(data)), data);
  assert.equal(editLine(note, "Check roof storage").kind, "note");
  assert.deepEqual(editLine(note, "Check roof storage").previous, []);
  assert.equal(editLine(note, "Check roof storage").text, "Check roof storage");
  const invalid = { lists: [{ ...data.lists[0], lines: [{ ...note, kind: "unknown" }] }] };
  assert.throws(() => decodeLists(JSON.stringify(invalid)));
});

test("optional quantities format and reopen without duplicating prefixes", () => {
  assert.equal(materialText("0", "Couplings"), "Couplings");
  assert.equal(materialText("4", "Couplings"), "4 - Couplings");
  assert.deepEqual(materialParts("4 - Couplings"), { quantity: "4", description: "Couplings" });
  assert.deepEqual(materialParts('1 1/4" couplings'), { quantity: "0", description: '1 1/4" couplings' });
});

test("four couplings can become one remaining with recoverable wording", () => {
  const original = { id: "line", text: '4 - 1¼" couplings', done: true, previous: [] };
  const edited = editLine(original, '1 - 1¼" couplings');
  assert.equal(edited.done, false);
  assert.deepEqual(edited.previous, [original.text]);
  assert.equal(restoreLine(edited).text, original.text);
  assert.equal(restoreLine(edited).done, false);
  assert.equal(editLine(edited, edited.text), edited);
  assert.equal(editLine(edited, "  "), edited);
});

test("multiline paste keeps quantities and trade wording intact", () => {
  assert.deepEqual(splitLines(' 6 coup\r\n\r\n4 - 4" square\n 1 1/4 connector '), ["6 coup", '4 - 4" square', "1 1/4 connector"]);
});

test("saved lists retain item order, edit history and completion across reload", () => {
  const data = { lists: [{ id: "run", title: "Hallway", createdAt: 100, completed: true, lines: [
    editLine({ id: "a", text: "4 couplings", done: false, previous: [] }, "1 coupling"),
    { id: "b", text: "4 connectors", done: true, previous: [] },
  ] }] };
  assert.deepEqual(decodeLists(JSON.stringify(data)), data);
  assert.throws(() => decodeLists('{"lists":[{}]}'));
  assert.throws(() => decodeLists(JSON.stringify({ lists: [data.lists[0], data.lists[0]] })));
});
