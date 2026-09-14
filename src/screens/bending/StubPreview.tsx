import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { ReferenceColors, useAppTheme } from "../../theme";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { PreviewControls, GuideNavigation } from "./PreviewControls";
import { useGuideMotion } from "./useGuideMotion";
import { usePreviewStyles as useStyles } from "./previewStyles";
import {
  inches,
  isRounded,
  Precision,
  Result,
} from "../../utils/bending/bending";
import {
  STUB_MARK,
  STUB_MARK_DISTANCE,
  stubPoint as point,
  stubPipePath as pipePath,
} from "../../utils/bending/stubPreviewGeometry";

type Step = "measure" | "deduct" | "mark" | "bend" | "check";
const steps = ["measure", "deduct", "mark", "bend", "check"] as const;
const names = {
  measure: "Measure",
  deduct: "Deduct",
  mark: "Mark",
  bend: "Bend",
  check: "Check",
};
// SVG labels receive one string; separate text children overlap on native SVG.
function Label({
  x,
  y,
  children,
  muted = false,
}: {
  x: number;
  y: number;
  children: string;
  muted?: boolean;
}) {
  const { theme: { colors: Colors } } = useAppTheme();

  return (
    <SvgText
      x={x}
      y={y}
      fill={muted ? Colors.textMuted : Colors.primary}
      fontFamily="Arial"
      fontSize={13}
      fontWeight="600"
      textAnchor="middle"
    >
      {children}
    </SvgText>
  );
}
function Dimension({
  x1,
  x2,
  y,
  label,
  muted = false,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  muted?: boolean;
}) {
  const { theme: { colors: Colors } } = useAppTheme();

  const color = muted ? Colors.borderStrong : Colors.primary;
  return (
    <G>
      <Line x1={x1} x2={x2} y1={y} y2={y} stroke={color} />
      <Path
        d={`M${x1 + 5} ${y - 3} L${x1} ${y} L${x1 + 5} ${y + 3} M${x2 - 5} ${y - 3} L${x2} ${y} L${x2 - 5} ${y + 3}`}
        fill="none"
        stroke={color}
      />
      <Label x={(x1 + x2) / 2} y={y - 10} muted={muted}>
        {label}
      </Label>
    </G>
  );
}

