import type { MaterialList } from "./materialLists";
import { translate, type Language } from "../../i18n/core";

export function formatMaterialList(list: MaterialList, language: Language = "en"): string {
  const t = (text: string) => translate(text, {}, language);
  const notes = list.lines.filter(line => line.kind === "note");
  const materials = list.lines.filter(line => line.kind !== "note");
  return [
    list.title.trim() || t("Untitled list"),
    t(list.completed ? "Completed" : "Active"),
    ...(notes.length ? ["", t("NOTES"), ...notes.map(line => `• ${line.text}`)] : []),
    ...(materials.length ? ["", t("MATERIALS"), ...materials.map(line => `${line.done ? "[x]" : "[ ]"} ${line.text}`)] : []),
    ...(!list.lines.length ? ["", t("No notes or materials yet.")] : []),
  ].join("\n");
}
