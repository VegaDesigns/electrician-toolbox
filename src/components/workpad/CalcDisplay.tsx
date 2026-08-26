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
  onCopy: () => void;
  copyLabel: string;
  onOpenSmartInput: () => void;
  error: string | null;
  hasResult: boolean;
};

export default function CalcDisplay({
  expression,
  primary,
  resultOptions,
  selectedResultKey,
  onSelectResultOption,
  onCopy,
  copyLabel,
  onOpenSmartInput,
  error,
  hasResult,
}: Props) {
  const [areDetailsOpen, setAreDetailsOpen] = React.useState(false);
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

  const shouldShowResultOptions = hasResult && resultOptions.length > 1;

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityHint="Opens a text field for entries such as one foot six inches"
        accessibilityLabel="Calculator display. Tap to type a measurement"
        accessibilityRole="button"
        onPress={onOpenSmartInput}
        style={({ pressed }) => [
          styles.display,
          pressed && styles.displayPressed,
        ]}
      >
        <Text
          style={[styles.topLine, !hasResult && !cleanExpression && styles.topLineHint]}
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
      </Pressable>

      {shouldShowResultOptions && (
        <Pressable
          accessibilityLabel="Other result formats and copy"
          accessibilityRole="button"
          accessibilityState={{ expanded: areDetailsOpen }}
          onPress={() => setAreDetailsOpen((open) => !open)}
          style={({ pressed }) => [
            styles.detailsToggle,
            pressed && styles.detailPillPressed,
          ]}
        >
          <Text style={styles.detailsToggleText}>Other formats</Text>
          <Text style={styles.detailsToggleChevron}>{areDetailsOpen ? "⌃" : "⌄"}</Text>
        </Pressable>
      )}

      {shouldShowResultOptions && areDetailsOpen && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailsRow}>
            {resultOptions.map((option) => {
              const isSelected = option.key === selectedResultKey;

              return (
                <Pressable
                  accessibilityLabel={`${option.label}: ${option.value}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
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

          <Pressable
            accessibilityLabel={copyLabel}
            accessibilityRole="button"
            onPress={onCopy}
            style={({ pressed }) => [
              styles.copyButton,
              pressed && styles.copyButtonPressed,
            ]}
          >
            <Text style={styles.copyButtonText}>{copyLabel}</Text>
          </Pressable>
        </View>
      )}

      {hasResult && !shouldShowResultOptions && (
        <Pressable
          accessibilityLabel={copyLabel}
          accessibilityRole="button"
          onPress={onCopy}
          style={({ pressed }) => [
            styles.copyButton,
            pressed && styles.copyButtonPressed,
          ]}
        >
          <Text style={styles.copyButtonText}>{copyLabel}</Text>
        </Pressable>
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
  wrapper: {
    gap: 7,
  },

  display: {
    minHeight: 175,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },

  displayPressed: {
    opacity: 0.86,
  },

  topLine: {
    color: Colors.textSubtle,
    fontSize: 19,
    fontWeight: "600",
    textAlign: "right",
    minHeight: 26,
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

  detailsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 6,
  },

  detailsToggle: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  detailsToggleText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  detailsToggleChevron: {
    color: Colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },

  expandedDetails: {
    padding: 9,
    borderRadius: 15,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: Colors.error,
  },

  error: {
    color: Colors.error,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
  },

  copyButton: {
    alignSelf: "flex-end",
    minHeight: 44,
    minWidth: 108,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 14,
  },

  copyButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  copyButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});
