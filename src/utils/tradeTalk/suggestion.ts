import { translate, type Language } from "../../i18n/core";

export const SUGGESTION_LIMITS = { term: 80, meaning: 1200, region: 80 } as const;
export type TermSuggestion = { term: string; meaning: string; region: string };

/** No persistence or transport: a suggestion is shared only after the user reviews it. */
export function validateTermSuggestion(value: TermSuggestion): string | null {
  if (!value.term.trim()) return "Enter the word or term.";
  if (!value.meaning.trim()) return "Tell us what it means.";
  if (value.term.trim().length > SUGGESTION_LIMITS.term || value.meaning.trim().length > SUGGESTION_LIMITS.meaning || value.region.trim().length > SUGGESTION_LIMITS.region) {
    return "This suggestion is too long. Shorten the fields and try again.";
  }
  return null;
}

export function formatTermSuggestion(value: TermSuggestion, language: Language = "en"): string {
  const error = validateTermSuggestion(value);
  if (error) throw new Error(error);
  const t = (source: string) => translate(source, {}, language);
  return [
    "Electrician Toolbox — " + t("Term suggestion"),
    "",
    t("Word or term") + ": " + value.term.trim(),
    "",
    t("Suggested meaning") + ":",
    value.meaning.trim(),
    ...(value.region.trim() ? ["", t("Country or region") + ": " + value.region.trim()] : []),
    "",
    t("Community suggestion — not reviewed or added to the dictionary."),
  ].join("\n");
}
