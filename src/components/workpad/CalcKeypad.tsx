import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";
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

const FRACTION_ROWS: FractionSpec[][] = [
  [
    { label: "1/16", value: 1 / 16 },
    { label: "1/8", value: 1 / 8 },
    { label: "3/16", value: 3 / 16 },
    { label: "1/4", value: 1 / 4 },
  ],
  [
    { label: "5/16", value: 5 / 16 },
    { label: "3/8", value: 3 / 8 },
    { label: "7/16", value: 7 / 16 },
    { label: "1/2", value: 1 / 2 },
  ],
  [
    { label: "9/16", value: 9 / 16 },
    { label: "5/8", value: 5 / 8 },
    { label: "11/16", value: 11 / 16 },
    { label: "3/4", value: 3 / 4 },
  ],
  [
    { label: "13/16", value: 13 / 16 },
    { label: "7/8", value: 7 / 8 },
    { label: "15/16", value: 15 / 16 },
  ],
];

export default function CalcKeypad({
  onKeyPress,
  onPickFraction,
  onExitFractionMode,
  fractionMode = false,
  compact = false,
}: Props) {
  if (fractionMode) {
    return (
      <View
        accessibilityLabel="Fraction keypad"
        style={[styles.container, compact && styles.containerCompact]}
      >
        <View style={styles.row}>
          {ROWS[0].map((item) => (
            <KeyButton
              key={`fraction-utility-${item.key}`}
              item={item}
              compact={compact}
              onPress={() => onKeyPress(item.key)}
            />
          ))}
        </View>

        {FRACTION_ROWS.map((row, rowIndex) => (
          <View key={`fraction-row-${rowIndex}`} style={styles.row}>
            {row.map((fraction) => (
              <FractionButton
                fraction={fraction}
                key={fraction.label}
                onPress={() => onPickFraction(fraction)}
              />
            ))}

            {rowIndex === FRACTION_ROWS.length - 1 && (
              <Pressable
                accessibilityLabel="Return to number keypad"
                accessibilityRole="button"
                onPress={onExitFractionMode}
                style={({ pressed }) => [
                  styles.keyBase,
                  styles.numberModeKey,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.numberModeKeyText}>123</Text>
              </Pressable>
            )}
          </View>
        ))}
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

function FractionButton({
  fraction,
  onPress,
}: {
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
    borderColor: Colors.borderStrong,
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
    backgroundColor: Colors.keyUtility,
  },

  fractionKey: {
    backgroundColor: Colors.surface2,
  },

  fractionKeyText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
  },

  numberModeKey: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
  },

  numberModeKeyText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
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
