import assert from "node:assert/strict";
import test from "node:test";
import { createWorkItem } from "./jobBoard";
import { formatJobList, formatMaterialRun } from "./shareList";

test("handoff includes location, waiting reason, quantities and steps", () => {
  const item = { ...createWorkItem("a", "task", "Finish room"), location: "210", waitingOn: "Devices",
    checklist: [{ id: "s", label: "Label", done: true }],
    materials: [{ id: "m", name: "Couplings", quantity: 10, unit: "ea", collected: false }] };
  const output = formatJobList("School", [item]);
  for (const text of ["School", "Location: 210", "Waiting on: Devices", "[x] Label", "10 ea Couplings"]) assert.ok(output.includes(text));
});

test("material run excludes collected items and preserves task context", () => {
  const collected = { ...createWorkItem("a", "material", "Already collected"), status: "done" as const };
  const task = { ...createWorkItem("b", "task", "Room 210"), materials: [
    { id: "1", name: "Wire", quantity: 200, unit: "ft", collected: false },
    { id: "2", name: "Straps", quantity: 10, unit: "ea", collected: true },
  ] };
  const output = formatMaterialRun("Pickup", [collected, task]);
  assert.ok(output.includes("200 ft Wire — for Room 210"));
  assert.ok(!output.includes("Already collected"));
  assert.ok(!output.includes("Straps"));
});
