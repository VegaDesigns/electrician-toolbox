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

  // Saved/pinned calculation.
  isFavorite?: boolean;
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

  if (next.length === 0) {
    await AsyncStorage.removeItem(CALC_HISTORY_KEY);
    return [];
  }

  await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(next));

  return next;
}

export async function toggleCalcHistoryFavorite(
  id: string,
): Promise<CalcHistoryItem[]> {
  const current = await loadCalcHistory();

  const target = current.find((item) => item.id === id);

  if (!target) {
    return current;
  }

  const isCurrentlyFavorite = !!target.isFavorite;

  const updatedTarget: CalcHistoryItem = {
    ...target,
    isFavorite: !isCurrentlyFavorite,

    // If the user removes it from Saved, treat it like it just came back
    // into Recent so it appears near the top of the history list.
    createdAt: isCurrentlyFavorite ? Date.now() : target.createdAt,
  };

  const withoutTarget = current.filter((item) => item.id !== id);

  const next = [updatedTarget, ...withoutTarget].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(next));

  return next;
}

// Clears only normal recent history.
// Favorite/saved calculations stay.
export async function clearCalcHistory(): Promise<CalcHistoryItem[]> {
  const current = await loadCalcHistory();
  const favorites = current.filter((item) => item.isFavorite);

  if (favorites.length === 0) {
    await AsyncStorage.removeItem(CALC_HISTORY_KEY);
    return [];
  }

  await AsyncStorage.setItem(CALC_HISTORY_KEY, JSON.stringify(favorites));

  return favorites;
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
    isFavorite: false,
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

  const favoriteIsValid =
    item.isFavorite === undefined || typeof item.isFavorite === "boolean";

  if (!favoriteIsValid) return false;

  const hasNoRawFields =
    item.resultKind === undefined && item.rawValue === undefined;

  const hasValidRawFields =
    (item.resultKind === "number" || item.resultKind === "measure") &&
    typeof item.rawValue === "number" &&
    Number.isFinite(item.rawValue);

  return hasNoRawFields || hasValidRawFields;
}
