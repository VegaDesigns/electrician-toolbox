import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Effects } from "../../theme";

export type ResultFormatKey =
  | "standard"
  | "ft-in"
  | "exact-in"
  | "decimal-ft"
  | "rounded-in";

export type ResultOption = {
  key: ResultFormatKey;
  label: string;
  value: string;
};

type Props = {
  copyLabel: string;
  error: string | null;
  expression: string;
  hasResult: boolean;
  interpretation: string;
  onCopy: () => void;
  onDismissInterpretation: () => void;
  onOpenSmartInput: () => void;
  onToggleUnit: () => void;
  primary: string;
  roundingNotice: string;
  showUnitToggle: boolean;
  unitToggleLabel: "ft/in" | "in";
};

export default function CalcDisplay({
  copyLabel,
  error,
  expression,
  hasResult,
  interpretation,
  onCopy,
  onDismissInterpretation,
  onOpenSmartInput,
  onToggleUnit,
  primary,
  roundingNotice,
  showUnitToggle,
  unitToggleLabel,
}: Props) {
  const cleanExpression = expression.trim();

  const mainDisplay = hasResult
    ? primary
    : cleanExpression.length > 0
      ? cleanExpression
      : "0";

  const topLine = hasResult
    ? cleanExpression
    : cleanExpression.length === 0
      ? "Tap to type a measurement"
      : "";

  return (
    <View style={styles.display}>
      {hasResult && showUnitToggle ? (
        <Pressable
          accessibilityLabel={`Show result in ${unitToggleLabel === "in" ? "inches" : "feet and inches"}`}
          accessibilityRole="button"
          onPress={onToggleUnit}
          style={({ pressed }) => [
            styles.unitToggle,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.unitToggleText}>{unitToggleLabel}</Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityHint="Opens a text field for entries such as one foot six inches"
        accessibilityLabel="Calculator display. Tap to type a measurement"
        accessibilityRole="button"
        onPress={onOpenSmartInput}
        style={({ pressed }) => [styles.valueArea, pressed && styles.displayPressed]}
      >
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          numberOfLines={1}
          style={[styles.topLine, !hasResult && !cleanExpression && styles.topLineHint]}
        >
          {topLine}
        </Text>

        {hasResult ? <FormattedMainValue value={mainDisplay} /> : (
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.35}
            numberOfLines={1}
            style={styles.mainValue}
          >
            {mainDisplay}
          </Text>
        )}
      </Pressable>

      <View style={styles.feedbackSlot}>
        {error ? (
          <Text accessibilityRole="alert" numberOfLines={1} style={styles.error}>
            {error}
          </Text>
        ) : interpretation ? (
          <View style={styles.interpretationRow}>
            <Text numberOfLines={1} style={styles.interpretationText}>
              ✦ Interpreted as {interpretation}
            </Text>
            <Pressable
              accessibilityLabel="Dismiss interpretation"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onDismissInterpretation}
              style={styles.interpretationDismiss}
            >
              <Text style={styles.interpretationDismissText}>×</Text>
            </Pressable>
          </View>
        ) : roundingNotice ? (
          <Text numberOfLines={1} style={styles.roundingNotice}>
            {roundingNotice}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionSlot}>
        <View />

        {hasResult ? (
          <Pressable
            accessibilityLabel={copyLabel}
            accessibilityRole="button"
            onPress={onCopy}
            style={({ pressed }) => [styles.copyButton, pressed && styles.actionPressed]}
          >
            <Text style={styles.copyButtonText}>{copyLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function FormattedMainValue({ value }: { value: string }) {
  const parsed = parseFractionDisplay(value);

  if (!parsed) {
    return (
      <Text
        style={styles.mainValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.35}
      >
        {value}
      </Text>
    );
  }

  return (
    <Text
      style={styles.mainValue}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.35}
    >
      {parsed.before}
      <Text style={styles.inlineFraction}>
        {parsed.numerator}/{parsed.denominator}
      </Text>
      {parsed.after.length > 0 && (
        <Text style={styles.inlineUnit}>{parsed.after}</Text>
      )}
    </Text>
  );
}

function parseFractionDisplay(value: string): {
  before: string;
  numerator: string;
  denominator: string;
  after: string;
} | null {
  const trimmed = value.trim();

  const match = trimmed.match(/^(.*?)(\d+)\/(\d+)("?)$/);

  if (!match) return null;

  return {
    before: match[1],
    numerator: match[2],
    denominator: match[3],
    after: match[4],
  };
}

const styles = StyleSheet.create({
  display: {
    minHeight: 190,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    ...Effects.surfaceRaised,
  },

  valueArea: {
    flex: 1,
    justifyContent: "flex-end",
    minHeight: 105,
    paddingHorizontal: 2,
  },

  displayPressed: {
    opacity: 0.86,
  },

  topLine: {
    color: Colors.textSubtle,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
    minHeight: 25,
    paddingLeft: 70,
  },

  topLineHint: {
    color: Colors.textSubtle,
    fontSize: 14,
    fontWeight: "700",
  },

  mainValue: {
    color: Colors.text,
    fontSize: 54,
    fontWeight: "300",
    textAlign: "right",
    letterSpacing: -1.5,
  },

  inlineFraction: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: "400",
    letterSpacing: -0.8,
  },

  inlineUnit: {
    color: Colors.text,
    fontSize: 44,
    fontWeight: "300",
  },

  feedbackSlot: {
    height: 23,
    justifyContent: "center",
  },

  interpretationRow: {
    alignItems: "center",
    flexDirection: "row",
  },

  interpretationText: {
    color: Colors.primary,
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
  },

  interpretationDismiss: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 24,
  },

  interpretationDismissText: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 20,
  },

  error: {
    color: Colors.error,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },

  roundingNotice: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },

  actionSlot: {
    alignItems: "center",
    flexDirection: "row",
    height: 34,
    justifyContent: "space-between",
  },

  unitToggle: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    left: 16,
    minWidth: 52,
    paddingHorizontal: 10,
    position: "absolute",
    top: 14,
    zIndex: 2,
    ...Effects.controlRaised,
  },

  unitToggleText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  copyButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    minWidth: 86,
    paddingHorizontal: 11,
    ...Effects.controlRaised,
  },

  copyButtonText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
    ...Effects.pressed,
  },
});
