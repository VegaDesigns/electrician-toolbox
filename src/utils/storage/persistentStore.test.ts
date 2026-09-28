import test from "node:test";
import assert from "node:assert/strict";
import { createPersistentStore } from "./persistentStore";
import { resetStorageParticipants, withSettledStorage } from "./maintenance";

test("failed reads protect existing data and retry actually reloads it", async () => {
  let fail = true, writes = 0;
  const original = { favorites: ["pigtail"] };
  const store = createPersistentStore(async () => { if (fail) throw Error("read"); return original; }, async () => { writes++; }, { favorites: [] as string[] });
  await store.load();
  assert.equal(store.getSnapshot().error, "load");
  assert.equal(await store.setValue({ favorites: [] }), false);
  assert.equal(writes, 0);
  fail = false;
  await store.retry();
  assert.deepEqual(store.getSnapshot().value, original);
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(writes, 0);
});
test("rapid edits save in order and retry retains the latest unsaved value", async () => {
  const saved: number[] = []; let fail = true;
  const store = createPersistentStore(async () => 1, async value => { if (fail) throw Error("write"); saved.push(value); }, 0);
  await store.load();
  await Promise.all([store.setValue(2), store.setValue(n => n + 1)]);
  assert.equal(store.getSnapshot().value, 3);
  assert.equal(store.getSnapshot().dirty, true);
  fail = false;
  await store.retry();
  await Promise.all([store.setValue(4), store.setValue(5)]);
  assert.deepEqual(saved, [3, 4, 5]);
  assert.equal(store.getSnapshot().dirty, false);
});
test("duplicate mount loads share one read and do not reset edits", async () => {
  let reads = 0;
  const store = createPersistentStore(async () => { reads++; return 5; }, async () => {}, 0);
  await Promise.all([store.load(), store.load()]);
  await store.setValue(9);
  await store.load();
  assert.equal(reads, 1);
  assert.equal(store.getSnapshot().value, 9);
});
test("backup waits for pending saves, blocks new edits and clears stale in-memory state", async () => {
  let saved = 1;
  let finish!: () => void;
  const store = createPersistentStore(async () => saved, async value => {
    await new Promise<void>(resolve => { finish = resolve; }); saved = value;
  }, 0);
  await store.load();
  const save = store.setValue(2);
  await Promise.resolve();
  const capture = withSettledStorage(async () => saved);
  assert.equal(await store.setValue(99), false);
  finish(); await save;
  assert.equal(await capture, 2);
  resetStorageParticipants();
  assert.equal(store.getSnapshot().ready, false);
  await store.load(); assert.equal(store.getSnapshot().value, 2);
});
test("failed saves block backups until retried rather than exporting stale data", async () => {
  let fail = true;
  const store = createPersistentStore(async () => 1, async () => { if (fail) throw Error("full"); }, 0);
  await store.load(); await store.setValue(2);
  let entered = false;
  await assert.rejects(withSettledStorage(async () => { entered = true; }), /Save or reload/);
  assert.equal(entered, false);
  fail = false; await store.retry();
  await withSettledStorage(async () => { entered = true; });
  assert.equal(entered, true);
});
