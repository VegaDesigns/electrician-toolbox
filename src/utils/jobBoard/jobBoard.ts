export type WorkItemKind = "note" | "material" | "punch" | "task";
export type WorkItemStatus = "open" | "done";
export type WorkItemPriority = "low" | "normal" | "high";

export type ChecklistLine = {
  id: string;
  label: string;
  done: boolean;
};

export type MaterialLine = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  collected: boolean;
};

export type Job = {
  id: string;
  name: string;
  createdAt: number;
};

export type WorkItem = {
  id: string;
  kind: WorkItemKind;
  title: string;
  status: WorkItemStatus;
  jobId: string | null;
  location: string;
  priority: WorkItemPriority;
  dueOn: string | null;
  estimateMinutes: number | null;
  notes: string;
  waitingOn?: string;
  quantity: number;
  unit: string;
  checklist: ChecklistLine[];
  materials: MaterialLine[];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
};

export type JobBoardData = {
  jobs: Job[];
  items: WorkItem[];
};

export const EMPTY_JOB_BOARD: JobBoardData = { jobs: [], items: [] };

export const KIND_LABELS: Record<WorkItemKind, string> = {
  note: "Note",
  material: "Material",
  punch: "Punch",
  task: "Task",
};

export const KIND_ICONS: Record<WorkItemKind, string> = {
  note: "✎",
  material: "□",
  punch: "!",
  task: "✓",
};

export function createWorkItem(
  id: string,
  kind: WorkItemKind,
  title: string,
  now = Date.now(),
): WorkItem {
  return {
    id,
    kind,
    title: title.trim(),
    status: "open",
    jobId: null,
    location: "",
    priority: "normal",
    dueOn: null,
    estimateMinutes: null,
    notes: "",
    quantity: 1,
    unit: "ea",
    checklist: [],
    materials: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateKeyFromChoice(choice: "none" | "today" | "tomorrow", now = new Date()): string | null {
  if (choice === "none") return null;
  const date = new Date(now);
  if (choice === "tomorrow") date.setDate(date.getDate() + 1);
  return localDateKey(date);
}

export function dueChoice(dueOn: string | null, now = new Date()): "none" | "today" | "tomorrow" | "other" {
  if (!dueOn) return "none";
  if (dueOn === dateKeyFromChoice("today", now)) return "today";
  if (dueOn === dateKeyFromChoice("tomorrow", now)) return "tomorrow";
  return "other";
}

export function dueLabel(dueOn: string | null, now = new Date()): string {
  const choice = dueChoice(dueOn, now);
  if (choice === "none") return "";
  if (choice === "today") return "Today";
  if (choice === "tomorrow") return "Tomorrow";
  const dateKey = dueOn ?? "";
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return "";
  const label = new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return dateKey < localDateKey(now) ? `Overdue ${label}` : label;
}

export function toggleWorkItem(item: WorkItem, now = Date.now()): WorkItem {
  const done = item.status === "open";
  return {
    ...item,
    status: done ? "done" : "open",
    completedAt: done ? now : null,
    updatedAt: now,
  };
}

export function sortWorkItems(items: WorkItem[]): WorkItem[] {
  const priorityOrder: Record<WorkItemPriority, number> = { high: 0, normal: 1, low: 2 };
  return [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    if (a.status === "done") return (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt);
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.updatedAt - a.updatedAt;
  });
}

export function jobProgress(jobId: string, items: WorkItem[]) {
  const jobItems = items.filter((item) => item.jobId === jobId);
  const complete = jobItems.filter((item) => item.status === "done").length;
  return { complete, open: jobItems.length - complete, total: jobItems.length };
}

export function materialProgress(items: WorkItem[]) {
  const standalone = items.filter((item) => item.kind === "material");
  const nested = items.flatMap((item) => item.materials);
  const total = standalone.length + nested.length;
  const collected = standalone.filter((item) => item.status === "done").length
    + nested.filter((line) => line.collected).length;
  return { collected, remaining: total - collected, total };
}
