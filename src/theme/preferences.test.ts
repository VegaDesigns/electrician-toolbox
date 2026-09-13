import assert from "node:assert/strict";
import test from "node:test";
import { APPEARANCE_KEY, createAppearanceStore, defaultAppearance, parseAppearance, resolveMode } from "./preferences";
import { themeCatalog } from "./color";

test("missing, corrupt, or newer appearance data has a safe default", () => {
  for (const value of [null, "", "{", "null", "[]", '{"version":2,"themeId":"iris"}']) assert.deepEqual(parseAppearance(value), defaultAppearance);
  assert.deepEqual(parseAppearance('{"version":1,"themeId":"unknown","mode":"dark"}'), { version: 1, themeId: "forest", mode: "dark" });
  assert.deepEqual(parseAppearance('{"version":1,"themeId":"clay","mode":"unknown"}'), { version: 1, themeId: "clay", mode: "system" });
});
test("explicit modes override the device; System follows it", () => {
  assert.equal(resolveMode("dark", "light"), "dark");
  assert.equal(resolveMode("light", "dark"), "light");
  assert.equal(resolveMode("system", "dark"), "dark");
  assert.equal(resolveMode("system", "light"), "light");
  assert.equal(resolveMode("system", undefined), "light");
});
test("rapid preference changes save in order without touching tool data", async () => {
  const data = new Map([["tool-history", "keep this"]]);
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  let start!: () => void;
  const started = new Promise<void>(resolve => { start = resolve; });
  let calls = 0;
  const store = createAppearanceStore({ getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { assert.equal(key, APPEARANCE_KEY); if (++calls === 1) { start(); await blocked; } data.set(key, value); } });
  const first = store.save({ version: 1, themeId: "ocean", mode: "light" });
  const second = store.save({ version: 1, themeId: "iris", mode: "dark" });
  await started;
  assert.equal(calls, 1);
  release(); await Promise.all([first, second]);
  assert.deepEqual(await store.load(), { version: 1, themeId: "iris", mode: "dark" });
  assert.equal(data.get("tool-history"), "keep this");
});
test("failed appearance writes can be retried", async () => {
  let fail = true; let raw: string | null = null;
  const store = createAppearanceStore({ getItem: async () => raw, setItem: async (_, value) => { if (fail) throw new Error("storage unavailable"); raw = value; } });
  await assert.rejects(store.save(defaultAppearance)); fail = false;
  await store.save({ ...defaultAppearance, themeId: "graphite" });
  assert.equal((await store.load()).themeId, "graphite");
});
function luminance(hex: string) { const c = hex.slice(1).match(/../g)!.map(x => parseInt(x, 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722; }
function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
for (const [id, modes] of Object.entries(themeCatalog)) for (const [mode, c] of Object.entries(modes)) {
  test(`${id} ${mode}: readable text and status combinations`, () => {
    for (const fg of [c.text, c.textMuted]) for (const bg of [c.bg, c.surface, c.surface2, c.surface3]) assert.ok(contrast(fg, bg) >= 4.5, `${fg} on ${bg}`);
    for (const [fg, bg] of [[c.inverseText, c.primary], [c.primary, c.primarySoft], [c.error, c.errorSoft], [c.success, c.successSoft], [c.warning, c.warningSoft]]) assert.ok(contrast(fg, bg) >= 4.5, `${fg} on ${bg}`);
  });
}
