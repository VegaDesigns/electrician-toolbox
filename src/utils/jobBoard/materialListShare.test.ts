import assert from "node:assert/strict";
import test from "node:test";
import { formatMaterialList } from "./materialListShare";
import type { MaterialList } from "./materialLists";

test("copy/share includes the title, notes, quantities, and collection status", () => {
  const list: MaterialList = { id: "job", title: " Hallway ", completed: false, createdAt: 1, lines: [
    { id: "1", text: "Ask for ceiling access", kind: "note", done: false, previous: [] },
    { id: "2", text: "4 - Couplings", done: true, previous: ["Old wording"] },
    { id: "3", text: "Connectors", kind: "material", done: false, previous: [] },
  ] };
  assert.equal(formatMaterialList(list), "Hallway\nActive\n\nNOTES\n• Ask for ceiling access\n\nMATERIALS\n[x] 4 - Couplings\n[ ] Connectors");
  assert.equal(formatMaterialList({ ...list, completed: true, title: "", lines: [] }), "Untitled list\nCompleted\n\nNo notes or materials yet.");
});

test("Spanish list sharing translates structure but preserves user wording and quantities", () => {
  const list: MaterialList = { id: "job", title: "Materials", completed: false, createdAt: 1, lines: [
    { id: "1", text: "Ask for ceiling access", kind: "note", done: false, previous: [] },
    { id: "2", text: "4 - Couplings", done: true, previous: ["Old wording"] },
  ] };
  const before = JSON.stringify(list);
  const output = formatMaterialList(list, "es");
  assert.ok(output.startsWith("Materials\n"), "never translate a user title that matches a UI key");
  assert.ok(output.includes("NOTAS\n• Ask for ceiling access"));
  assert.ok(output.includes("MATERIALES\n[x] 4 - Couplings"));
  assert.equal(JSON.stringify(list), before);
});
