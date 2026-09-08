// Illustration only: keep the marked material point fixed in the viewport.
// The arc is not a calibrated shoe profile, and drawing distances are not inches.
export const STUB_MARK_DISTANCE = 130;
export const STUB_MARK = { x: 180, y: 170 };
export function stubPoint(distance: number, amount: number) {
  const angle = (Math.max(0, Math.min(1, amount)) * Math.PI) / 2;
  const arc = 48,
    start = STUB_MARK_DISTANCE - arc / 2;
  function relative(s: number) {
    const q = s - start;
    if (q <= 0)
      return { x: q * Math.cos(angle), y: q * Math.sin(angle), a: angle };
    const travel = Math.min(q, arc),
      turn = (angle * travel) / arc;
    if (angle < 1e-8) return { x: q, y: 0, a: 0 };
    const radius = arc / angle;
    return {
      x:
        radius * (Math.sin(angle) - Math.sin(angle - turn)) +
        Math.max(0, q - arc),
      y: radius * (Math.cos(angle - turn) - Math.cos(angle)),
      a: angle - turn,
    };
  }
  const p = relative(distance),
    pivot = relative(STUB_MARK_DISTANCE);
  return {
    x: STUB_MARK.x + p.x - pivot.x,
    y: STUB_MARK.y + p.y - pivot.y,
    a: p.a,
  };
}
export function stubPipePath(amount: number, offset = 0) {
  return Array.from({ length: 61 }, (_, i) => {
    const p = stubPoint(i * 5, amount);
    return `${i ? "L" : "M"}${(p.x - Math.sin(p.a) * offset).toFixed(2)} ${(p.y + Math.cos(p.a) * offset).toFixed(2)}`;
  }).join(" ");
}
