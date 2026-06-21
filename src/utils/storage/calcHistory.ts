import AsyncStorage from "@react-native-async-storage/async-storage";

const CALC_HISTORY_KEY = "electrician-toolbox:calc-history:v1";
const MAX_HISTORY_ITEMS = 50;

export type CalcHistoryResultKind = "number" | "measure";

export type CalcHistoryItem = {
  id: string;
  expression: string;
  result: string;
  createdAt: number;

  // Optional so older saved history items do not break.
  resultKind?: CalcHistoryResultKind;
  rawValue?: number;
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
  rawResult?: {
    kind: CalcHistoryResultKind;
    value: number;
  },
): CalcHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expression,
    result,
    createdAt: Date.now(),
    resultKind: rawResult?.kind,
    rawValue: rawResult?.value,
  };
}

function isCalcHistoryItem(value: unknown): value is CalcHistoryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CalcHistoryItem;

  const baseIsValid =
    typeof item.id === "string" &&
    typeof item.expression === "string" &&
    typeof item.result === "string" &&
    typeof item.createdAt === "number";

  if (!baseIsValid) return false;

  const hasNoRawFields =
    item.resultKind === undefined && item.rawValue === undefined;

  const hasValidRawFields =
    (item.resultKind === "number" || item.resultKind === "measure") &&
    typeof item.rawValue === "number" &&
    Number.isFinite(item.rawValue);

  return hasNoRawFields || hasValidRawFields;
}
