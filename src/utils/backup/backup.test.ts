import assert from "node:assert/strict";
import test from "node:test";
import { defaultBenderSetup } from "../bending/setup";
import { createWorkItem } from "../jobBoard/jobBoard";
import { BUILT_IN_PANEL_SCHEMES } from "../panelColors/phase";
import { BACKUP_FORMAT, DATA_KEYS, MAX_BACKUP_BYTES, backupSummary, makeBackup, parseBackup, type BackupRecords, type ToolboxBackup } from "./schema";
import { readRecords, recoverInterruptedRestore, RecoveryRequiredError, RESTORE_JOURNAL_KEY, restoreBackup } from "./transaction";
import type { KeyValueStorage } from "../storage/access";
import { withoutBackupNotice } from "./notice";

function records(): BackupRecords {
  const data = Object.fromEntries(DATA_KEYS.map(key => [key, null])) as BackupRecords;
  data[DATA_KEYS[0]] = JSON.stringify({ lists: [{ id: "job-1", title: "Hallway", completed: false, createdAt: 1, lines: [{ id: "line-1", text: "4 - Couplings", done: false, previous: [], kind: "material" }] }] });
  data[DATA_KEYS[1]] = JSON.stringify({ customSchemes: [], selectedSchemeId: BUILT_IN_PANEL_SCHEMES[0].id });
  data[DATA_KEYS[2]] = JSON.stringify([{ id: "calc-1", expression: "5+2", result: "7", createdAt: 1, resultKind: "number", rawValue: 7, isFavorite: true }]);
  data[DATA_KEYS[3]] = JSON.stringify({ precision: 16 });
  data[DATA_KEYS[4]] = JSON.stringify(defaultBenderSetup());
  data[DATA_KEYS[5]] = JSON.stringify({ material: "copper", size: "6", ambientBand: "96-104", conductorCountBand: "4-6", lugRating: "75" });
  data[DATA_KEYS[6]] = JSON.stringify({ favoriteIds: ["emt"], recentIds: ["emt"] });
  data[DATA_KEYS[7]] = JSON.stringify({ version: 1, themeId: "forest", mode: "dark" });
  data[DATA_KEYS[8]] = JSON.stringify({ jobs: [], items: [createWorkItem("old-item", "task", "Retained task", 1)] });
  return data;
}
const backup = () => makeBackup(records(), "0.9.3", new Date("2026-09-28T00:00:00.000Z"));
function fakeStorage(initial: BackupRecords) {
  const map = new Map<string, string>(Object.entries(initial).filter((pair): pair is [string, string] => pair[1] !== null));
  let writes = 0;
  const storage: KeyValueStorage = {
    async getItem(key) { return map.get(key) ?? null; },
    async setItem(key, value) { writes++; map.set(key, value); },
    async removeItem(key) { writes++; map.delete(key); },
  };
  return { map, storage, get writes() { return writes; } };
}
test("backup round trip preserves all nine sections and review counts", () => {
  const parsed = parseBackup(JSON.stringify(backup()));
  assert.deepEqual(parsed.records, records());
  assert.deepEqual(backupSummary(parsed), { lists: 1, items: 1, panelPresets: 0, calculations: 1, favoriteTerms: 1, legacyItems: 1, includesLegacy: true });
});
test("wrong app, future version, malformed JSON, oversized file, missing or extra keys are rejected", () => {
  const value = backup();
  for (const raw of ["{oops", JSON.stringify({ ...value, format: "another-app" }), JSON.stringify({ ...value, version: 2 }), JSON.stringify({ ...value, records: {} }), JSON.stringify({ ...value, records: { ...value.records, arbitrary: "{}" } }), "x".repeat(MAX_BACKUP_BYTES + 1)]) {
    assert.throws(() => parseBackup(raw));
  }
});
test("corrupt records and duplicate list ids are rejected without normalization or loss", () => {
  const data = records(); data[DATA_KEYS[2]] = "not-json";
  assert.throws(() => makeBackup(data, "0.9.3"), /Workpad history/);
  const list = JSON.parse(data[DATA_KEYS[0]]!).lists[0]; data[DATA_KEYS[2]] = null;
  data[DATA_KEYS[0]] = JSON.stringify({ lists: [list, list] });
  assert.throws(() => makeBackup(data, "0.9.3"), /Jobsite Lists/);
});
test("enum-like arrays are rejected instead of coercing into electrical preferences", () => {
  for (const field of ["ambientBand", "conductorCountBand", "lugRating"]) {
    const data = records(), wire = JSON.parse(data[DATA_KEYS[5]]!); wire[field] = [wire[field]]; data[DATA_KEYS[5]] = JSON.stringify(wire);
    assert.throws(() => makeBackup(data, "0.9.3"), /Wire Guide/);
  }
  const data = records(), bend = JSON.parse(data[DATA_KEYS[4]]!); bend.settings.method = ["geometry"]; data[DATA_KEYS[4]] = JSON.stringify(bend);
  assert.throws(() => makeBackup(data, "0.9.3"), /Bending/);
});
test("malformed retained legacy rows and panel swatches are rejected", () => {
  const data = records(); data[DATA_KEYS[8]] = JSON.stringify({ jobs: [], items: [{ id: "bad", title: "bad", checklist: [null], materials: [null] }] });
  assert.throws(() => makeBackup(data, "0.9.3"), /previous board/);
  data[DATA_KEYS[8]] = null;
  const scheme = { ...BUILT_IN_PANEL_SCHEMES[0], id: "custom-1", isBuiltIn: false, isQuickChoice: false, colors: structuredClone(BUILT_IN_PANEL_SCHEMES[0].colors) };
  const color = Object.values(scheme.colors)[0]! as unknown as { hex: unknown }; color.hex = ["#123456"];
  data[DATA_KEYS[1]] = JSON.stringify({ customSchemes: [scheme], selectedSchemeId: scheme.id });
  assert.throws(() => makeBackup(data, "0.9.3"), /Panel Colors/);
});
test("a validated restore replaces all keys, removes absent records and leaves unrelated storage alone", async () => {
  const current = records(); const next = backup(); next.records[DATA_KEYS[0]] = null; next.records[DATA_KEYS[3]] = '{"precision":8}';
  const fake = fakeStorage(current); fake.map.set("unrelated", "keep");
  await restoreBackup(fake.storage, next);
  assert.deepEqual(await readRecords(fake.storage), next.records);
  assert.equal(fake.map.get("unrelated"), "keep"); assert.equal(fake.map.has(RESTORE_JOURNAL_KEY), false);
});
test("invalid import is rechecked at the write boundary and never mutates storage", async () => {
  const fake = fakeStorage(records());
  await assert.rejects(restoreBackup(fake.storage, { ...backup(), format: "wrong" } as unknown as ToolboxBackup));
  assert.equal(fake.writes, 0);
});
test("current read failure or journal write failure cannot replace saved data", async () => {
  for (const operation of ["read", "journal"]) {
    const current = records(), fake = fakeStorage(current), base = fake.storage;
    const broken: KeyValueStorage = { ...base,
      getItem: async key => { if (operation === "read" && key === DATA_KEYS[1]) throw Error("read failure"); return base.getItem(key); },
      setItem: async (key, value) => { if (operation === "journal" && key === RESTORE_JOURNAL_KEY) throw Error("full"); return base.setItem(key, value); },
    };
    await assert.rejects(restoreBackup(broken, backup()));
    assert.deepEqual(await readRecords(base), current);
  }
});
test("mid-restore save failure rolls back verified exact originals", async () => {
  const current = records(), fake = fakeStorage(current), next = backup(); next.records[DATA_KEYS[0]] = null;
  let failed = false;
  const broken: KeyValueStorage = { ...fake.storage, setItem: async (key, value) => {
    if (key === DATA_KEYS[3] && !failed) { failed = true; throw Error("disk full"); }
    return fake.storage.setItem(key, value);
  } };
  await assert.rejects(restoreBackup(broken, next), /previous saved data was recovered/);
  assert.deepEqual(await readRecords(fake.storage), current); assert.equal(fake.map.has(RESTORE_JOURNAL_KEY), false);
});
test("failed rollback retains a recovery journal and later recovery restores old data", async () => {
  const current = records(), fake = fakeStorage(current), next = backup(); next.records[DATA_KEYS[0]] = null;
  const broken: KeyValueStorage = { ...fake.storage, setItem: async (key, value) => {
    if (key === DATA_KEYS[3]) throw Error("disk unavailable"); return fake.storage.setItem(key, value);
  } };
  await assert.rejects(restoreBackup(broken, next), RecoveryRequiredError);
  assert.equal(fake.map.has(RESTORE_JOURNAL_KEY), true);
  assert.equal(await recoverInterruptedRestore(fake.storage), true);
  assert.deepEqual(await readRecords(fake.storage), current);
});
test("cleanup read failure never triggers an unjournaled rollback", async () => {
  const current = records(), fake = fakeStorage(current), next = backup(); next.records[DATA_KEYS[0]] = null; next.records[DATA_KEYS[3]] = '{"precision":8}';
  let removed = false; let rollbackWrites = 0;
  const broken: KeyValueStorage = { ...fake.storage,
    removeItem: async key => { await fake.storage.removeItem(key); if (key === RESTORE_JOURNAL_KEY) removed = true; },
    getItem: async key => { if (removed && key === RESTORE_JOURNAL_KEY) throw Error("cleanup verification read failed"); return fake.storage.getItem(key); },
    setItem: async (key, value) => { if (removed) { rollbackWrites++; throw Error("rollback would fail"); } return fake.storage.setItem(key, value); },
  };
  await assert.rejects(restoreBackup(broken, next), RecoveryRequiredError);
  assert.equal(rollbackWrites, 0);
  assert.deepEqual(await readRecords(fake.storage), next.records);
  assert.equal(await recoverInterruptedRestore(fake.storage), false);
});
test("interrupted restore replays journal before allowing current data to be used", async () => {
  const current = records(), fake = fakeStorage(current);
  fake.map.set(RESTORE_JOURNAL_KEY, JSON.stringify({ version: 1, original: current })); fake.map.delete(DATA_KEYS[0]);
  assert.equal(await recoverInterruptedRestore(fake.storage), true);
  assert.deepEqual(await readRecords(fake.storage), current);
});
test("corrupt journal does not silently reset or expose mixed saved data", async () => {
  const current = records(), fake = fakeStorage(current); fake.map.set(RESTORE_JOURNAL_KEY, "broken");
  await assert.rejects(recoverInterruptedRestore(fake.storage), RecoveryRequiredError);
  assert.deepEqual(await readRecords(fake.storage), current); assert.equal(fake.map.get(RESTORE_JOURNAL_KEY), "broken");
});
test("potentially persisted journal is cleaned or quarantined on protection failure", async () => {
  const current = records(), fake = fakeStorage(current);
  const broken: KeyValueStorage = { ...fake.storage, setItem: async (key, value) => {
    await fake.storage.setItem(key, value); if (key === RESTORE_JOURNAL_KEY) throw Error("write acknowledgment lost");
  } };
  await assert.rejects(restoreBackup(broken, backup()), /restore did not start/);
  assert.equal(fake.map.has(RESTORE_JOURNAL_KEY), false); assert.deepEqual(await readRecords(fake.storage), current);
});
test("all-empty valid backup is explicit replacement rather than a merge", () => {
  const empty = Object.fromEntries(DATA_KEYS.map(key => [key, null])) as BackupRecords;
  assert.equal(makeBackup(empty, "0.9.3").format, BACKUP_FORMAT);
  assert.equal(backupSummary(makeBackup(empty, "0.9.3")).lists, 0);
});
test("acknowledging restore clears its notice without changing epoch or recovery state", () => {
  const before = { status: "ready", epoch: 4, noticeTitle: "Backup restored", notice: "Your saved work is ready.", error: "" };
  const after = withoutBackupNotice(before);
  assert.deepEqual(after, { ...before, noticeTitle: "", notice: "" });
  assert.equal(before.noticeTitle, "Backup restored");
  assert.equal(after.epoch, before.epoch);
  assert.deepEqual(withoutBackupNotice(after), after);
});
