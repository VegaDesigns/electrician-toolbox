import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Appearance, Platform, StyleSheet, useColorScheme, View } from "react-native";
import * as SystemUI from "expo-system-ui";
import { themeCatalog } from "./color";
import { createAppearanceStore, defaultAppearance, resolveMode, type AppearancePreferences } from "./preferences";

const store = createAppearanceStore(AsyncStorage);
function makeTheme(preferences: AppearancePreferences, system: string | null | undefined) {
  const mode = resolveMode(preferences.mode, system);
  const colors = themeCatalog[preferences.themeId][mode];
  return { colors, mode };
}
export type AppTheme = ReturnType<typeof makeTheme>;
type ThemeContextValue = { theme: AppTheme; preferences: AppearancePreferences; setAppearance: (next: Partial<Pick<AppearancePreferences, "themeId" | "mode">>) => void; error: string | null; retrySave: () => void; };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preferences, setPreferences] = useState(defaultAppearance);
  const current = useRef(defaultAppearance);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const theme = useMemo(() => makeTheme(preferences, system), [preferences, system]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { if (!active) return; active = false; setError("Appearance settings took too long to load. Choose a theme to save a new preference."); setReady(true); }, 5000);
    store.load().then(value => { if (!active) return; current.current = value; setPreferences(value); })
      .catch(() => { if (active) setError("Couldn’t load appearance. Choose a theme to save a new preference."); })
      .finally(() => { if (active) { clearTimeout(timer); setReady(true); } });
    return () => { active = false; clearTimeout(timer); };
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (Platform.OS !== "web") Appearance.setColorScheme(preferences.mode === "system" ? "unspecified" : preferences.mode);
    SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => {});
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.style.colorScheme = theme.mode;
      document.documentElement.style.backgroundColor = theme.colors.bg;
      document.body.style.backgroundColor = theme.colors.bg;
    }
  }, [ready, preferences.mode, theme.mode, theme.colors.bg]);
  const persist = useCallback((next: AppearancePreferences) => {
    const request = ++revision.current;
    setError(null);
    store.save(next).catch(() => { if (request === revision.current) setError("Theme changed, but couldn’t be saved. Try saving again."); });
  }, []);
  const setAppearance = useCallback((next: Partial<Pick<AppearancePreferences, "themeId" | "mode">>) => {
    const value = { ...current.current, ...next }; current.current = value; setPreferences(value); persist(value);
  }, [persist]);
  const retrySave = useCallback(() => persist(current.current), [persist]);
  const value = useMemo(() => ({ theme, preferences, setAppearance, error, retrySave }), [theme, preferences, setAppearance, error, retrySave]);
  return <ThemeContext.Provider value={value}>{ready ? children : <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg }}><ActivityIndicator color={theme.colors.primary} accessibilityLabel="Loading appearance" /></View>}</ThemeContext.Provider>;
}
export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme must be used within ThemeProvider");
  return value;
}
/** Every consuming component subscribes; changing themes never remounts a tool. */
export function defineStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: AppTheme) => T) {
  return function useThemedStyles() { const { theme } = useAppTheme(); return useMemo(() => StyleSheet.create(factory(theme)), [theme]); };
}
