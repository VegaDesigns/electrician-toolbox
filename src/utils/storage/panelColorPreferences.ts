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
  colors: Record<"ground" | "neutral" | "phase1" | "phase2" | "phase3", string>;
  id?: string;
  name: string;
  panelType: "single-phase" | "three-phase";
  voltageSystem: string;
}): PanelColorScheme {
  const isSinglePhase = input.panelType === "single-phase";

  return {
    id: input.id ?? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isBuiltIn: false,
    isQuickChoice: false,
    name: input.name.trim(),
    voltageSystem: input.voltageSystem,
    configurationLabel: isSinglePhase
      ? "1Ø • Standard branch panel"
      : `${input.voltageSystem.includes("Y/") ? "3Ø wye" : input.voltageSystem.includes("Δ") ? "3Ø delta" : "3Ø"} • Standard branch panel`,
    phaseOrder: isSinglePhase ? ["L1", "L2"] : ["A", "B", "C"],
    colors: isSinglePhase
      ? {
          L1: makeConductorColor(input.colors.phase1),
          L2: makeConductorColor(input.colors.phase2),
          neutral: makeConductorColor(input.colors.neutral),
          ground: makeConductorColor(input.colors.ground),
        }
      : {
          A: makeConductorColor(input.colors.phase1),
          B: makeConductorColor(input.colors.phase2),
          C: makeConductorColor(input.colors.phase3),
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
