/** Fit measured text, then let the display scroll at a readable minimum size. */
export function displayScale(naturalWidth: number, availableWidth: number, baseSize: number, minimumSize: number, previousScale = 1): number {
  // Layout can briefly be unavailable during input/resizing; preserve the last
  // settled size instead of flashing full-size text between measurements.
  if (naturalWidth <= 0 || availableWidth <= 0) return Math.max(minimumSize / baseSize, Math.min(1, previousScale));
  return Math.max(Math.min(1, minimumSize / baseSize), Math.min(1, (availableWidth - 2) / naturalWidth));
}
