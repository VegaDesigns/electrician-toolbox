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
export function createProblemReport(draft: ReportDraft, info: AppReportInfo): string {
  return [
    `${info.appName} — feedback`,
    `Tool: ${draft.tool.trim() || "General"}`,
    "", "What happened / steps to repeat:", draft.details.trim(),
    "", "What I expected:", draft.expected.trim() || "Not provided",
    "", "App information:",
    `Version: ${info.version}${info.build ? ` (build ${info.build})` : ""}`,
    `Platform: ${info.platform} ${info.osVersion}`.trim(),
    `Preview / build: ${info.environment}`,
  ].join("\n");
}
