import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  BUILT_IN_PANEL_SCHEMES,
  makeConductorColor,
  type PanelColorScheme,
  type Phase,
} from "../panelColors/phase";

const STORAGE_KEY = "electrician-toolbox:panel-colors:v1";

export type PanelColorPreferences = {
  customSchemes: PanelColorScheme[];
  selectedSchemeId: string;
};

export const DEFAULT_PANEL_COLOR_PREFERENCES: PanelColorPreferences = {
  customSchemes: [],
  selectedSchemeId: BUILT_IN_PANEL_SCHEMES[0].id,
};

export async function loadPanelColorPreferences(): Promise<PanelColorPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PANEL_COLOR_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<PanelColorPreferences>;
    const customSchemes = Array.isArray(parsed.customSchemes)
      ? parsed.customSchemes.filter(isPanelColorScheme)
      : [];
    const availableIds = new Set([
      ...BUILT_IN_PANEL_SCHEMES.map(({ id }) => id),
      ...customSchemes.map(({ id }) => id),
    ]);

    return {
      customSchemes,
      selectedSchemeId:
        typeof parsed.selectedSchemeId === "string" &&
        availableIds.has(parsed.selectedSchemeId)
          ? parsed.selectedSchemeId
          : DEFAULT_PANEL_COLOR_PREFERENCES.selectedSchemeId,
    };
  } catch {
    return DEFAULT_PANEL_COLOR_PREFERENCES;
  }
}

export async function savePanelColorPreferences(
  preferences: PanelColorPreferences,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function createCustomPanelScheme(input: {
  colors: Record<"A" | "B" | "C" | "ground" | "neutral", string>;
  name: string;
  voltageSystem: string;
}): PanelColorScheme {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isBuiltIn: false,
    isQuickChoice: false,
    name: input.name.trim(),
    voltageSystem: input.voltageSystem.trim() || "Custom",
    configurationLabel: "3Ø custom • Standard branch panel",
    phaseOrder: ["A", "B", "C"],
    colors: {
      A: makeConductorColor(input.colors.A),
      B: makeConductorColor(input.colors.B),
      C: makeConductorColor(input.colors.C),
      neutral: makeConductorColor(input.colors.neutral),
      ground: makeConductorColor(input.colors.ground),
    },
  };
}

function isPanelColorScheme(value: unknown): value is PanelColorScheme {
  if (!value || typeof value !== "object") return false;
  const scheme = value as PanelColorScheme;
  const keys: (Phase | "ground" | "neutral")[] = [
    ...(Array.isArray(scheme.phaseOrder) ? scheme.phaseOrder : []),
    "neutral",
    "ground",
  ];

  return (
    typeof scheme.id === "string" &&
    typeof scheme.name === "string" &&
    typeof scheme.voltageSystem === "string" &&
    scheme.isBuiltIn === false &&
    scheme.isQuickChoice === false &&
    typeof scheme.configurationLabel === "string" &&
    Array.isArray(scheme.phaseOrder) &&
    scheme.phaseOrder.length > 0 &&
    !!scheme.colors &&
    keys.every((key) => {
      const color = scheme.colors[key];
      return (
        !!color &&
        typeof color.name === "string" &&
        typeof color.hex === "string" &&
        typeof color.textHex === "string"
      );
    })
  );
}
