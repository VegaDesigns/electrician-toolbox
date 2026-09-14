import type { MaterialList } from "./materialLists";

export function formatMaterialList(list: MaterialList): string {
  const notes = list.lines.filter(line => line.kind === "note");
  const materials = list.lines.filter(line => line.kind !== "note");
  return [
    list.title.trim() || "Untitled list",
    list.completed ? "Completed" : "Active",
    ...(notes.length ? ["", "NOTES", ...notes.map(line => `• ${line.text}`)] : []),
    ...(materials.length ? ["", "MATERIALS", ...materials.map(line => `${line.done ? "[x]" : "[ ]"} ${line.text}`)] : []),
    ...(!list.lines.length ? ["", "No notes or materials yet."] : []),
  ].join("\n");
}
