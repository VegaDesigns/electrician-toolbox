import { OtherBend } from "./presentation";

// Fixed illustrative lengths keep material marks attached throughout each bend.
// These are not shoe radii or developed cut lengths.
export function guideGeometry(bend: OtherBend, angle: number, amounts: number[], flip = 0) {
  const lengths = bend === "saddle3" ? [55, 70, 70, 55]
    : bend === "saddle4" ? [40, 45, 50, 45, 40] : [55, 100, 80];
  const turns = bend === "saddle3" ? [-angle, 2 * angle, -angle]
    : bend === "saddle4" ? [-angle, angle, angle, -angle] : [-angle, angle];
  let x = (400 - lengths.reduce((sum, value) => sum + value, 0)) / 2, y = 145, heading = -turns.reduce((sum, turn, i) => sum + turn * (amounts[i] ?? 0), 0) * Math.PI / 180;
  const points = [[x, y]];
  const headings = [heading];
  for (let i = 0; i < lengths.length; i++) {
    x += lengths[i] * Math.cos(heading);
    y += lengths[i] * Math.sin(heading);
    points.push([x, y]);
    if (i < turns.length) heading += turns[i] * (amounts[i] ?? 0) * Math.PI / 180;
    headings.push(heading);
  }
  const last = points[points.length - 1];
  const endX = (400 + lengths.reduce((sum, value) => sum + value, 0)) / 2;
  return { points: points.map(([px, py]) => [endX + px - last[0], 145 + (py - last[1]) * Math.cos(Math.PI * flip)]), headings };
}

// Keep the existing 90 and second-bend mark fixed while the free leg bends.
export function backPreviewGeometry(amount: number) {
  const angle = Math.max(0, Math.min(1, amount)) * Math.PI / 2;
  return { points: [[70, 85], [70, 190], [250, 190], [250 + 100 * Math.cos(angle), 190 - 100 * Math.sin(angle)]], angle };
}
