import type { Precision } from "./measure";

export type HistoryFormat = "standard" | "ft-in" | "rounded-in" | "exact-in" | "decimal-ft";
export type CalcHistoryResultKind = "number" | "measure";
export type CalcHistoryItem = {
  id: string;
  expression: string;
  result: string;
  cleanedExpression?: string;
  createdAt: number;
  resultKind?: CalcHistoryResultKind;
  rawValue?: number;
  isFavorite?: boolean;
  resultFormat?: HistoryFormat;
  precision?: Precision;
};

export function retainHistory(items: CalcHistoryItem[], recentLimit = 50): CalcHistoryItem[] {
  const seen = new Set<string>();
  let recent = 0;
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    if (item.isFavorite) return true;
    return recent++ < recentLimit;
  });
}

// Undo preserves newer work and favorite changes.
export function restoreHistory(current: CalcHistoryItem[], removed: CalcHistoryItem[]): CalcHistoryItem[] {
  const ids = new Set(current.map((item) => item.id));
  return retainHistory([...current, ...removed.filter((item) => !ids.has(item.id))]
    .sort((a, b) => b.createdAt - a.createdAt));
}
