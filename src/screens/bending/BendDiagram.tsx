import React from "react";
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
type End = { x: number; y: number; vertical?: boolean };
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
            (end.vertical ? 90 : 0) +
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
function Height({
  top,
  bottom,
  label,
}: {
  top: number;
  bottom: number;
  label: string;
}) {
  return (
    <G>
      <Path
        d={
          "M324 " +
          top +
          " H363 M324 " +
          bottom +
          " H363 M358 " +
          top +
          " V" +
          bottom +
          " M354 " +
          (top + 5) +
          " L358 " +
          top +
          " L362 " +
          (top + 5) +
          " M354 " +
          (bottom - 5) +
          " L358 " +
          bottom +
          " L362 " +
          (bottom - 5)
        }
        stroke={C.primary}
        fill="none"
      />
      <Label x={350} y={top - 20} color={C.primary} width={88}>
        {label}
      </Label>
    </G>
  );
}
export function BendDiagram({
  bend,
  result: r,
  finished,
  precision: p,
  focusMarks,
}: {
  bend: OtherBend;
  result: Result;
  finished: boolean;
  precision: Precision;
  focusMarks?: number[];
}) {
  const f = (n: number) => inches(n, p);
  const color = (i: number) =>
    !focusMarks || focusMarks.includes(i) ? C.primary : C.borderStrong;
  let drawing: React.ReactNode;
  if (bend === "back") {
    drawing = finished ? (
      <>
        <Pipe
          d="M70 76 V166 Q70 194 98 194 H302 Q330 194 330 166 V76"
          ends={[
            { x: 70, y: 76, vertical: true },
            { x: 330, y: 76, vertical: true },
          ]}
        />
        <Dim x1={60} x2={340} y={239} label={f(r.span)} />
        <Label x={116} y={162} color={C.primary}>
          90°
        </Label>
        <Label x={284} y={162} color={C.primary}>
          90°
        </Label>
        <Label x={200} y={36}>
          OUTSIDE BACK TO BACK
        </Label>
      </>
    ) : (
      <>
        <Pipe
          d="M70 104 V147 Q70 180 103 180 H360"
          ends={[
            { x: 70, y: 104, vertical: true },
            { x: 360, y: 180 },
          ]}
        />
        <Dim x1={60} x2={280} y={76} label={f(r.span)} />
        <Line
          x1={60}
          x2={60}
          y1={82}
          y2={200}
          stroke={C.borderStrong}
          strokeDasharray="3 4"
        />
        <Line
          x1={280}
          x2={280}
          y1={86}
          y2={163}
          stroke={color(0)}
          strokeDasharray="3 4"
        />
        <Line
          x1={280}
          x2={280}
          y1={167}
          y2={190}
          stroke={color(0)}
          strokeWidth={4}
        />
        <Label x={280} y={221} color={color(0)}>
          ★ Star mark
        </Label>
        <Label x={91} y={240}>
          Existing 90°
        </Label>
      </>
    );
  } else if (!finished) {
    const xs =
      r.marks.length === 4
        ? [65, 145, 255, 335]
        : r.marks.length === 3
          ? [70, 200, 330]
          : [80, 320];
    drawing = (
      <>
        <Pipe
          d="M35 150 H365"
          ends={[
            { x: 35, y: 150 },
            { x: 365, y: 150 },
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
              x1={x}
              x2={x}
              y1={112}
              y2={130}
              stroke={color(i)}
              strokeDasharray="2 4"
            />
            <Label x={x} y={199} color={color(i)} width={76}>
              {bend === "saddle3"
                ? i === 1
                  ? "Center"
                  : "Return"
                : "Mark " + (i + 1)}
            </Label>
            <Label x={x} y={222} width={76}>
              {r.marks[i].angle + "°"}
            </Label>
          </G>
        ))}
        {r.gaps.map((gap, i) => (
          <Dim
            key={i}
            x1={xs[i]}
            x2={xs[i + 1]}
            y={r.marks.length === 4 && i === 1 ? 60 : 98}
            label={f(gap)}
          />
        ))}
      </>
    );
  } else {
    const saddle = bend === "saddle3" || bend === "saddle4";
    const theta = (r.angle * Math.PI) / 180;
    const run = saddle ? (bend === "saddle4" ? 66 : 110) : 160;
    const dy = Math.min(110, run * Math.tan(theta)),
      dx = dy / Math.tan(theta);
    const bridge = bend === "saddle4" ? 70 : 0;
    const left = (330 - (saddle ? 2 * dx + bridge : dx)) / 2;
    // Center shallow and steep bends on the same stage, not against the bottom edge.
    const bottom = 150 + dy / 2,
      top = 150 - dy / 2;
    const pts = saddle
      ? [
          [20, bottom],
          [left, bottom],
          [left + dx, top],
          ...(bend === "saddle4" ? [[left + dx + bridge, top]] : []),
          [330 - left, bottom],
          [310, bottom],
        ]
      : [
          [20, bottom],
          [left, bottom],
          [left + dx, top],
          [310, top],
        ];
    drawing = (
      <>
        <Pipe
          d={rounded(pts)}
          ends={[
            { x: 20, y: bottom },
            { x: 310, y: saddle ? bottom : top },
          ]}
        />
        <Label x={left} y={bottom + 37} color={color(0)} width={80}>
          {r.angle + "°"}
        </Label>
        <Label x={left + dx} y={top - 24} color={color(1)} width={70}>
          {(bend === "saddle3" ? r.angle * 2 : r.angle) + "°"}
        </Label>
        {bend === "saddle4" && (
          <Label
            x={left + dx + bridge}
            y={top - 24}
            color={color(2)}
            width={70}
          >
            {r.angle + "°"}
          </Label>
        )}
        {saddle && (
          <Label
            x={330 - left}
            y={bottom + 37}
            color={color(r.marks.length - 1)}
            width={80}
          >
            {r.angle + "°"}
          </Label>
        )}
        <Height
          top={top}
          bottom={bottom}
          label={f(
            bend === "rolling" ? Math.hypot(r.height, r.roll) : r.height,
          )}
        />
        {bend === "rolling" && (
          <G>
            <Label x={76} y={22} width={95}>
              END VIEW
            </Label>
            <Path
              d={
                "M50 88 V" +
                (88 - (r.height * 48) / Math.hypot(r.height, r.roll)) +
                " H" +
                (50 + (r.roll * 48) / Math.hypot(r.height, r.roll)) +
                " Z"
              }
              stroke={C.borderStrong}
              fill="#4D6A8618"
            />
            <Label x={24} y={65} width={43}>
              {f(r.height)}
            </Label>
            <Label x={100} y={45} width={70}>
              {f(r.roll)}
            </Label>
          </G>
        )}
      </>
    );
  }
  return (
    <Svg
      width="100%"
      height={280}
      viewBox="0 0 400 290"
      accessibilityLabel={
        (finished ? "Finished shape" : "Marking layout") +
        ": " +
        r.label +
        " " +
        f(r.value) +
        ". " +
        r.marks.map((m) => m.label + ", " + m.angle + " degrees").join(". ")
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
