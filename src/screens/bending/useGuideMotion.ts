import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useGuideMotion(target: number[]) {
  const key = JSON.stringify(target);
  const [motion, setMotion] = useState<number[]>(target);
  const position = useRef(target);
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (live) setReduceMotion(v); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { live = false; listener.remove(); };
  }, []);
  useEffect(() => {
    const end = JSON.parse(key) as number[];
    if (reduceMotion) { position.current = end; return; }
    const start = position.current;
    let frame = 0;
    let began: number | undefined;
    function tick(time: number) {
      began ??= time;
      const t = Math.min((time - began) / 800, 1);
      const ease = t * t * (3 - 2 * t);
      position.current = end.map((v, i) => (start[i] ?? 0) + (v - (start[i] ?? 0)) * ease);
      setMotion(position.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key, reduceMotion]);
  return reduceMotion ? target : motion;
}
