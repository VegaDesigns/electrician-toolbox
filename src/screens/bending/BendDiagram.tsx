import React from "react";
import { guideGeometry, backPreviewGeometry } from "../../utils/bending/guideGeometry";
import { useGuideMotion } from "./useGuideMotion";
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Stop,
  Path,
  Line,
  Text,
  G,
  Rect,
} from "react-native-svg";
import { Colors as C } from "../../theme";
import { Result, Precision, inches } from "../../utils/bending/bending";
import { OtherBend } from "../../utils/bending/presentation";

// Every SVG label is one string: mixed text children overlap on native iOS.
function Label({
  x,
  y,
  children,
  color = C.textMuted,
  width = 180,
}: {
  x: number;
  y: number;
  children: string;
  color?: string;
  width?: number;
}) {
  return (
    <Text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={Math.min(17, width / (children.length * 0.56))}
      fontWeight="600"
      fontFamily="Arial"
    >
      {children}
    </Text>
  );
}
type End = { x: number; y: number; vertical?: boolean; rotation?: number };
function Pipe({ d, ends }: { d: string; ends: End[] }) {
  return (
    <G>
      <Path
        d={d}
        transform="translate(2 7)"
        stroke="#000"
        strokeOpacity={0.3}
        strokeWidth={24}
        fill="none"
      />
      {[20, 18, 15, 12, 9, 5, 2].map((width, i) => (
        <Path
          key={width}
          d={d}
          stroke={
            [
              "#344653",
              "#526A7B",
              "#718A9B",
              "#8DA3B3",
              "#AABDCB",
              "#CBD8E0",
              "#E1E9EE",
            ][i]
          }
          strokeWidth={width}
          transform={"translate(0 " + -i * 0.65 + ")"}
          fill="none"
          strokeLinejoin="round"
        />
      ))}
      {ends.map((end, i) => (
        <G
          key={i}
          transform={
            "translate(" +
            end.x +
            " " +
            (end.y - 2) +
            ") rotate(" +
            (end.rotation ?? (end.vertical ? 90 : 0)) +
            ")"
          }
        >
          <Ellipse rx={4} ry={10} fill="url(#bend-rim)" />
          <Ellipse
            rx={2.5}
            ry={7.5}
            fill="#0C131A"
            stroke="#6D8292"
            strokeWidth={1}
          />
        </G>
      ))}
    </G>
  );
}
function Dim({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  return (
    <G>
      <Line x1={x1} x2={x2} y1={y} y2={y} stroke={C.primary} />
      <Path
        d={
          "M" +
          (x1 + 5) +
          " " +
          (y - 4) +
          " L" +
          x1 +
          " " +
          y +
          " L" +
          (x1 + 5) +
          " " +
          (y + 4) +
          " M" +
          (x2 - 5) +
          " " +
          (y - 4) +
          " L" +
          x2 +
          " " +
          y +
          " L" +
          (x2 - 5) +
          " " +
          (y + 4)
        }
        stroke={C.primary}
        fill="none"
      />
      <Label x={(x1 + x2) / 2} y={y - 12} color={C.primary} width={x2 - x1 - 8}>
        {label}
      </Label>
    </G>
  );
}
// Fillets preserve selected straight-section angles, not a physical shoe radius.
function rounded(points: number[][]) {
  let d = "M" + points[0][0] + " " + points[0][1];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]),
      m = Math.hypot(c[0] - b[0], c[1] - b[1]),
      r = Math.min(14, l / 4, m / 4);
    d +=
      " L" +
      (b[0] + ((a[0] - b[0]) * r) / l) +
      " " +
      (b[1] + ((a[1] - b[1]) * r) / l) +
      " Q" +
      b[0] +
      " " +
      b[1] +
      " " +
      (b[0] + ((c[0] - b[0]) * r) / m) +
      " " +
      (b[1] + ((c[1] - b[1]) * r) / m);
  }
  const last = points[points.length - 1];
  return d + " L" + last[0] + " " + last[1];
}
export function BendDiagram({
  bend,
  result: r,
  finished,
  precision: p,
  focusMarks,
  formed,
  flip = false,
  guideLabel: selectedGuideLabel,
}: {
  bend: OtherBend;
  result: Result;
  finished: boolean;
  precision: Precision;
  focusMarks?: number[];
  formed?: number[];
  flip?: boolean;
  guideLabel?: string;
}) {
  const guideLabel = selectedGuideLabel ?? (finished ? "Check" : undefined);
  const f = (n: number) => inches(n, p);
  const color = (i: number) =>
    !focusMarks || focusMarks.includes(i) ? C.primary : C.borderStrong;
  const motion = useGuideMotion([
    ...r.marks.map((_, i) => formed ? Number(formed.includes(i)) : Number(finished)),
    Number(flip),
  ]);
  let drawing: React.ReactNode;
  if (bend === "back") {
    const { points, angle } = backPreviewGeometry(motion[0]);
    const last = points[points.length - 1];
    drawing = <>
      <Pipe d={rounded(points)} ends={[{ x: 70, y: 85, vertical: true }, { x: last[0], y: last[1], rotation: -angle * 180 / Math.PI }]} />
      <Dim x1={60} x2={250} y={62} label={f(r.span)} />
      <Label x={200} y={28} width={340}>{"FROM THE OUTSIDE BACK OF THE FIRST 90"}</Label>
      <Line x1={250} x2={250} y1={176} y2={201} stroke={C.primary} strokeWidth={3} />
      <Label x={250} y={226} color={C.primary}>{motion[0] < 0.01 ? "★ Star mark" : `${Number((motion[0] * 90).toFixed(1))}° · Star`}</Label>
      <Label x={102} y={250} width={140}>{"Existing 90°"}</Label>
    </>;
  } else if (finished || (formed?.length ?? 0) > 0 || motion.slice(0, r.marks.length).some(v => v > 0.001)) {
    const { points: pts, headings } = guideGeometry(bend, r.angle, motion, motion[r.marks.length]);
    const first = pts[0], last = pts[pts.length - 1];
    const selected = focusMarks?.[0];
    const labelXs = r.marks.map((_, i) => 55 + i * 290 / (r.marks.length - 1));
    drawing = <>
      <Label x={200} y={30} color={C.primary} width={340}>
        {guideLabel === "Flip" ? "ROTATE CONDUIT 180°" : selected !== undefined ?
          `Mark ${selected + 1} · ${guideLabel} · ${r.marks[selected].angle}°` : "CHECK HEIGHT & PARALLEL LEGS"}
      </Label>
      <Pipe d={rounded(pts)} ends={[
        { x: first[0], y: first[1], rotation: headings[0] * 180 / Math.PI * Math.cos(Math.PI * motion[r.marks.length]) },
        { x: last[0], y: last[1], rotation: headings[headings.length - 1] * 180 / Math.PI * Math.cos(Math.PI * motion[r.marks.length]) },
      ]} />
      {r.marks.map((mark, i) => <G key={i}>
        <Line x1={pts[i + 1][0]} x2={pts[i + 1][0]} y1={pts[i + 1][1] - 12} y2={pts[i + 1][1] + 12} stroke={color(i)} strokeWidth={3} />
        {guideLabel === "Check" && <Line x1={pts[i + 1][0]} y1={pts[i + 1][1] + 14} x2={labelXs[i]} y2={235} stroke={C.borderStrong} />}
        {((selected === i && guideLabel !== "Flip") || guideLabel === "Check" || (guideLabel === "Flip" && i === 0)) && <Label x={guideLabel === "Check" ? labelXs[i] : pts[i + 1][0]} y={guideLabel === "Check" ? 255 : pts[i + 1][1] + 34} color={color(i)} width={60}>
          {Number((mark.angle * motion[i]).toFixed(1)) + "°"}
        </Label>}
      </G>)}
      {guideLabel === "Flip" && <Label x={200} y={270} color={C.primary} width={340}>{"↻ 180° · Keep both bends in one plane"}</Label>}
      {guideLabel === "Check" && <Label x={200} y={282} color={C.primary} width={330}>{bend === "rolling" ? `Rise ${f(r.height)} · Sideways ${f(r.roll)}` : `Finished height ${f(r.height)}`}</Label>}
    </>;
  } else if (!finished) {
    const straight = guideGeometry(bend, r.angle, r.marks.map(() => 0)).points;
    const xs = straight ? straight.slice(1, -1).map(pt => pt[0]) :
      r.marks.length === 4
        ? [65, 145, 255, 335]
        : r.marks.length === 3
          ? [70, 200, 330]
          : [80, 320];
    const labelXs = r.marks.map((_, i) => 55 + i * 290 / (r.marks.length - 1));
    drawing = (
      <>
        <Pipe
          d={straight ? `M${straight[0][0]} 145 H${straight[straight.length - 1][0]}` : "M35 150 H365"}
          ends={[
            { x: straight?.[0][0] ?? 35, y: straight ? 145 : 150 },
            { x: straight?.[straight.length - 1][0] ?? 365, y: straight ? 145 : 150 },
          ]}
        />
        {xs.map((x, i) => (
          <G key={i}>
            <Line
              x1={x}
              x2={x}
              y1={136}
              y2={160}
              stroke="#0B1015"
              strokeWidth={7}
            />
            <Line
              x1={x}
              x2={x}
              y1={136}
              y2={160}
              stroke={color(i)}
              strokeWidth={4}
            />
            <Line
              x1={labelXs[i]}
              x2={x}
              y1={112}
              y2={130}
              stroke={color(i)}
              strokeDasharray="2 4"
            />
            <Line x1={x} y1={165} x2={labelXs[i]} y2={182} stroke={C.borderStrong} />
            <Label x={labelXs[i]} y={199} color={color(i)} width={76}>
              {bend === "saddle3"
                ? i === 1
                  ? "Center"
                  : "Return"
                : "Mark " + (i + 1)}
            </Label>
            <Label x={labelXs[i]} y={222} width={76}>
              {r.marks[i].angle + "°"}
            </Label>
          </G>
        ))}
        {r.gaps.map((gap, i) => (
          <Dim
            key={i}
            x1={labelXs[i]}
            x2={labelXs[i + 1]}
            y={r.marks.length === 4 && i === 1 ? 60 : 98}
            label={f(gap)}
          />
        ))}
      </>
    );
  }
  return (
    <Svg
      width="100%"
      height={280}
      viewBox="0 0 400 290"
      accessibilityLabel={
        (selectedGuideLabel ? `Guide: ${selectedGuideLabel}` : finished ? "Finished shape" : "Marking layout") +
        ": " +
        r.label +
        " " +
        f(r.value) +
        ". " +
        r.marks.map((m, i) => "Mark " + (i + 1) + (m.label === "Mark " + (i + 1) ? "" : ", " + m.label) + ", " + m.angle + " degrees").join(". ")
      }
    >
      <Defs>
        <LinearGradient id="bend-floor" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#141B22" />
          <Stop offset="1" stopColor="#0E1318" />
        </LinearGradient>
        <LinearGradient id="bend-rim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F1F4F5" />
          <Stop offset="0.45" stopColor="#8799A7" />
          <Stop offset="1" stopColor="#354552" />
        </LinearGradient>
      </Defs>
      <Rect width={400} height={290} rx={14} fill="url(#bend-floor)" />
      {[35, 85, 135, 185, 235, 285, 335, 385].map((x) => (
        <Line
          key={x}
          x1={x}
          x2={x}
          y1={15}
          y2={275}
          stroke="#91A3B2"
          strokeOpacity={0.035}
        />
      ))}
      {[35, 85, 135, 185, 235, 285].map((y) => (
        <Line
          key={y}
          x1={15}
          x2={385}
          y1={y}
          y2={y}
          stroke="#91A3B2"
          strokeOpacity={0.035}
        />
      ))}
      {drawing}
    </Svg>
  );
}
