import { type WorkItem } from "./jobBoard";

export function formatJobList(title: string, items: WorkItem[]): string {
  return [title, ...items.map((item) => {
    const lines = [`${item.status === "done" ? "[x]" : "[ ]"} ${item.kind === "material" ? `${item.quantity} ${item.unit} — ` : ""}${item.title}`];
    if (item.location) lines.push(`  Location: ${item.location}`);
    if (item.waitingOn) lines.push(`  Waiting on: ${item.waitingOn}`);
    if (item.dueOn) lines.push(`  Due: ${item.dueOn}`);
    if (item.notes) lines.push(`  ${item.notes}`);
    item.checklist.forEach((step) => lines.push(`  ${step.done ? "[x]" : "[ ]"} ${step.label}`));
    item.materials.forEach((line) => lines.push(`  ${line.collected ? "[x]" : "[ ]"} ${line.quantity} ${line.unit} ${line.name}`));
    return lines.join("\n");
  })].join("\n\n");
}

export function formatMaterialRun(title: string, items: WorkItem[]): string {
  const lines = items.flatMap((item) => [
    ...(item.kind === "material" && item.status === "open" ? [`[ ] ${item.quantity} ${item.unit} ${item.title}${item.location ? ` — ${item.location}` : ""}`] : []),
    ...item.materials.filter((line) => !line.collected).map((line) => `[ ] ${line.quantity} ${line.unit} ${line.name} — for ${item.title}${item.location ? ` (${item.location})` : ""}`),
  ]);
  return [title, ...lines].join("\n");
}
