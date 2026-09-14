import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "electrician-toolbox:trade-talk:v1";
const MAX_RECENT = 8;

export type TradeTalkPreferences = {
  favoriteIds: string[];
  recentIds: string[];
};

export const DEFAULT_TRADE_TALK_PREFERENCES: TradeTalkPreferences = {
  favoriteIds: [],
  recentIds: [],
};

export async function loadTradeTalkPreferences(): Promise<TradeTalkPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return DEFAULT_TRADE_TALK_PREFERENCES;
  const parsed = JSON.parse(raw) as Partial<TradeTalkPreferences>;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw Error("Unreadable preferences");
  return {
    favoriteIds: stringArray(parsed.favoriteIds),
    recentIds: stringArray(parsed.recentIds).slice(0, MAX_RECENT),
  };
}

export async function saveTradeTalkPreferences(preferences: TradeTalkPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function addRecentTradeTalkEntry(current: string[], id: string): string[] {
  return [id, ...current.filter((candidate) => candidate !== id)].slice(0, MAX_RECENT);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
