import { BUILT_IN_PANEL_SCHEMES, type PanelColorScheme } from "./phase";

export type PanelColorPreferences = {
  customSchemes: PanelColorScheme[];
  selectedSchemeId: string;
};

// Never silently discard saved work and overwrite it with defaults.
export function decodePanelPreferences(raw: string): PanelColorPreferences {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Unreadable panel presets");
  const value = parsed as PanelColorPreferences;
  if (!Array.isArray(value.customSchemes) || !value.customSchemes.every(isPanelColorScheme)) {
    throw new Error("Unsupported saved panel setup");
  }
  const ids = [...BUILT_IN_PANEL_SCHEMES.map((scheme) => scheme.id), ...value.customSchemes.map((scheme) => scheme.id)];
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate panel preset identifiers");
  if (typeof value.selectedSchemeId !== "string" || !ids.includes(value.selectedSchemeId)) {
    throw new Error("Selected panel preset is unavailable");
  }
  return value;
}

function isPanelColorScheme(value: unknown): value is PanelColorScheme {
  if (!value || typeof value !== "object") return false;
  const scheme = value as PanelColorScheme;
  const order = JSON.stringify(scheme.phaseOrder);
  if (order !== '["A","B","C"]' && order !== '["L1","L2"]') return false;
  if (typeof scheme.id !== "string" || !scheme.id || typeof scheme.name !== "string" ||
      typeof scheme.voltageSystem !== "string" || typeof scheme.configurationLabel !== "string" ||
      scheme.isBuiltIn !== false || scheme.isQuickChoice !== false ||
      (scheme.panelLabel !== undefined && typeof scheme.panelLabel !== "string") || !scheme.colors) return false;
  return [...scheme.phaseOrder, "neutral" as const, "ground" as const].every((key) => {
    const color = scheme.colors[key];
    return !!color && typeof color.name === "string" && !!color.name.trim() &&
      /^#[0-9a-f]{6}$/i.test(color.hex) && /^#[0-9a-f]{6}$/i.test(color.textHex);
  });
}
