export type MeasurementEntry = { text: string; replace: boolean };

export function measurementEntry(raw: string): MeasurementEntry {
  return { text: raw.trim().replace(/[″"]/g, "").trim(), replace: true };
}

export function measurementText(entry: MeasurementEntry): string { return entry.text; }

export function removeMeasurementFraction(entry: MeasurementEntry): MeasurementEntry {
  const mixed = entry.text.match(/^(?:(\d+)[ -]+)?\d+\/\d+$/);
  return { text: mixed ? mixed[1] ?? "" : entry.text, replace: false };
}

export function enterMeasurementKey(entry: MeasurementEntry, key: string): MeasurementEntry {
  if (key === "clear") return measurementEntry("");
  if (key === "backspace") {
    // A picked fraction is one entry: remove it before deleting whole-inch digits.
    return entry.text.includes("/") ? removeMeasurementFraction(entry)
      : { text: entry.text.slice(0, -1), replace: false };
  }
  if (!/^[0-9.]$/.test(key)) return entry;
  const current = entry.replace || entry.text.includes("/") ? "" : entry.text;
  if ((key === "." && current.includes(".")) || current.length >= 12) return entry;
  const text = key === "." && !current ? "0." : current === "0" && key !== "." ? key : current + key;
  return { text, replace: false };
}

/** Selecting a fraction replaces only the fractional part; opening/Back never edits. */
export function pickMeasurementFraction(entry: MeasurementEntry, label: string): MeasurementEntry | null {
  const fraction = label.match(/^(\d+)\/(\d+)$/);
  if (!fraction) return null;
  const numerator = Number(fraction[1]), denominator = Number(fraction[2]);
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)
    || numerator <= 0 || denominator <= numerator) return null;
  const mixed = entry.text.match(/^(?:(\d+)[ -]+)?\d+\/\d+$/);
  const whole = mixed ? mixed[1] ?? "" : entry.text.split(".")[0];
  if (whole && !/^\d+$/.test(whole)) return null;
  return measurementEntry(`${whole && Number(whole) !== 0 ? `${whole} ` : ""}${numerator}/${denominator}`);
}
