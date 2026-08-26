import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Effects } from "../../theme";
import type { CalcKey } from "../../utils/calc/engine";

type Props = {
  onKeyPress: (key: CalcKey) => void;
  onPickFraction: (fraction: FractionSpec) => void;
  onExitFractionMode: () => void;
  fractionMode?: boolean;
  compact?: boolean;
};

export type FractionSpec = { label: string; value: number };

type KeySpec = {
  key: CalcKey;
  label?: string;
  span?: number;
};

const ROWS: KeySpec[][] = [
  [
    { key: "C" },
    { key: "⌫" },
    { key: "FT", label: "ft" },
    { key: "IN", label: "in" },
  ],
  [{ key: "7" }, { key: "8" }, { key: "9" }, { key: "÷" }],
  [{ key: "4" }, { key: "5" }, { key: "6" }, { key: "×" }],
  [{ key: "1" }, { key: "2" }, { key: "3" }, { key: "-" }],
  [{ key: "0" }, { key: "." }, { key: "FRAC", label: "frac" }, { key: "+" }],
  [{ key: "=", span: 4 }],
];

const COMMON_FRACTIONS: FractionSpec[] = [
  { label: "1/16", value: 1 / 16 },
  { label: "1/8", value: 1 / 8 },
  { label: "1/4", value: 1 / 4 },
  { label: "3/8", value: 3 / 8 },
  { label: "1/2", value: 1 / 2 },
  { label: "5/8", value: 5 / 8 },
  { label: "3/4", value: 3 / 4 },
  { label: "7/8", value: 7 / 8 },
];

