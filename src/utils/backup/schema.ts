import { themeIds } from "../../theme/preferences";
import { ANGLES, BENDS } from "../bending/bending";
import { decodeLists } from "../jobBoard/materialLists";
import { decodePanelPreferences } from "../panelColors/presetValidation";
import { getAmpacityRows } from "../wireGuide/ampacity";

export const BACKUP_FORMAT = "electrician-toolbox-backup";
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export const DATA_KEYS = [
  "electrician-toolbox:material-lists:v1", "electrician-toolbox:panel-colors:v1",
  "electrician-toolbox:calc-history:v1", "electrician-toolbox:preferences:v1",
  "bending-suite-v1", "electrician-toolbox:wire-guide:v1",
  "electrician-toolbox:trade-talk:v1", "electrician-toolbox:appearance:v1",
  "electrician-toolbox:job-board:v1",
] as const;
export type DataKey = typeof DATA_KEYS[number];
export type BackupRecords = Record<DataKey, string | null>;
export type ToolboxBackup = {
  format: typeof BACKUP_FORMAT; version: 1; createdAt: string; appVersion: string; records: BackupRecords;
};
type ObjectValue = Record<string, unknown>;
function object(value: unknown): value is ObjectValue { return !!value && typeof value === "object" && !Array.isArray(value); }
function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === "string"); }
const precisions = ["none", 2, 4, 8, 16, 32];
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const oneOf = (value: unknown, options: readonly string[]) => typeof value === "string" && options.includes(value);
function check(condition: unknown, detail = "The backup contains unsupported or damaged saved data."): asserts condition {
  if (!condition) throw new Error(detail);
}
export function utf8Length(text: string) {
  let length = 0;
  for (const character of text) { const code = character.codePointAt(0)!; length += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4; }
  return length;
}
function checkTree(value: unknown) {
  let nodes = 0;
  function visit(item: unknown, depth: number) {
    check(++nodes <= 100000 && depth <= 24, "The backup is too complex to safely open.");
    if (typeof item === "string") check(item.length <= 100000, "A saved field in this backup is too large.");
    if (Array.isArray(item)) item.forEach(child => visit(child, depth + 1));
    else if (object(item)) Object.entries(item).forEach(([key, child]) => {
      check(!["__proto__", "prototype", "constructor"].includes(key)); visit(child, depth + 1);
    });
  }
  visit(value, 0);
}
/** Exact key allowlist: an imported file can never write arbitrary app storage. */
export function validateRecordEnvelope(value: unknown): asserts value is BackupRecords {
  check(object(value) && Object.keys(value).length === DATA_KEYS.length, "The backup is missing a saved-data section.");
  check(DATA_KEYS.every(key => Object.hasOwn(value, key) && (value[key] === null || typeof value[key] === "string")), "The backup has an unsupported saved-data section.");
}
function validateHistory(value: unknown) {
  check(Array.isArray(value));
  const ids = new Set<string>();
  value.forEach(item => {
    check(object(item) && typeof item.id === "string" && item.id.length > 0 && !ids.has(item.id)); ids.add(item.id);
    check(typeof item.expression === "string" && typeof item.result === "string" && finite(item.createdAt));
    check(item.isFavorite === undefined || typeof item.isFavorite === "boolean");
    check(item.cleanedExpression === undefined || typeof item.cleanedExpression === "string");
    check(item.precision === undefined || precisions.includes(item.precision as string | number));
    check(item.resultFormat === undefined || oneOf(item.resultFormat, ["standard", "ft-in", "rounded-in", "exact-in", "decimal-ft"]));
    check(item.resultKind === undefined && item.rawValue === undefined ||
      oneOf(item.resultKind, ["number", "measure"]) && finite(item.rawValue));
  });
}
function validateBender(value: unknown) {
  check(object(value) && object(value.settings) && object(value.drafts));
  const settings = value.settings;
  check(finite(settings.size) && Number.isInteger(settings.size) && settings.size >= 0 && settings.size < 4);
  check(finite(settings.deduction) && settings.deduction > 0 && settings.deduction <= 48);
  check([8, 16, 32].includes(Number(settings.precision)) && typeof settings.precision === "number");
  check(oneOf(settings.method, ["field", "geometry"]) && BENDS.some(bend => bend.id === value.bend));
  for (const bend of BENDS) {
    const draft = value.drafts[bend.id]; check(object(draft));
    check(["height", "roll", "bridge", "span", "location"].every(key => typeof draft[key] === "string" && draft[key].length < 40));
    check(ANGLES.some(angle => angle === draft.angle) && (draft.center === 45 || draft.center === 60));
  }
}
export function validateRecords(records: BackupRecords) {
  for (const key of DATA_KEYS) {
    const raw = records[key];
    if (raw === null) continue;
    let value: unknown;
    try { value = JSON.parse(raw); checkTree(value); }
    catch { throw new Error(`The saved-data section “${sectionName(key)}” is damaged or too large. No data was changed.`); }
    try {
      if (key === DATA_KEYS[0]) decodeLists(raw);
      else if (key === DATA_KEYS[1]) {
        const panel = decodePanelPreferences(raw);
        for (const scheme of panel.customSchemes) {
          for (const phase of [...scheme.phaseOrder, "neutral" as const, "ground" as const]) {
            const color = scheme.colors[phase];
            check(color && typeof color.hex === "string" && typeof color.textHex === "string");
          }
        }
      }
      else if (key === DATA_KEYS[2]) validateHistory(value);
      else if (key === DATA_KEYS[3]) check(object(value) && precisions.includes(value.precision as string | number));
      else if (key === DATA_KEYS[4]) validateBender(value);
      else if (key === DATA_KEYS[5]) {
        check(object(value) && (value.material === "copper" || value.material === "aluminum"));
        check(getAmpacityRows(value.material).some(row => row.size === value.size));
        check(oneOf(value.ambientBand, ["50-or-less", "51-59", "60-68", "69-77", "78-86", "87-95", "96-104", "105-113", "114-122", "123-131", "132-140", "141-149", "150-158", "159-167", "168-176", "177-185"]));
        check(oneOf(value.conductorCountBand, ["1-3", "4-6", "7-9", "10-20", "21-30", "31-40", "41+"]));
        check(oneOf(value.lugRating, ["unknown", "60", "75", "90"]));
      } else if (key === DATA_KEYS[6]) check(object(value) && strings(value.favoriteIds) && strings(value.recentIds) && value.recentIds.length <= 8);
      else if (key === DATA_KEYS[7]) check(object(value) && value.version === 1 && themeIds.some(id => id === value.themeId) && oneOf(value.mode, ["system", "light", "dark"]));
      else {
        // Retained earlier Job Board is archived, not converted into current lists.
        check(object(value) && Array.isArray(value.jobs) && Array.isArray(value.items));
        check(value.jobs.every(job => object(job) && typeof job.id === "string" && typeof job.name === "string" && finite(job.createdAt)));
        const ids = new Set<string>();
        for (const item of value.items) {
          check(object(item) && typeof item.id === "string" && !ids.has(item.id)); ids.add(item.id);
          check(oneOf(item.kind, ["note", "material", "punch", "task"]) && oneOf(item.status, ["open", "done"]) && oneOf(item.priority, ["low", "normal", "high"]));
          check(["title", "location", "notes", "unit"].every(field => typeof item[field] === "string"));
          check(item.jobId === null || typeof item.jobId === "string");
          check(item.waitingOn === undefined || typeof item.waitingOn === "string");
          check(item.dueOn === null || typeof item.dueOn === "string" || item.dueOn === undefined && (item.due === undefined || oneOf(item.due, ["none", "today", "tomorrow"])));
          check((item.estimateMinutes === null || finite(item.estimateMinutes)) && finite(item.quantity) && finite(item.createdAt) && finite(item.updatedAt) && (item.completedAt === null || finite(item.completedAt)));
          check(Array.isArray(item.checklist) && item.checklist.every(line => object(line) && typeof line.id === "string" && typeof line.label === "string" && typeof line.done === "boolean"));
          check(Array.isArray(item.materials) && item.materials.every(line => object(line) && typeof line.id === "string" && typeof line.name === "string" && finite(line.quantity) && typeof line.unit === "string" && typeof line.collected === "boolean"));
        }
      }
    } catch { throw new Error(`The saved-data section “${sectionName(key)}” is not supported. No data was changed.`); }
  }
}
export function sectionName(key: DataKey) {
  return ["Jobsite Lists", "Panel Colors", "Workpad history", "Workpad settings", "Bending setup", "Wire Guide settings", "Trade Talk favorites", "Appearance", "Retained previous board"][DATA_KEYS.indexOf(key)];
}
export function parseBackup(text: string): ToolboxBackup {
  check(text.length <= MAX_BACKUP_BYTES && utf8Length(text) <= MAX_BACKUP_BYTES, "Choose a backup smaller than 5 MB.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("This file is not a readable Toolbox backup. No data was changed."); }
  check(object(value) && value.format === BACKUP_FORMAT, "This file is not an Electrician Toolbox backup.");
  check(value.version === BACKUP_VERSION, "This backup uses a different format version. Update the app before trying it.");
  check(typeof value.createdAt === "string" && Number.isFinite(Date.parse(value.createdAt)), "The backup date is invalid.");
  check(typeof value.appVersion === "string" && value.appVersion.length <= 80, "The backup app version is invalid.");
  validateRecordEnvelope(value.records); validateRecords(value.records);
  return value as ToolboxBackup;
}
export function makeBackup(records: BackupRecords, appVersion: string, now = new Date()): ToolboxBackup {
  return parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: now.toISOString(), appVersion, records }));
}
export function backupSummary(backup: ToolboxBackup) {
  const read = (key: DataKey) => backup.records[key] === null ? null : JSON.parse(backup.records[key]!);
  const lists = read(DATA_KEYS[0])?.lists ?? [];
  const history = read(DATA_KEYS[2]) ?? [];
  const legacy = read(DATA_KEYS[8]);
  return {
    lists: lists.length as number,
    items: lists.reduce((count: number, list: { lines: unknown[] }) => count + list.lines.length, 0) as number,
    panelPresets: (read(DATA_KEYS[1])?.customSchemes.length ?? 0) as number,
    calculations: history.length as number,
    favoriteTerms: (read(DATA_KEYS[6])?.favoriteIds.length ?? 0) as number,
    legacyItems: (legacy?.items.length ?? 0) as number,
    includesLegacy: legacy !== null,
  };
}
