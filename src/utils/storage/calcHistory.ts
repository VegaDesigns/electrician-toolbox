import AsyncStorage from "@react-native-async-storage/async-storage";
import { retainHistory, restoreHistory, type CalcHistoryItem } from "../calc/historyModel";
export type { CalcHistoryItem, CalcHistoryResultKind } from "../calc/historyModel";

const CALC_HISTORY_KEY = "electrician-toolbox:calc-history:v1";
let writes: Promise<unknown> = Promise.resolve();

async function readHistory(): Promise<CalcHistoryItem[]> {
  const raw = await AsyncStorage.getItem(CALC_HISTORY_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Unable to read calculation history");
  return parsed.filter(isCalcHistoryItem);
}

export async function loadCalcHistory(): Promise<CalcHistoryItem[]> {
  await writes.catch(() => {});
  return readHistory();
}

// Serialize read/modify/write so quick taps cannot overwrite each other's saves.
function mutateHistory(transform: (items: CalcHistoryItem[]) => CalcHistoryItem[]) {
  const operation = writes.catch(() => {}).then(async () => {
    const next = transform(await readHistory());
    await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(next));
    return next;
  });
  writes = operation;
  return operation;
}

export function saveCalcHistoryItem(item: CalcHistoryItem) {
  return mutateHistory((items) => retainHistory([item, ...items]));
}

export function updateCalcHistoryPresentation(
  id: string,
  presentation: Pick<CalcHistoryItem, "result" | "resultFormat" | "precision">,
) {
  return mutateHistory((items) => items.map((item) =>
    item.id === id ? { ...item, ...presentation } : item));
}

export function deleteCalcHistoryItem(id: string) {
  return mutateHistory((items) => items.filter((item) => item.id !== id));
}

export function restoreCalcHistoryItems(removed: CalcHistoryItem[]) {
  return mutateHistory((items) => restoreHistory(items, removed));
}

export function toggleCalcHistoryFavorite(id: string) {
  return mutateHistory((items) => retainHistory(items.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)));
}

export function clearCalcHistory() {
  return mutateHistory((items) => items.filter((item) => item.isFavorite));
}

export function createCalcHistoryItem(
  expression: string,
  result: string,
  rawResult?: { kind: "number" | "measure"; value: number },
  cleanedExpression?: string,
): CalcHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expression, result, cleanedExpression, createdAt: Date.now(),
    resultKind: rawResult?.kind, rawValue: rawResult?.value, isFavorite: false,
  };
}

function isCalcHistoryItem(value: unknown): value is CalcHistoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CalcHistoryItem;
  if (typeof item.id !== "string" || typeof item.expression !== "string" ||
      typeof item.result !== "string" || !Number.isFinite(item.createdAt)) return false;
  if (item.isFavorite !== undefined && typeof item.isFavorite !== "boolean") return false;
  if (item.cleanedExpression !== undefined && typeof item.cleanedExpression !== "string") return false;
  if (item.precision !== undefined && !["none", 2, 4, 8, 16, 32].includes(item.precision)) return false;
  if (item.resultFormat !== undefined &&
      !["standard", "ft-in", "rounded-in", "exact-in", "decimal-ft"].includes(item.resultFormat)) return false;
  return (item.resultKind === undefined && item.rawValue === undefined) ||
    ((item.resultKind === "number" || item.resultKind === "measure") &&
      typeof item.rawValue === "number" && Number.isFinite(item.rawValue));
}
