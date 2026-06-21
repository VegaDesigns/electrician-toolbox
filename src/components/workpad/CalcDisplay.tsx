import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

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
  expression: string;
  primary: string;
  resultOptions: ResultOption[];
  selectedResultKey: ResultFormatKey;
  onSelectResultOption: (key: ResultFormatKey) => void;
  error: string | null;
  hasResult: boolean;
};

export default function CalcDisplay({
  expression,
  primary,
  resultOptions,
  selectedResultKey,
  onSelectResultOption,
  error,
  hasResult,
}: Props) {
  const cleanExpression = expression.trim();

  const mainDisplay = hasResult
    ? primary
    : cleanExpression.length > 0
      ? cleanExpression
      : "0";

  const topLine = hasResult ? cleanExpression : "";

  const shouldShowResultOptions = hasResult && resultOptions.length > 1;

  return (
    <View style={styles.display}>
      <Text
        style={styles.topLine}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {topLine}
      </Text>

      {hasResult ? (
        <FormattedMainValue value={mainDisplay} />
      ) : (
        <Text
          style={styles.mainValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.35}
        >
          {mainDisplay}
        </Text>
      )}

      {shouldShowResultOptions && (
        <View style={styles.detailsRow}>
          {resultOptions.map((option) => {
            const isSelected = option.key === selectedResultKey;

            return (
              <Pressable
                key={option.key}
                onPress={() => onSelectResultOption(option.key)}
                style={({ pressed }) => [
                  styles.detailPill,
                  isSelected && styles.detailPillSelected,
                  pressed && styles.detailPillPressed,
                ]}
              >
                <Text
                  style={[
                    styles.detailLabel,
                    isSelected && styles.detailLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>

                <Text
                  style={[
                    styles.detailText,
                    isSelected && styles.detailTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {option.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.error} numberOfLines={2}>
            {error}
          </Text>
        </View>
      )}
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
    minHeight: 150,
    justifyContent: "flex-end",
    paddingHorizontal: 4,
    paddingBottom: 6,
  },

  topLine: {
    color: Colors.textSubtle,
    fontSize: 19,
    fontWeight: "600",
    textAlign: "right",
    minHeight: 26,
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

  detailsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },

  detailPill: {
    maxWidth: "49%",
    minWidth: "48%",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  detailPillSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
  },

  detailPillPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },

  detailLabel: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  detailLabelSelected: {
    color: Colors.primary,
  },

  detailText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },

  detailTextSelected: {
    color: Colors.text,
  },

  errorBox: {
    alignSelf: "flex-end",
    marginTop: 8,
    maxWidth: "92%",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.errorSoft ?? "#3A1D24",
    borderWidth: 1,
    borderColor: Colors.error,
  },

  error: {
    color: Colors.error,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
  },
});
