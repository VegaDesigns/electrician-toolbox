import { translate, type Language } from "../../i18n/core";

export type AppReportInfo = {
  appName: string;
  version: string;
  build: string | null;
  platform: string;
  osVersion: string;
  environment: string;
};
export type ReportDraft = { tool: string; details: string; expected: string };

/** Only explicit form fields and displayed app metadata; never reads saved work. */
export function createProblemReport(draft: ReportDraft, info: AppReportInfo, language: Language = "en"): string {
  const t = (source: string) => translate(source, {}, language);
  return [
    `${info.appName} — ${t("feedback")}`,
    `${t("Tool")}: ${t(draft.tool.trim() || "General")}`,
    "", `${t("What happened / steps to repeat")}:`, draft.details.trim(),
    "", `${t("What I expected")}:`, draft.expected.trim() || t("Not provided"),
    "", `${t("App information")}:`,
    `${t("Version")}: ${info.version}${info.build ? ` (${t("build")} ${info.build})` : ""}`,
    `${t("Platform")}: ${info.platform} ${info.osVersion}`.trim(),
    `${t("Preview / build")}: ${t(info.environment)}`,
  ].join("\n");
}
