import AsyncStorage from "@react-native-async-storage/async-storage";

const CALC_HISTORY_KEY = "electrician-toolbox:calc-history:v1";
const MAX_HISTORY_ITEMS = 50;

export type CalcHistoryItem = {
  id: string;
  expression: string;
  result: string;
  createdAt: number;
};

export async function loadCalcHistory(): Promise<CalcHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CALC_HISTORY_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCalcHistoryItem);
  } catch {
    return [];
  }
}

export async function saveCalcHistoryItem(
  item: CalcHistoryItem,
): Promise<CalcHistoryItem[]> {
  const current = await loadCalcHistory();

  const next = [item, ...current]
    .filter((entry, index, arr) => {
      return arr.findIndex((x) => x.id === entry.id) === index;
    })
    .slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(next));

  return next;
}

export async function deleteCalcHistoryItem(
  id: string,
): Promise<CalcHistoryItem[]> {
  const current = await loadCalcHistory();
  const next = current.filter((item) => item.id !== id);

  await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(next));

  return next;
}

export async function clearCalcHistory(): Promise<void> {
  await AsyncStorage.removeItem(CALC_HISTORY_KEY);
}

export function createCalcHistoryItem(
  expression: string,
  result: string,
): CalcHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expression,
    result,
    createdAt: Date.now(),
  };
}

function isCalcHistoryItem(value: unknown): value is CalcHistoryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CalcHistoryItem;

  return (
    typeof item.id === "string" &&
    typeof item.expression === "string" &&
    typeof item.result === "string" &&
    typeof item.createdAt === "number"
  );
}
