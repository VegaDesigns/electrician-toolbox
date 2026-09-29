import assert from "node:assert/strict";
import test from "node:test";
import { electricalEs } from "./catalogs/electrical";
import { translate } from "./core";
import { panelColorLabel, panelSchemeLabel } from "./electricalPresentation";
import { BUILT_IN_PANEL_SCHEMES, getColorForPhase, getPhaseForCircuit } from "../utils/panelColors/phase";

const es = (source: string) => translate(source, {}, "es");

test("electrical Spanish templates preserve every interpolation token", () => {
  const tokens = (value: string) => [...value.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
  for (const [source, translated] of Object.entries(electricalEs)) {
    assert.ok(translated.trim(), source);
    assert.deepEqual(tokens(translated), tokens(source), source);
  }
});

test("panel translation changes presentation, not phase sequence or stored colors", () => {
  const before = JSON.stringify(BUILT_IN_PANEL_SCHEMES);
  const scheme = BUILT_IN_PANEL_SCHEMES[0];
  const phase = getPhaseForCircuit(80, scheme);
  const color = getColorForPhase(scheme, phase);
  assert.equal(phase, "A");
  assert.equal(color.name, "Black");
  assert.equal(panelColorLabel(color.name, es), "Negro");
  assert.equal(panelSchemeLabel(scheme, es), "Negro • Rojo • Azul");
  assert.equal(JSON.stringify(BUILT_IN_PANEL_SCHEMES), before);
});

test("custom job names and legacy custom color text stay verbatim", () => {
  for (const name of ["Hospital Project", "Black", "Clear", "Turno noche / Floor 2"]) {
    assert.equal(panelSchemeLabel({ isBuiltIn: false, name }, es), name);
  }
  assert.equal(panelColorLabel("Site violet stripe", es), "Site violet stripe");
  assert.equal(panelColorLabel("Clear", es), "Clear");
  assert.equal(panelColorLabel("Green / Bare", es), "Verde / Desnudo");
});

test("Spanish electrical results preserve US units and decimal precision", () => {
  assert.equal(translate("FITS • {{volume}} in³ remaining", { volume: "9.3" }, "es"), "CABE • Quedan 9.3 in³");
  assert.equal(translate("{{depth}}″ deep", { depth: "2-1/8" }, "es"), "2-1/8″ de fondo");
  assert.equal(translate("{{rating}}°C equipment limit", { rating: 75 }, "es"), "Límite del equipo a 75°C");
  assert.equal(translate("Wire size {{size}}", { size: "#12" }, "es"), "Calibre #12");
});
