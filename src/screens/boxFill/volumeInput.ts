/** Native decimal pads may use a comma. Keep the existing dot-based, two-decimal draft format. */
export function normalizeVolumeInput(value: string): string | null {
  // A single separator is decimal, never thousands grouping. Mixed or repeated separators fail validation.
  const normalized = value.replace(",", ".");
  return /^\d*\.?\d{0,2}$/.test(normalized) ? normalized : null;
}