export function StubPreview({
  result: r,
  precision,
  finished,
  onFinishedChange,
  copied,
  onCopy,
  onHelp,
}: {
  result: Result;
  precision: Precision;
  finished: boolean;
  onFinishedChange: (value: boolean) => void;
  copied: boolean;
  onCopy: () => void;
  onHelp: () => void;
}) {
  const styles = useStyles();
  const { theme: { colors: Colors } } = useAppTheme();

  const [step, setStep] = useState<Step>("mark"),
    [guided, setGuided] = useState(false);
  const [amount] = useGuideMotion([Number(finished)]);
  const f = (n: number) => inches(n, precision),
    markX = STUB_MARK.x,
    active = guided ? step : finished ? "bend" : "mark",
    end = point(300, amount),
    tip = point(0, amount),
    mark = point(STUB_MARK_DISTANCE, amount),
    annotations = finished ? amount > 0.98 : amount < 0.02;
  const instruction = !guided
    ? finished
      ? "Check the outside height and resting angle after springback."
      : "Arrow on the amber mark; hook toward the short end."
    : step === "bend"
      ? "Arrow on the mark, hook toward the short end. Bend to a resting 90° after springback."
      : finished
      ? `Check ${f(r.height)} to the outside back of the pipe after springback.`
      : step === "measure"
        ? `From the cut end, measure ${f(r.height)}. This is your target—not the bend mark.`
        : step === "deduct"
          ? `Come back ${f(r.deduction)} toward the same end. You land at ${f(r.value)}.`
          : `Put the arrow on the ${f(r.value)} mark. Face the hook toward the short end.`;
  function selectStep(index: number) {
    const next = steps[index]; setStep(next); onFinishedChange(next === "bend" || next === "check");
  }
  return (
    <View>
      <PreviewControls guided={guided} finished={finished} steps={steps.map(s => names[s])}
        step={steps.indexOf(active)} onView={value => { setStep("mark"); onFinishedChange(value); }}
        onGuide={() => { setGuided(!guided); setStep(guided ? "mark" : "measure"); onFinishedChange(false); }}
        onStep={selectStep} />
      <View style={styles.stage}>
        <Svg
          width="100%"
          height={280}
          viewBox="0 0 400 290"
          accessibilityLabel={`${names[active]}: ${instruction}`}
        >
          <Defs>
            <LinearGradient id="stub-floor" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={Colors.diagramBackground} />
              <Stop offset="1" stopColor={Colors.surface2} />
            </LinearGradient>
            <LinearGradient id="stub-rim" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={ReferenceColors.colorF1F4F5} />
              <Stop offset="0.45" stopColor={ReferenceColors.color8799A7} />
              <Stop offset="1" stopColor={ReferenceColors.color354552} />
            </LinearGradient>
          </Defs>
          <Rect width={400} height={290} rx={14} fill="url(#stub-floor)" />
          {[35, 85, 135, 185, 235, 285, 335, 385].map((x) => (
            <Line
              key={x}
              x1={x}
              x2={x}
              y1={15}
              y2={275}
              stroke={Colors.diagramGrid}
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
              stroke={Colors.diagramGrid}
              strokeOpacity={0.035}
            />
          ))}
          <G transform="translate(2 8)">
            <Path
              d={pipePath(amount)}
              stroke={ReferenceColors.color000}
              strokeOpacity={0.23}
              strokeWidth={29}
              fill="none"
            />
            <Path
              d={pipePath(amount)}
              stroke={ReferenceColors.color000}
              strokeOpacity={0.25}
              strokeWidth={21}
              fill="none"
            />
          </G>
          <Path
            d={pipePath(amount)}
            stroke={ReferenceColors.color2B3944}
            strokeWidth={20}
            fill="none"
          />
          {[
            [-8, ReferenceColors.color657A8C],
            [-6, ReferenceColors.colorA0AFBA],
            [-4, ReferenceColors.colorDCE3E7],
            [-2, ReferenceColors.colorB9C6CF],
            [0, ReferenceColors.color8E9FAB],
            [2, ReferenceColors.color758995],
            [4, ReferenceColors.color5B707F],
            [6, ReferenceColors.color425967],
            [8, ReferenceColors.color293D4A],
          ].map(([o, color]) => (
            <Path
              key={o}
              d={pipePath(amount, Number(o))}
              stroke={String(color)}
              strokeWidth={2.4}
              fill="none"
            />
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const p = point(5 + i * 8.3, amount);
            return (
              <Line
                key={i}
                x1={p.x - Math.sin(p.a) * 6}
                y1={p.y + Math.cos(p.a) * 6}
                x2={p.x + Math.sin(p.a) * 5 + Math.cos(p.a) * 2}
                y2={p.y - Math.cos(p.a) * 5 + Math.sin(p.a) * 2}
                stroke={i % 3 ? ReferenceColors.colorDEE5E9 : ReferenceColors.color182F3E}
                strokeOpacity={0.055}
              />
            );
          })}
          {[tip, end].map((p, i) => (
            <G
              key={i}
              transform={`rotate(${(p.a * 180) / Math.PI} ${p.x} ${p.y})`}
            >
              <Ellipse cx={p.x} cy={p.y} rx={4} ry={10} fill="url(#stub-rim)" />
              <Ellipse cx={p.x} cy={p.y} rx={2.4} ry={7.5} fill={ReferenceColors.color0B141B} />
              <Path
                d={`M${p.x - 1} ${p.y - 6} Q${p.x + 2} ${p.y} ${p.x - 1} ${p.y + 6}`}
                stroke={ReferenceColors.color5B6F7D}
                strokeWidth={0.8}
                fill="none"
              />
            </G>
          ))}
          {(step !== "measure" || finished) && (
            <G
              transform={`rotate(${(mark.a * 180) / Math.PI} ${mark.x} ${mark.y})`}
            >
              <Path
                d={`M${mark.x} ${mark.y - 10} Q${mark.x + 3} ${mark.y} ${mark.x} ${mark.y + 10}`}
                stroke={ReferenceColors.color101820}
                strokeWidth={5}
                fill="none"
              />
              <Path
                d={`M${mark.x} ${mark.y - 10} Q${mark.x + 3} ${mark.y} ${mark.x} ${mark.y + 10}`}
                stroke={Colors.primary}
                strokeWidth={2}
                fill="none"
              />
            </G>
          )}
          {annotations && !finished && (
            <G>
              <Label x={200} y={42}>
                {step === "measure"
                  ? "MEASURE FROM THE TIP"
                  : `Bend mark · ${f(r.value)} from tip`}
              </Label>
              <Line
                x1={50}
                x2={50}
                y1={100}
                y2={156}
                stroke={Colors.borderStrong}
                strokeDasharray="3 4"
              />
              <Line
                x1={290}
                x2={290}
                y1={100}
                y2={184}
                stroke={step === "measure" ? Colors.primary : Colors.borderStrong}
                strokeDasharray="3 4"
              />
              <Dimension
                x1={50}
                x2={290}
                y={110}
                label={`Target ${f(r.height)}`}
                muted={step !== "measure"}
              />
              <Label x={50} y={203} muted>
                TIP
              </Label>
              {step !== "measure" ? (
                <G>
                  <Line
                    x1={markX}
                    x2={markX}
                    y1={186}
                    y2={214}
                    stroke={Colors.primary}
                    strokeDasharray="2 3"
                  />
                  <Path
                    d={`M290 221 H${markX} l7 -5 m-7 5 l7 5`}
                    stroke={Colors.primary}
                    fill="none"
                  />
                  <Label
                    x={230}
                    y={252}
                  >{`Deduct ${f(r.deduction)} toward tip`}</Label>
                </G>
              ) : (
                <Label x={200} y={252} muted>
                  Target only · deduct before marking
                </Label>
              )}
            </G>
          )}
          {annotations && finished && (
            <G>
              <Label x={235} y={25}>
                OUTSIDE HEIGHT
              </Label>
              <Path
                d={`M${tip.x - 12} ${tip.y} H126 V${end.y + 10} H210 M126 ${tip.y} l-3 5 m3 -5 l3 5 M126 ${end.y + 10} l-3 -5 m3 5 l3 -5`}
                stroke={Colors.primary}
                fill="none"
              />
              <Label x={101} y={(tip.y + end.y + 10) / 2 + 4}>
                {f(r.height)}
              </Label>
              <Path
                d="M194 137 A34 34 0 0 1 228 171"
                stroke={Colors.primary}
                strokeWidth={1.5}
                fill="none"
              />
              <Label x={235} y={127}>
                90°
              </Label>
            </G>
          )}
        </Svg>
      </View>
      <View style={styles.summary}>
        <View style={styles.summaryText}>
          <Text
            style={styles.calculation}
          >{`${f(r.height)} − ${f(r.deduction)} ${isRounded(r.value, precision) ? "≈" : "="} ${f(r.value)}`}</Text>
          <Text style={styles.legend}>Target − deduction = mark</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? "Copied result" : "Copy result"}
          onPress={onCopy}
          style={({ pressed }) => [styles.copy, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.copyText}>{copied ? "Copied ✓" : "Copy"}</Text>
        </Pressable>
      </View>
      <View style={styles.caption}>
        <Text style={styles.captionText}>{instruction}</Text>
      </View>
      {guided && <GuideNavigation step={steps.indexOf(active)} count={steps.length} onStep={selectStep} />}
      <View style={styles.footer}>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bender help and references"
          onPress={onHelp}
          style={({ pressed }) => [
            styles.textButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.helpText}>Help</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>
        Verify your bender’s deduction · Drawing not to scale
      </Text>
    </View>
  );
}
