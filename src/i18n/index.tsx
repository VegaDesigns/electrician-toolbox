import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { getLocales, useLocales } from "expo-localization";
import { Platform } from "react-native";
import { useAppTheme } from "../theme";
import { resolveLanguage, translate, type Language, type LanguagePreference, type TranslationParams } from "./core";

type I18nValue = { language: Language; locale: string; preference: LanguagePreference; setLanguage: (language: LanguagePreference) => void; t: (source: string, params?: TranslationParams) => string };
const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { preferences, setAppearance } = useAppTheme();
  const locales = useLocales();
  const preference = preferences.language ?? "system";
  const language = resolveLanguage(preference, locales.map(locale => locale.languageTag));
  const value = useMemo<I18nValue>(() => ({
    language, locale: language === "es" ? "es-US" : "en-US", preference,
    setLanguage: next => setAppearance({ language: next }),
    t: (source, params) => translate(source, params, language),
  }), [language, preference, setAppearance]);
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") document.documentElement.lang = language;
  }, [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (context) return context;
  // Startup recovery runs before preferences can safely be read; use device language there.
  const language = resolveLanguage("system", getLocales().map(locale => locale.languageTag));
  return { language, locale: language === "es" ? "es-US" : "en-US", preference: "system", setLanguage: () => {}, t: (source, params) => translate(source, params, language) };
}
export type { Language, LanguagePreference, TranslationParams } from "./core";
