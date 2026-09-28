import type { CalcKey } from "./engine";

export type EquationSelection = { start: number; end: number };
export type EquationEdit = { text: string; selection: EquationSelection };

export function clampSelection(text: string, selection: EquationSelection): EquationSelection {
  const start = Math.max(0, Math.min(text.length, selection.start));
  return { start, end: Math.max(start, Math.min(text.length, selection.end)) };
}

export function replaceSelection(edit: EquationEdit, inserted: string): EquationEdit {
  const { start, end } = clampSelection(edit.text, edit.selection);
  const caret = start + inserted.length;
  return {
    text: edit.text.slice(0, start) + inserted + edit.text.slice(end),
    selection: { start: caret, end: caret },
  };
}

/** The native text field chooses the caret; the familiar keypad edits there. */
export function editEquationKey(edit: EquationEdit, key: CalcKey): EquationEdit {
  if (key === "C") return { text: "", selection: { start: 0, end: 0 } };
  if (key === "=" || key === "FRAC") return edit;
  if (key === "⌫") {
    const selection = clampSelection(edit.text, edit.selection);
    if (selection.start === selection.end) selection.start = Math.max(0, selection.start - 1);
    return replaceSelection({ ...edit, selection }, "");
  }
  const inserted = key === "IN" ? "in" : key === "FT" ? "ft"
    : ["+", "-", "×", "÷"].includes(key) ? ` ${key} ` : key;
  return replaceSelection(edit, inserted);
}

/** Fractions are inserted at the caret, with a mixed-number space when needed. */
export function editEquationFraction(edit: EquationEdit, fraction: string): EquationEdit {
  const selection = clampSelection(edit.text, edit.selection);
  if (selection.start === selection.end) {
    for (const match of edit.text.matchAll(/\d+\/\d+/g)) {
      const start = match.index;
      const end = start + match[0].length;
      if (selection.start >= start && selection.start <= end) {
        return replaceSelection({ ...edit, selection: { start, end } }, fraction);
      }
    }
  }
  const before = edit.text.slice(0, selection.start);
  const after = edit.text.slice(selection.end);
  return replaceSelection(edit, `${/\d$/.test(before) ? " " : ""}${fraction}${/^\d/.test(after) ? " " : ""}`);
}
