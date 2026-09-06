import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Precision } from "../calc/measure";

const PREFERENCES_KEY = "electrician-toolbox:preferences:v1";

export type WorkpadPreferences = {
  precision: Precision;
};

export const DEFAULT_WORKPAD_PREFERENCES: WorkpadPreferences = {
  precision: 16,
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
  return (
    value === "none" ||
    value === 2 ||
    value === 4 ||
    value === 8 ||
    value === 16 ||
    value === 32
  );
}
