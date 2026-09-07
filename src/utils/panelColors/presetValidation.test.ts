import assert from "node:assert/strict";
import test from "node:test";
import { BUILT_IN_PANEL_SCHEMES, type PanelColorScheme } from "./phase";
import { decodePanelPreferences } from "./presetValidation";

const preset: PanelColorScheme = {
  ...BUILT_IN_PANEL_SCHEMES[0], id: "custom-test", name: "School",
  isBuiltIn: false, isQuickChoice: false,
};
function serialized(scheme: PanelColorScheme = preset) {
  return JSON.stringify({ customSchemes: [scheme], selectedSchemeId: scheme.id });
}
test("loads existing local presets without requiring new optional panel details", () => {
  assert.deepEqual(decodePanelPreferences(serialized()).customSchemes, [preset]);
});
test("preserves the optional panel identifier and selected setup", () => {
  const saved = { ...preset, panelLabel: "L2 — Second floor" };
  assert.deepEqual(decodePanelPreferences(serialized(saved)), { customSchemes: [saved], selectedSchemeId: saved.id });
});
test("rejects corrupt data instead of silently replacing saved work", () => {
  for (const raw of ["bad json", "null", "{}", '{"customSchemes":[],"selectedSchemeId":"missing"}']) {
    assert.throws(() => decodePanelPreferences(raw));
  }
});
test("rejects unsupported saved phase layouts", () => {
  assert.throws(() => decodePanelPreferences(serialized({ ...preset, phaseOrder: ["A"] })));
  assert.throws(() => decodePanelPreferences(serialized({ ...preset, phaseOrder: ["C", "B", "A"] })));
});
test("rejects missing colors and collisions with built-in identifiers", () => {
  const { A: omitted, ...colors } = preset.colors;
  assert.ok(omitted);
  assert.throws(() => decodePanelPreferences(serialized({ ...preset, colors })));
  assert.throws(() => decodePanelPreferences(serialized({ ...preset, id: BUILT_IN_PANEL_SCHEMES[0].id })));
});
test("accepts supported single-phase presets", () => {
  const single = { ...BUILT_IN_PANEL_SCHEMES[2], id: "custom-single", isBuiltIn: false, isQuickChoice: false };
  assert.deepEqual(decodePanelPreferences(serialized(single)).customSchemes[0].phaseOrder, ["L1", "L2"]);
});
