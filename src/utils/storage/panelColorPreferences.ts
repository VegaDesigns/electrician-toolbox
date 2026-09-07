import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  BUILT_IN_PANEL_SCHEMES,
  makeConductorColor,
  type PanelColorScheme,
} from "../panelColors/phase";
import { decodePanelPreferences, type PanelColorPreferences } from "../panelColors/presetValidation";
export type { PanelColorPreferences } from "../panelColors/presetValidation";

const STORAGE_KEY = "electrician-toolbox:panel-colors:v1";

export const DEFAULT_PANEL_COLOR_PREFERENCES: PanelColorPreferences = {
  customSchemes: [],
  selectedSchemeId: BUILT_IN_PANEL_SCHEMES[0].id,
};

export async function loadPanelColorPreferences(): Promise<PanelColorPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? decodePanelPreferences(raw) : DEFAULT_PANEL_COLOR_PREFERENCES;
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
  panelLabel?: string;
  panelType: "single-phase" | "three-phase";
  voltageSystem: string;
}): PanelColorScheme {
  const isSinglePhase = input.panelType === "single-phase";

  return {
    id: input.id ?? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isBuiltIn: false,
    isQuickChoice: false,
    name: input.name.trim(),
    panelLabel: input.panelLabel?.trim() || undefined,
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