export default function CalcKeypad({
  onKeyPress,
  onPickFraction,
  onExitFractionMode,
  fractionMode = false,
  compact = false,
}: Props) {
  const [customNumerator, setCustomNumerator] = useState("");
  const [customDenominator, setCustomDenominator] = useState("");
  const [customError, setCustomError] = useState("");
  const denominatorInputRef = useRef<TextInput | null>(null);

  function resetCustomFraction() {
    setCustomNumerator("");
    setCustomDenominator("");
    setCustomError("");
  }

  function exitFractionMode() {
    resetCustomFraction();
    onExitFractionMode();
  }

  function pressFractionUtility(key: CalcKey) {
    resetCustomFraction();
    onKeyPress(key);
  }

  function pickFraction(fraction: FractionSpec) {
    resetCustomFraction();
    onPickFraction(fraction);
  }

  function updateCustomValue(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) {
    setter(value.replace(/\D/g, "").slice(0, 3));
    setCustomError("");
  }

  function submitCustomFraction() {
    const numerator = Number(customNumerator);
    const denominator = Number(customDenominator);

    if (!customNumerator || !customDenominator || denominator === 0) {
      setCustomError("Enter both numbers. The bottom number cannot be zero.");
      return;
    }

    if (numerator <= 0 || numerator >= denominator) {
      setCustomError("Use a fraction greater than 0 and less than 1.");
      return;
    }

    pickFraction({
      label: `${numerator}/${denominator}`,
      value: numerator / denominator,
    });
  }

  if (fractionMode) {
    const fractionRows = chunkFractions(COMMON_FRACTIONS);

    return (
      <View
        accessibilityLabel="Fraction keypad"
        style={[styles.container, compact && styles.containerCompact]}
      >
        <View
          style={[
            styles.row,
            styles.fractionUtilityRow,
            compact && styles.fractionUtilityRowCompact,
          ]}
        >
          <Pressable
            accessibilityLabel="Return to number keypad"
            accessibilityRole="button"
            hitSlop={4}
            onPress={exitFractionMode}
            style={({ pressed }) => [
              styles.keyBase,
              compact && styles.keyCompact,
              styles.backKey,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backKeyText}>← Back</Text>
          </Pressable>

          {ROWS[0].slice(1).map((item) => (
            <KeyButton
              key={`fraction-utility-${item.key}`}
              item={item}
              compact={compact}
              onPress={() => pressFractionUtility(item.key)}
            />
          ))}
        </View>

        <Text style={styles.fractionSectionLabel}>Common fractions</Text>

        {fractionRows.map((row, rowIndex) => (
          <View
            key={`fraction-row-${rowIndex}`}
            style={[styles.row, styles.fractionChoiceRow]}
          >
            {row.map((fraction) => (
              <FractionButton
                compact={compact}
                fraction={fraction}
                key={fraction.label}
                onPress={() => pickFraction(fraction)}
              />
            ))}

            {Array.from({ length: 4 - row.length }).map((_, spacerIndex) => (
              <View
                aria-hidden
                key={`fraction-spacer-${rowIndex}-${spacerIndex}`}
                style={styles.keySpacer}
              />
            ))}
          </View>
        ))}

        <View
          style={[
            styles.customFractionCard,
            compact && styles.customFractionCardCompact,
          ]}
        >
          <Text style={styles.customFractionTitle}>Custom fraction</Text>

          <View style={styles.customFractionRow}>
            <View style={styles.customField}>
              <Text style={styles.customFieldLabel}>Top</Text>
              <TextInput
                accessibilityLabel="Custom fraction numerator"
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={(value) =>
                  updateCustomValue(value, setCustomNumerator)
                }
                onSubmitEditing={() => denominatorInputRef.current?.focus()}
                placeholder="1"
                placeholderTextColor={Colors.textSubtle}
                returnKeyType="next"
                selectTextOnFocus
                style={styles.customInput}
                value={customNumerator}
              />
            </View>

            <Text aria-hidden style={styles.customSlash}>
              /
            </Text>

            <View style={styles.customField}>
              <Text style={styles.customFieldLabel}>Bottom</Text>
              <TextInput
                accessibilityLabel="Custom fraction denominator"
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={(value) =>
                  updateCustomValue(value, setCustomDenominator)
                }
                onSubmitEditing={submitCustomFraction}
                placeholder="16"
                placeholderTextColor={Colors.textSubtle}
                ref={denominatorInputRef}
                returnKeyType="done"
                selectTextOnFocus
                style={styles.customInput}
                value={customDenominator}
              />
            </View>

            <Pressable
              accessibilityLabel="Add custom fraction"
              accessibilityRole="button"
              onPress={submitCustomFraction}
              style={({ pressed }) => [
                styles.customAddKey,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.customAddKeyText}>Add</Text>
            </Pressable>
          </View>

          {!!customError && (
            <Text accessibilityRole="alert" style={styles.customError}>
              {customError}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <KeyButton
              key={`${item.key}-${rowIndex}`}
              item={item}
              compact={compact}
              onPress={() => onKeyPress(item.key)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function chunkFractions(fractions: FractionSpec[]): FractionSpec[][] {
  const rows: FractionSpec[][] = [];

  for (let index = 0; index < fractions.length; index += 4) {
    rows.push(fractions.slice(index, index + 4));
  }

  return rows;
}

function FractionButton({
  compact,
  fraction,
  onPress,
}: {
  compact: boolean;
  fraction: FractionSpec;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${fraction.label} inch`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.keyBase,
        compact && styles.keyCompact,
        styles.fractionKey,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.fractionKeyText}>{fraction.label}</Text>
    </Pressable>
  );
}

function KeyButton({
  item,
  compact,
  onPress,
}: {
  item: KeySpec;
  compact: boolean;
  onPress: () => void;
}) {
  const variant = getVariant(item.key);
  const label = item.label ?? item.key;

  return (
    <Pressable
      accessibilityLabel={getAccessibilityLabel(item.key)}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.keyBase,
        compact && styles.keyCompact,
        item.span === 4 && styles.keyFull,
        variant === "operator" && styles.keyOperator,
        variant === "primary" && styles.keyPrimary,
        variant === "utility" && styles.keyUtility,
        variant === "unit" && styles.keyUnit,
        variant === "danger" && styles.keyDanger,
        pressed && styles.pressed,
      ]}
      hitSlop={4}
    >
      <Text
        style={[
          styles.keyText,
          variant === "operator" && styles.keyTextOperator,
          variant === "primary" && styles.keyTextPrimary,
          variant === "danger" && styles.keyTextDanger,
          variant === "unit" && styles.keyTextUnit,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getAccessibilityLabel(key: CalcKey): string {
  const labels: Partial<Record<CalcKey, string>> = {
    C: "Clear",
    "⌫": "Delete last entry",
    FT: "Feet",
    IN: "Inches",
    FRAC: "Choose fraction",
    "×": "Multiply",
    "÷": "Divide",
    "+": "Add",
    "-": "Subtract",
    "=": "Calculate",
    ".": "Decimal point",
  };

  return labels[key] ?? key;
}

type Variant =
  | "default"
  | "operator"
  | "primary"
  | "utility"
  | "unit"
  | "danger";

function getVariant(k: CalcKey): Variant {
  if (k === "=") return "primary";

  if (k === "+" || k === "-" || k === "×" || k === "÷") {
    return "operator";
  }

  if (k === "FT" || k === "IN") {
    return "unit";
  }

  if (k === "⌫") return "utility";

  if (k === "C") return "danger";

  return "default";
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: 390,
    maxHeight: 480,
    gap: 8,
  },

  containerCompact: {
    minHeight: 310,
  },

  row: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },

  keyBase: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: Colors.key,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Effects.controlRaised,
  },

  keyFull: {
    flex: 4.25,
  },

  keyCompact: {
    minHeight: 44,
    borderRadius: 15,
  },

  keyOperator: {
    backgroundColor: Colors.keyOperator,
  },

  keyPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Effects.primaryRaised,
  },

  keyUtility: {
    backgroundColor: Colors.keyUtility,
  },

  keyUnit: {
    backgroundColor: Colors.keyUtility,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },

  keyDanger: {
    backgroundColor: Colors.keyDanger,
  },

  fractionUtilityRow: {
    flexBasis: 60,
    flexGrow: 0,
    flexShrink: 0,
    height: 60,
  },

  fractionUtilityRowCompact: {
    flexBasis: 52,
    height: 52,
  },

  backKey: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
  },

  backKeyText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },

  fractionSectionLabel: {
    color: Colors.textMuted,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginLeft: 4,
    textTransform: "uppercase",
  },

  fractionChoiceRow: {
    minHeight: 52,
  },

  fractionKey: {
    backgroundColor: Colors.surface2,
  },

  fractionKeyText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
  },

  keySpacer: {
    flex: 1,
  },

  customFractionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 0,
    gap: 8,
    padding: 12,
    ...Effects.surfaceRaised,
  },

  customFractionCardCompact: {
    gap: 6,
    paddingVertical: 9,
  },

  customFractionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },

  customFractionRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },

  customField: {
    flex: 1,
    gap: 4,
  },

  customFieldLabel: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  customInput: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderTopColor: "rgba(0, 0, 0, 0.65)",
    borderBottomColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    boxShadow:
      "inset 0 2px 5px rgba(0, 0, 0, 0.34), inset 0 -1px 0 rgba(255, 255, 255, 0.035)",
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    height: 48,
    paddingHorizontal: 10,
    textAlign: "center",
  },

  customSlash: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 48,
  },

  customAddKey: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    ...Effects.primaryRaised,
  },

  customAddKeyText: {
    color: Colors.inverseText,
    fontSize: 15,
    fontWeight: "900",
  },

  customError: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
    ...Effects.pressed,
  },

  keyText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "500",
  },

  keyTextOperator: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "700",
  },

  keyTextPrimary: {
    color: Colors.inverseText,
    fontSize: 28,
    fontWeight: "900",
  },

  keyTextUnit: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  keyTextDanger: {
    color: Colors.text,
    fontWeight: "800",
  },
});
