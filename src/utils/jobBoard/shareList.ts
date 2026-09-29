import { type WorkItem } from "./jobBoard";
import { translate, type Language } from "../../i18n/core";

export function formatJobList(title: string, items: WorkItem[], language: Language = "en"): string {
  return [title, ...items.map((item) => {
    const lines = [`${item.status === "done" ? "[x]" : "[ ]"} ${item.kind === "material" ? `${item.quantity} ${item.unit} — ` : ""}${item.title}`];
    if (item.location) lines.push(`  ${translate("Location: {{text}}", { text: item.location }, language)}`);
    if (item.waitingOn) lines.push(`  ${translate("Waiting on: {{text}}", { text: item.waitingOn }, language)}`);
    if (item.dueOn) lines.push(`  ${translate("Due: {{text}}", { text: item.dueOn }, language)}`);
    if (item.notes) lines.push(`  ${item.notes}`);
    item.checklist.forEach((step) => lines.push(`  ${step.done ? "[x]" : "[ ]"} ${step.label}`));
    item.materials.forEach((line) => lines.push(`  ${line.collected ? "[x]" : "[ ]"} ${line.quantity} ${line.unit} ${line.name}`));
    return lines.join("\n");
  })].join("\n\n");
}

export function formatMaterialRun(title: string, items: WorkItem[], language: Language = "en"): string {
  const lines = items.flatMap((item) => [
    ...(item.kind === "material" && item.status === "open" ? [`[ ] ${item.quantity} ${item.unit} ${item.title}${item.location ? ` — ${item.location}` : ""}`] : []),
    ...item.materials.filter((line) => !line.collected).map((line) => `[ ] ${line.quantity} ${line.unit} ${line.name} — ${translate("for {{text}}", { text: item.title }, language)}${item.location ? ` (${item.location})` : ""}`),
  ]);
  return [title, ...lines].join("\n");
}
