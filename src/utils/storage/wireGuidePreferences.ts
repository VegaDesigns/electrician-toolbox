import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_AMPACITY_CONDITIONS,
  getAmpacityRows,
  type AmbientBand,
  type ConductorCountBand,
  type ConductorMaterial,
  type LugRating,
  type WireSize,
} from "../wireGuide/ampacity";

const STORAGE_KEY = "electrician-toolbox:wire-guide:v1";

export type WireGuidePreferences = {
  ambientBand: AmbientBand;
  conductorCountBand: ConductorCountBand;
  lugRating: LugRating;
  material: ConductorMaterial;
  size: WireSize;
};

export const DEFAULT_WIRE_GUIDE_PREFERENCES: WireGuidePreferences = {
  ...DEFAULT_AMPACITY_CONDITIONS,
  material: "copper",
  size: "12",
};

export async function loadWireGuidePreferences(): Promise<WireGuidePreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIRE_GUIDE_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<WireGuidePreferences>;
    const material = parsed.material === "aluminum" ? "aluminum" : "copper";
    const size = getAmpacityRows(material).some(({ size: option }) => option === parsed.size)
      ? parsed.size as WireSize
      : "12";
    return {
      ambientBand: isAmbientBand(parsed.ambientBand) ? parsed.ambientBand : "78-86",
      conductorCountBand: isConductorBand(parsed.conductorCountBand) ? parsed.conductorCountBand : "1-3",
      lugRating: isLugRating(parsed.lugRating) ? parsed.lugRating : "unknown",
      material,
      size,
    };
  } catch {
    return DEFAULT_WIRE_GUIDE_PREFERENCES;
  }
}

export async function saveWireGuidePreferences(preferences: WireGuidePreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function isAmbientBand(value: unknown): value is AmbientBand {
  return ["50-or-less", "51-59", "60-68", "69-77", "78-86", "87-95", "96-104", "105-113", "114-122", "123-131", "132-140", "141-149", "150-158", "159-167", "168-176", "177-185"].includes(String(value));
}

function isConductorBand(value: unknown): value is ConductorCountBand {
  return ["1-3", "4-6", "7-9", "10-20", "21-30", "31-40", "41+"].includes(String(value));
}

function isLugRating(value: unknown): value is LugRating {
  return ["unknown", "60", "75", "90"].includes(String(value));
}
