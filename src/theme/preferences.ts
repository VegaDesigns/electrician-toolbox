const studioThemes = ["forest", "ocean", "clay", "iris", "graphite"] as const;
const jobsiteThemes = ["tool-red", "jobsite-yellow", "electric-blue", "hi-vis-green", "caution-orange", "steel"] as const;
export const themeIds = [...studioThemes, ...jobsiteThemes] as const;
export const themeCollections = [
  { name: "Jobsite", themes: jobsiteThemes },
  { name: "Studio", themes: studioThemes },
] as const;
export type ThemeId = (typeof themeIds)[number];
export type AppearanceMode = "system" | "light" | "dark";
export type ResolvedMode = Exclude<AppearanceMode, "system">;
export type AppearancePreferences = { version: 1; themeId: ThemeId; mode: AppearanceMode };
export const APPEARANCE_KEY = "electrician-toolbox:appearance:v1";
export const defaultAppearance: AppearancePreferences = { version: 1, themeId: "forest", mode: "system" };
export function parseAppearance(raw: string | null): AppearancePreferences {
  if (!raw) return { ...defaultAppearance };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return { ...defaultAppearance };
    const item = value as Partial<AppearancePreferences>;
    if (item.version !== 1) return { ...defaultAppearance };
    return { version: 1, themeId: themeIds.includes(item.themeId as ThemeId) ? item.themeId! : "forest", mode: item.mode === "light" || item.mode === "dark" ? item.mode : "system" };
  } catch { return { ...defaultAppearance }; }
}
export function resolveMode(mode: AppearanceMode, system: string | null | undefined): ResolvedMode {
  return mode === "system" ? (system === "dark" ? "dark" : "light") : mode;
}
export interface AppearanceStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown>; }
/** Serialize only appearance writes; never read or rewrite tool data. */
export function createAppearanceStore(storage: AppearanceStorage) {
  let queue: Promise<unknown> = Promise.resolve();
  return {
    async load() { return parseAppearance(await storage.getItem(APPEARANCE_KEY)); },
    save(preferences: AppearancePreferences) {
      const snapshot = JSON.stringify(preferences);
      const write = queue.catch(() => {}).then(() => storage.setItem(APPEARANCE_KEY, snapshot));
      queue = write;
      return write;
    },
  };
}
