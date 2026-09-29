import { commonEs } from "./catalogs/common";
import { electricalEs } from "./catalogs/electrical";
import { jobsiteEs } from "./catalogs/jobsite";
import { measurementsEs } from "./catalogs/measurements";
import { supportEs } from "./catalogs/support";

export type Language = "en" | "es";
export type LanguagePreference = "system" | Language;
export type TranslationParams = Record<string, string | number>;
export const spanishCatalog: Readonly<Record<string, string>> = { ...measurementsEs, ...electricalEs, ...jobsiteEs, ...supportEs, ...commonEs };

export function resolveLanguage(preference: LanguagePreference | undefined, deviceLanguages: readonly string[]): Language {
  if (preference === "en" || preference === "es") return preference;
  for (const tag of deviceLanguages) {
    const language = tag.toLowerCase().split(/[-_]/)[0];
    if (language === "en" || language === "es") return language;
  }
  return "en";
}

/** Presentation only. Never pass user-authored notes, persisted IDs, or equations here. */
export function translate(source: string, params: TranslationParams = {}, language: Language = "en"): string {
  const template = language === "es" && Object.hasOwn(spanishCatalog, source) ? spanishCatalog[source] : source;
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => Object.hasOwn(params, key) ? String(params[key]) : placeholder);
}
