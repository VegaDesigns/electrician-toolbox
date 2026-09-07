import assert from "node:assert/strict";
import test from "node:test";
import { retainHistory, restoreHistory, type CalcHistoryItem } from "./historyModel";

function item(id: number, isFavorite = false): CalcHistoryItem {
  return {
    id: String(id), expression: "4.3in", result: '4 5/16"',
    createdAt: id, isFavorite, resultKind: "measure", rawValue: 4.3,
    resultFormat: "rounded-in", precision: 16,
  };
}

test("keeps fifty recent calculations without evicting older saved items", () => {
  const entries = Array.from({ length: 120 }, (_, index) => item(120 - index, index >= 55));
  const retained = retainHistory(entries);
  assert.equal(retained.filter((entry) => !entry.isFavorite).length, 50);
  assert.equal(retained.filter((entry) => entry.isFavorite).length, 65);
  assert.ok(retained.some((entry) => entry.id === "1"));
});

test("retention preserves raw values, display format, precision and creation time", () => {
  const original = item(7);
  assert.deepEqual(retainHistory([original])[0], original);
  assert.equal(retainHistory([{ ...original, precision: "none", resultFormat: "decimal-ft" }])[0].precision, "none");
});

test("undo merges removed entries with calculations made since deletion", () => {
  const restored = restoreHistory([item(4)], [item(3), item(2)]);
  assert.deepEqual(restored.map((entry) => entry.id), ["4", "3", "2"]);
});

test("undo never overwrites a newer favorite or format change", () => {
  const updated = { ...item(3, true), resultFormat: "decimal-ft" as const, result: "0.3583 ft" };
  assert.deepEqual(restoreHistory([updated], [item(3)]), [updated]);
});

test("duplicate entries do not consume the recent-history allowance", () => {
  assert.deepEqual(retainHistory([item(3), item(3), item(2), item(1)], 2).map((entry) => entry.id), ["3", "2"]);
});
