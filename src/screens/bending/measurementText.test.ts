import { strict as assert } from "node:assert";
import test from "node:test";
import { BENDS, ANGLES, calculate, initialDraft, type Bend } from "../../utils/bending/bending";
import { bendPresentation } from "../../utils/bending/presentation";
import { reviewFit } from "../../utils/bending/feasibility";
import { measurementsEs } from "../../i18n/catalogs/measurements";
import { translateMeasurementText as translate } from "./measurementText";

test("Spanish measurement catalog preserves every interpolation", () => {
  const placeholders = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort();
  for (const [source, target] of Object.entries(measurementsEs)) {
    assert.deepEqual(placeholders(target), placeholders(source), source);
    assert.ok(target.trim(), source);
  }
});

test("all bend types translate generated steps, warnings and guide instructions without mutating results", () => {
  const check = (text: string) => assert.notEqual(translate(text, "es"), text, `Missing Spanish: ${text}`);
  for (const bend of BENDS) {
    check(bend.title); check(bend.hint);
    for (const angle of ANGLES) for (const location of ["", "24"]) for (const method of ["field", "geometry"] as const) {
      const calculation = calculate(bend.id, { ...initialDraft(bend.id), angle, location }, 6, method, 16);
      if (!calculation.result) { check(calculation.error); continue; }
      const result = calculation.result, original = JSON.stringify(result);
      [result.label, result.origin, result.method, ...result.steps, ...result.warnings,
        ...result.marks.flatMap(mark => [mark.label, mark.align])].forEach(check);
      if (bend.id !== "stub") {
        const guide = bendPresentation(bend.id, result, 16);
        [guide.marking, guide.finished, guide.notice, guide.summaryLabel,
          ...guide.steps.flatMap(step => [step.label, step.instruction])].forEach(check);
      }
      reviewFit(bend.id, result, 1, 16).issues.forEach(issue => { check(issue.title); check(issue.message); });
      assert.equal(JSON.stringify(result), original);
    }
  }
});

test("Spanish feasibility warnings retain the important dimensions and safety distinctions", () => {
  for (const bend of ["stub", "back", "offset", "rolling", "saddle3", "saddle4", "box"] as Bend[]) {
    for (const height of ["0.001", "0.5", "1", "6.5", "10"]) {
      const c = calculate(bend, { ...initialDraft(bend), height, span: "1", location: "0.25", angle: 60 }, 6, "field", 8);
      if (!c.result) { assert.notEqual(translate(c.error, "es"), c.error); continue; }
      reviewFit(bend, c.result, 1, 8).issues.forEach(issue => {
        const translated = translate(issue.message, "es");
        assert.notEqual(translated, issue.message, issue.message);
        for (const dimension of issue.message.match(/(?:≈ )?\d+(?: \d+\/\d+|\/\d+)?″/g) ?? []) assert.ok(translated.includes(dimension), dimension);
      });
    }
  }
});

test("English remains identical and Spanish never translates equation content or measurements", () => {
  const equation = "153.5in -135in";
  assert.equal(translate(equation, "es"), equation);
  assert.equal(translate('Could not understand “Inches”', "es"), 'No se pudo interpretar “Inches”');
  assert.equal(translate(`Use calculation ${equation}, result 18 1/2\"`, "es"), `Usar operación ${equation}, resultado 18 1/2\"`);
  assert.equal(translate("↑ Rounded up from 4.3\"", "es"), "↑ Redondeado hacia arriba desde 4.3\"");
  for (const key of Object.keys(measurementsEs)) assert.equal(translate(key, "en"), key);
});

test("nested app-authored guide labels translate but numeric layout stays unchanged", () => {
  assert.equal(translate("Mark 2 · Bend 2 · 30°", "es"), "Marca 2 · Doblez 2 · 30°");
  assert.equal(translate("2. Place the second mark 12″ from the first.", "es"), "2. Coloca la segunda marca a 12″ de la primera.");
  assert.equal(translate("12″ target − 6″ deduction", "es"), "12″ objetivo − 6″ deducción");
  assert.equal(translate("Measurement: empty inches", "es"), "Medida vacía, en pulgadas");
});
