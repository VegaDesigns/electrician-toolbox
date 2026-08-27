import AsyncStorage from "@react-native-async-storage/async-storage";

const BENDING_PREFERENCES_KEY = "electrician-toolbox:bending-preferences:v1";

export type ConduitSize = "1/2" | "3/4" | "1";

export type BendingPreferences = {
  conduitSize: ConduitSize;
  deducts: Record<ConduitSize, number>;
};

export const DEFAULT_BENDING_PREFERENCES: BendingPreferences = {
  conduitSize: "3/4",
  deducts: {
    "1/2": 5,
    "3/4": 6,
    "1": 8,
  },
};

export async function loadBendingPreferences(): Promise<BendingPreferences> {
  try {
    const raw = await AsyncStorage.getItem(BENDING_PREFERENCES_KEY);
    if (!raw) return DEFAULT_BENDING_PREFERENCES;

    const parsed = JSON.parse(raw) as Partial<BendingPreferences>;
    const conduitSize = isConduitSize(parsed.conduitSize)
      ? parsed.conduitSize
      : DEFAULT_BENDING_PREFERENCES.conduitSize;

    return {
      conduitSize,
      deducts: {
        "1/2": validDeduct(parsed.deducts?.["1/2"], 5),
        "3/4": validDeduct(parsed.deducts?.["3/4"], 6),
        "1": validDeduct(parsed.deducts?.["1"], 8),
      },
    };
  } catch {
    return DEFAULT_BENDING_PREFERENCES;
  }
}

export async function saveBendingPreferences(
  preferences: BendingPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    BENDING_PREFERENCES_KEY,
    JSON.stringify(preferences),
  );
}

function isConduitSize(value: unknown): value is ConduitSize {
  return value === "1/2" || value === "3/4" || value === "1";
}

function validDeduct(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
