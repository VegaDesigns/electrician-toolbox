import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  inches,
  isRounded,
  Precision,
  Result,
} from "../../utils/bending/bending";
import { bendPresentation, OtherBend } from "../../utils/bending/presentation";
import { PreviewControls, GuideNavigation } from "./PreviewControls";
import { BendDiagram } from "./BendDiagram";
import { previewStyles as styles } from "./previewStyles";

export function BendPreview({
  bend,
  result,
  precision,
  finished,
  onFinishedChange,
  copied,
  onCopy,
  onHelp,
}: {
  bend: OtherBend;
  result: Result;
  precision: Precision;
  finished: boolean;
  onFinishedChange: (value: boolean) => void;
  copied: boolean;
  onCopy: () => void;
  onHelp: () => void;
}) {
  const [guided, setGuided] = useState(false);
  const [step, setStep] = useState(0);
  const content = bendPresentation(bend, result, precision);
  const current = content.steps[step];
  const instruction = guided
    ? current.instruction
    : finished
      ? content.finished
      : content.marking;
  function selectStep(index: number) {
    setStep(index); onFinishedChange(content.steps[index].finished);
  }
  return (
    <View>
      <PreviewControls guided={guided} finished={finished} steps={content.steps.map(s => s.label)} step={step}
        onView={onFinishedChange} onGuide={() => {
          setGuided(!guided); setStep(0); onFinishedChange(false);
        }} onStep={selectStep} />
      <View style={styles.stage}>
        <BendDiagram
          bend={bend}
          result={result}
          precision={precision}
          finished={finished}
          focusMarks={guided ? current.marks : undefined}
          formed={guided ? (current.formed ?? []) : undefined}
          flip={guided && current.flip}
          guideLabel={guided ? current.label : undefined}
        />
      </View>
      {!result.relative && bend !== "back" && (
        <View style={styles.markList}>
          <Text style={styles.legend}>MARKS FROM TIP</Text>
          <View style={styles.markRows}>
            {result.marks.map((mark, i) => (
              <View key={i} style={styles.markPosition}>
                <Text style={styles.legend}>
                  {bend === "saddle3"
                    ? `${i + 1} · ${["Near return", "Center", "Far return"][i]}`
                    : `Mark ${i + 1}`}
                </Text>
                <Text
                  style={styles.markMeasurement}
                >{`${isRounded(mark.at, precision) ? "≈ " : ""}${inches(mark.at, precision)}`}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={styles.summary}>
        <View style={styles.summaryText}>
          <Text
            style={styles.calculation}
          >{`${isRounded(result.value, precision) ? "≈ " : ""}${inches(result.value, precision)}`}</Text>
          <Text style={styles.legend}>{content.summaryLabel}</Text>
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
      {guided && <GuideNavigation step={step} count={content.steps.length} onStep={selectStep} />}
      {bend === "rolling" && (
        <Text
          style={[styles.hint, { paddingBottom: 10 }]}
        >{`True offset ${inches(Math.hypot(result.height, result.roll), precision)} · Roll ${result.rollAngle?.toFixed(1)}° from vertical`}</Text>
      )}
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
      <Text style={styles.hint}>{content.notice}</Text>
      <Text style={styles.hint}>
        Drawing not to scale · Full measurements in Help
      </Text>
    </View>
  );
}
