import assert from "node:assert/strict";
import test from "node:test";
import { resolveLanguage, spanishCatalog, translate } from "./core";
import { localizeBackupError } from "./backupErrors";
import { createProblemReport } from "../utils/support/report";
import { parseAppearance } from "../theme/preferences";
import { DATA_KEYS, makeBackup, parseBackup, type BackupRecords } from "../utils/backup/schema";

test("automatic language supports regional Spanish and ordered device preferences", () => {
  for (const tag of ["es", "es-MX", "es-PR", "es_US", "ES-co"]) assert.equal(resolveLanguage("system", [tag]), "es");
  assert.equal(resolveLanguage(undefined, ["fr-CA", "es-DO", "en-US"]), "es");
  assert.equal(resolveLanguage("system", ["en-US", "es-MX"]), "en");
  assert.equal(resolveLanguage("system", ["fr-FR"]), "en");
  assert.equal(resolveLanguage("system", []), "en");
  assert.equal(resolveLanguage("en", ["es"]), "en");
  assert.equal(resolveLanguage("es", ["en"]), "es");
});

test("translation falls back to English and preserves user values exactly", () => {
  const userText = "Save / Mi trabajo $& {{other}}";
  assert.equal(translate("Unknown phrase", {}, "es"), "Unknown phrase");
  assert.equal(translate("Opens {{title}}", { title: userText }, "es"), "Abrir " + userText);
  assert.equal(translate("Opens {{title}}", { title: userText }, "en"), "Opens " + userText);
  assert.equal(translate("Missing {{value}}", {}, "es"), "Missing {{value}}");
  assert.equal(translate("toString", {}, "es"), "toString");
});

test("Spanish catalog translations are nonempty and retain interpolation tokens", () => {
  const tokens = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
  assert.ok(Object.keys(spanishCatalog).length > 500);
  for (const [source, translated] of Object.entries(spanishCatalog)) {
    assert.ok(translated.trim(), source);
    assert.deepEqual(tokens(translated), tokens(source), source);
  }
});

test("language preferences preserve legacy records and reject invalid choices", () => {
  const original = { version: 1, themeId: "forest", mode: "dark" };
  assert.deepEqual(parseAppearance(JSON.stringify(original)), original);
  for (const language of ["system", "en", "es"]) assert.deepEqual(parseAppearance(JSON.stringify({ ...original, language })), { ...original, language });
  assert.deepEqual(parseAppearance(JSON.stringify({ ...original, language: "unknown" })), original);
});

test("manual backup keeps language in appearance without adding or changing saved-data sections", () => {
  const records = Object.fromEntries(DATA_KEYS.map(key => [key, null])) as BackupRecords;
  for (const language of [undefined, "system", "en", "es"]) {
    records[DATA_KEYS[7]] = JSON.stringify({ version: 1, themeId: "forest", mode: "dark", ...(language ? { language } : {}) });
    const backup = makeBackup(records, "0.9.4");
    assert.deepEqual(parseBackup(JSON.stringify(backup)).records, records);
    assert.equal(Object.keys(backup.records).length, 9);
  }
  records[DATA_KEYS[7]] = JSON.stringify({ version: 1, themeId: "forest", mode: "dark", language: "bad" });
  assert.throws(() => makeBackup(records, "0.9.4"));
});

test("Spanish feedback translates headings but leaves authored text untouched", () => {
  const details = "4 - Couplings / revisar aquí";
  const info = { appName: "Electrician Toolbox", version: "0.9.4", build: "10", platform: "ios", osVersion: "26", environment: "Installed app" };
  const report = createProblemReport({ tool: "Workpad", details, expected: "Save" }, info, "es");
  assert.ok(report.includes("Herramienta: Calculadora"));
  assert.ok(report.includes(details));
  assert.ok(report.includes("\nSave\n"));
  assert.ok(report.includes("Aplicación instalada"));
  const english = createProblemReport({ tool: "Workpad", details, expected: "" }, info);
  assert.ok(english.includes("Version: 0.9.4 (build 10)"));
  assert.ok(english.includes("Not provided"));
});

test("backup error localization handles only known validation templates", () => {
  const error = "The saved-data section “Workpad history” is damaged or too large. No data was changed.";
  assert.ok(localizeBackupError(error, "es").includes("Historial de calculadora"));
  assert.equal(localizeBackupError(error, "en"), error);
  assert.equal(localizeBackupError("Native error 52", "es"), "Native error 52");
});
