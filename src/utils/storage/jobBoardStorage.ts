import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  dateKeyFromChoice,
  EMPTY_JOB_BOARD,
  type JobBoardData,
  type WorkItem,
} from "../jobBoard/jobBoard";

const STORAGE_KEY = "electrician-toolbox:job-board:v1";

export async function loadJobBoard(): Promise<JobBoardData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_JOB_BOARD;
    const parsed = JSON.parse(raw) as Partial<JobBoardData>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      items: items.map((item) => migrateWorkItem(item)),
    };
  } catch {
    return EMPTY_JOB_BOARD;
  }
}

function migrateWorkItem(raw: unknown): WorkItem {
  const item = raw as Omit<WorkItem, "dueOn"> & { due?: string; dueOn?: string | null };
  if (item.dueOn !== undefined) return { ...item, dueOn: item.dueOn };
  const { due: legacyDue, ...rest } = item;
  return {
    ...rest,
    dueOn: legacyDue === "today" || legacyDue === "tomorrow"
      ? dateKeyFromChoice(legacyDue)
      : null,
  };
}

export async function saveJobBoard(data: JobBoardData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
