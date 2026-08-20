import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Precision } from "../calc/measure";

const PREFERENCES_KEY = "electrician-toolbox:preferences:v1";

export type RoundMode = "nearest" | "up";

export type WorkpadPreferences = {
  precision: Precision;
  roundMode: RoundMode;
};

export const DEFAULT_WORKPAD_PREFERENCES: WorkpadPreferences = {
  precision: 16,
  roundMode: "nearest",
};

export async function loadWorkpadPreferences(): Promise<WorkpadPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_WORKPAD_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<WorkpadPreferences>;

    return {
      precision: isPrecision(parsed.precision)
        ? parsed.precision
        : DEFAULT_WORKPAD_PREFERENCES.precision,
      roundMode:
        parsed.roundMode === "nearest" || parsed.roundMode === "up"
          ? parsed.roundMode
          : DEFAULT_WORKPAD_PREFERENCES.roundMode,
    };
  } catch {
    return DEFAULT_WORKPAD_PREFERENCES;
  }
}

export async function saveWorkpadPreferences(
  preferences: WorkpadPreferences,
): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

function isPrecision(value: unknown): value is Precision {
  return value === 2 || value === 4 || value === 8 || value === 16;
}
