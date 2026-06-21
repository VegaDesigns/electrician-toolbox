import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";
import type { CalcKey } from "../../utils/calc/engine";

type Props = {
  onKeyPress: (key: CalcKey) => void;
};

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

export default function CalcKeypad({ onKeyPress }: Props) {
  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <KeyButton
              key={`${item.key}-${rowIndex}`}
              item={item}
              onPress={() => onKeyPress(item.key)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function KeyButton({ item, onPress }: { item: KeySpec; onPress: () => void }) {
  const variant = getVariant(item.key);
  const label = item.label ?? item.key;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.keyBase,
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

  if (k === "FT" || k === "IN" || k === "FRAC") {
    return "unit";
  }

  if (k === "⌫") return "utility";

  if (k === "C") return "danger";

  return "default";
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  keyBase: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: Colors.key,
    alignItems: "center",
    justifyContent: "center",
  },

  keyFull: {
    flex: 4.25,
  },

  keyOperator: {
    backgroundColor: Colors.keyOperator,
  },

  keyPrimary: {
    backgroundColor: Colors.primary,
  },

  keyUtility: {
    backgroundColor: Colors.keyUtility,
  },

  keyUnit: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },

  keyDanger: {
    backgroundColor: Colors.keyDanger,
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
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },

  keyTextDanger: {
    color: Colors.error,
    fontWeight: "800",
  },
});
