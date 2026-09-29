import { translate, type Language } from "../../i18n/core";
import { measurementsEs } from "../../i18n/catalogs/measurements";

// The bending engine deliberately stays language-independent. Match only its
// audited presentation templates here, never arbitrary substrings or saved input.
const templates = Object.keys(measurementsEs)
  .filter(key => key.includes("{{"))
  .sort((a, b) => b.replace(/\{\{\w+\}\}/g, "").length - a.replace(/\{\{\w+\}\}/g, "").length)
  .map(source => {
    const names: string[] = [];
    const escaped = source.split(/(\{\{\w+\}\})/g).map(part => {
      const placeholder = part.match(/^\{\{(\w+)\}\}$/);
      if (placeholder) { names.push(placeholder[1]); return "([\\s\\S]+?)"; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
    return { source, names, expression: new RegExp(`^${escaped}$`) };
  });

export function translateMeasurementText(source: string, language: Language): string {
  if (language !== "es" || !/[a-zA-Z]{2}/.test(source)) return source;
  const exact = translate(source, {}, language);
  if (exact !== source || Object.hasOwn(measurementsEs, source)) return exact;
  for (const template of templates) {
    const match = source.match(template.expression);
    if (!match) continue;
    const params: Record<string, string> = {};
    template.names.forEach((name, i) => {
      // Only explicit app-authored nested labels/instructions are translated.
      // Values, equations and quoted unrecognized input are always untouched.
      params[name] = ["label", "instruction", "extra"].includes(name)
        ? translateMeasurementText(match[i + 1], language) : match[i + 1];
    });
    return translate(template.source, params, language);
  }
  return source;
}
