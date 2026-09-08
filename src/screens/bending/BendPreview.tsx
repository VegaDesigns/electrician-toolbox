import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  inches,
  isRounded,
  Precision,
  Result,
} from "../../utils/bending/bending";
import { bendPresentation, OtherBend } from "../../utils/bending/presentation";
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
  return (
    <View>
      <View style={styles.controls}>
        {guided ? (
          <View style={styles.steps}>
            {content.steps.map((item, i) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1}. ${item.label}`}
                accessibilityState={{ selected: step === i }}
                onPress={() => {
                  setStep(i);
                  onFinishedChange(item.finished);
                }}
                style={({ pressed }) => [
                  styles.step,
                  step === i && styles.active,
                  { opacity: pressed ? 0.65 : 1 },
                ]}
              >
                <Text style={[styles.stepNumber, step === i && styles.amber]}>
                  {i + 1}
                </Text>
                <Text style={[styles.stepName, step === i && styles.amber]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.tabs}>
            {[false, true].map((value) => (
              <Pressable
                key={String(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: finished === value }}
                onPress={() => onFinishedChange(value)}
                style={({ pressed }) => [
                  styles.tab,
                  finished === value && styles.active,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[styles.tabText, finished === value && styles.amber]}
                >
                  {value ? "Finished" : "Mark it"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <View style={styles.stage}>
        <BendDiagram
          bend={bend}
          result={result}
          precision={precision}
          finished={finished}
          focusMarks={guided ? current.marks : undefined}
        />
      </View>
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
      {!result.relative && bend !== "back" && (
        <View style={styles.markList}>
          <Text style={styles.legend}>FROM PIPE END</Text>
          <View style={styles.markRows}>
            {result.marks.map((mark, i) => (
              <View key={i} style={styles.markPosition}>
                <Text style={styles.legend}>
                  {bend === "saddle3"
                    ? ["Near return", "Center", "Far return"][i]
                    : `Mark ${i + 1}`}
                </Text>
                <Text
                  style={styles.copyText}
                >{`${isRounded(mark.at, precision) ? "≈ " : ""}${inches(mark.at, precision)}`}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {bend === "rolling" && (
        <Text
          style={[styles.hint, { paddingBottom: 10 }]}
        >{`True offset ${inches(Math.hypot(result.height, result.roll), precision)} · Roll ${result.rollAngle?.toFixed(1)}° from vertical`}</Text>
      )}
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: guided }}
          onPress={() => {
            setGuided(!guided);
            setStep(0);
            if (!guided) onFinishedChange(content.steps[0].finished);
          }}
          style={({ pressed }) => [
            styles.textButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.guideText}>
            {guided ? "Exit guide" : "Guide me"}
          </Text>
        </Pressable>
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
      {content.closeMarks && bend !== "box" && (
        <Text style={styles.hint}>
          Close marks: make sure the shoe can seat between bends.
        </Text>
      )}
      <Text style={styles.hint}>
        Drawing not to scale · Full measurements in Help
      </Text>
    </View>
  );
}
