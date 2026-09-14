import assert from "node:assert/strict";
import test from "node:test";
import { boxDraft, conduitDraft } from "./fillDrafts";

test("fill drafts retain independent selections and reset only their own tab", () => {
  conduitDraft.reset(); boxDraft.reset();
  conduitDraft.setValue(v => ({ ...v, conduitType: "pvc40", conduitSize: "1", nextRowId: 3, wires: [{ id: 1, quantity: 8, size: "10" }, { id: 2, quantity: 2, size: "12" }] }));
  boxDraft.setValue(v => ({ ...v, boxFamily: "marked", markedVolume: "42", deviceCount: 2, hasInternalClamp: true }));
  const retained = conduitDraft.getSnapshot();
  const unsubscribe = conduitDraft.subscribe(() => {});
  unsubscribe(); // Route unmount must not erase its draft.
  assert.deepEqual(conduitDraft.getSnapshot(), retained);
  boxDraft.reset();
  assert.equal(boxDraft.getSnapshot().markedVolume, "");
  assert.deepEqual(conduitDraft.getSnapshot(), retained);
  conduitDraft.reset();
  assert.deepEqual(conduitDraft.getSnapshot().wires, [{ id: 1, quantity: 3, size: "12" }]);
});
