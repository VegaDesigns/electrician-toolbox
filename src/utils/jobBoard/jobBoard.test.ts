import assert from "node:assert/strict";
import test from "node:test";

import {
  createWorkItem,
  dateKeyFromChoice,
  dueChoice,
  dueLabel,
  jobProgress,
  localDateKey,
  materialProgress,
  sortWorkItems,
  toggleWorkItem,
} from "./jobBoard";

test("creates a fast item with field-friendly defaults", () => {
  const item = createWorkItem("one", "task", "  Finish room 210  ", 100);
  assert.equal(item.title, "Finish room 210");
  assert.equal(item.dueOn, localDateKey(new Date(100)));
  assert.equal(item.status, "open");
  assert.equal(item.jobId, null);
});

test("stores real calendar dates for today and tomorrow", () => {
  const now = new Date(2026, 8, 6, 15, 30);
  assert.equal(dateKeyFromChoice("today", now), "2026-09-06");
  assert.equal(dateKeyFromChoice("tomorrow", now), "2026-09-07");
  assert.equal(dueChoice("2026-09-07", now), "tomorrow");
  assert.equal(dueLabel("2026-09-08", now), "Sep 8");
});

test("completing and reopening an item keeps its history coherent", () => {
  const item = createWorkItem("one", "punch", "Label panel", 100);
  const done = toggleWorkItem(item, 200);
  assert.equal(done.status, "done");
  assert.equal(done.completedAt, 200);
  const reopened = toggleWorkItem(done, 300);
  assert.equal(reopened.status, "open");
  assert.equal(reopened.completedAt, null);
});

test("open work sorts high priority first and done work sorts newest first", () => {
  const low = { ...createWorkItem("low", "note", "Low", 300), priority: "low" as const };
  const high = { ...createWorkItem("high", "task", "High", 100), priority: "high" as const };
  const done = toggleWorkItem(createWorkItem("done", "task", "Done", 200), 400);
  assert.deepEqual(sortWorkItems([low, done, high]).map(({ id }) => id), ["high", "low", "done"]);
});

test("job and material progress include the right work", () => {
  const first = { ...createWorkItem("one", "material", "Couplings"), jobId: "job-a" };
  const second = toggleWorkItem({ ...createWorkItem("two", "task", "Rough in"), jobId: "job-a" });
  const third = {
    ...createWorkItem("three", "task", "Trim"),
    materials: [{ id: "wire", name: "#12 wire", quantity: 2, unit: "roll", collected: true }],
  };
  assert.deepEqual(jobProgress("job-a", [first, second, third]), { complete: 1, open: 1, total: 2 });
  assert.deepEqual(materialProgress([first, second, third]), { collected: 1, remaining: 1, total: 2 });
});
