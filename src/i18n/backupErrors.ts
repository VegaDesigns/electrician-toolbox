import { translate, type Language } from "./core";

/** Translate only messages owned by the backup validator, not imported file content. */
export function localizeBackupError(message: string, language: Language): string {
  const match = /^The saved-data section “([^”]+)” (is damaged or too large|is not supported)\. No data was changed\.$/.exec(message);
  if (match) {
    const section = translate(match[1], {}, language);
    return translate(`The saved-data section “{{section}}” ${match[2]}. No data was changed.`, { section }, language);
  }
  return translate(message, {}, language);
}
