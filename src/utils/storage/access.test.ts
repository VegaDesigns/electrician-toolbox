import assert from "node:assert/strict";
import test from "node:test";
import { createStorageAccess, type KeyValueStorage } from "./access";

test("exclusive storage waits for pending saves and rejects interleaving reads and writes", async () => {
  let complete!: () => void;
  const events: string[] = [];
  const raw: KeyValueStorage = {
    getItem: async () => "saved",
    setItem: async () => { events.push("save start"); await new Promise<void>(resolve => { complete = resolve; }); events.push("save end"); },
    removeItem: async () => {},
  };
  const gate = createStorageAccess(raw);
  const pending = gate.setItem("key", "value");
  await Promise.resolve(); await Promise.resolve();
  const exclusive = gate.exclusively(async storage => { events.push("restore"); assert.equal(await storage.getItem("key"), "saved"); });
  await assert.rejects(gate.setItem("key", "stale")); await assert.rejects(gate.getItem("key"));
  complete(); await pending; await exclusive;
  assert.deepEqual(events, ["save start", "save end", "restore"]);
  assert.equal(await gate.getItem("key"), "saved");
});
test("failed exclusive operation unlocks, but quarantined storage only permits recovery", async () => {
  const gate = createStorageAccess({ getItem: async () => "safe", setItem: async () => {}, removeItem: async () => {} });
  await assert.rejects(gate.exclusively(async () => { throw Error("failure"); }));
  assert.equal(await gate.getItem("key"), "safe");
  gate.quarantine(true); await assert.rejects(gate.getItem("key"));
  assert.equal(await gate.exclusively(storage => storage.getItem("key")), "safe");
  gate.quarantine(false); assert.equal(await gate.getItem("key"), "safe");
});
