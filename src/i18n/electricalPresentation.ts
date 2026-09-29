import type { PanelColorScheme } from "../utils/panelColors/phase";

type LabelTranslator = (source: string) => string;

const STANDARD_COLOR_NAMES = new Set([
  "Black", "Red", "Blue", "Brown", "Orange", "Yellow", "Purple", "Pink",
  "White", "Gray", "Green", "Bare", "Green / Bare", "Green / Yellow", "Unspecified",
]);

/** Legacy custom color text is user data; only established color labels are localized. */
export function panelColorLabel(name: string, t: LabelTranslator): string {
  return STANDARD_COLOR_NAMES.has(name) ? t(name) : name;
}

/** A job named “Black” or “Hospital Project” must never change with the app language. */
export function panelSchemeLabel(scheme: Pick<PanelColorScheme, "isBuiltIn" | "name">, t: LabelTranslator): string {
  return scheme.isBuiltIn ? t(scheme.name) : scheme.name;
}
