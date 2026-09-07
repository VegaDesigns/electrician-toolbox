import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  compact: boolean;
  copyLabel: string;
  error: string | null;
  expression: string;
  hasResult: boolean;
  interpretation: string;
  onCopy: () => void;
  onOpenSmartInput: () => void;
  onToggleUnit: () => void;
  primary: string;
  roundingNotice: string;
  showUnitToggle: boolean;
  unitToggleLabel: "ft/in" | "in";
};

export default function CalcDisplay({
  compact,
  copyLabel,
  error,
  expression,
  hasResult,
  interpretation,
  onCopy,
  onOpenSmartInput,
  onToggleUnit,
  primary,
  roundingNotice,
  showUnitToggle,
  unitToggleLabel,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const equationRef = useRef<ScrollView>(null);
  const entryRef = useRef<ScrollView>(null);
  useEffect(() => {
    equationRef.current?.scrollToEnd({ animated: false });
    entryRef.current?.scrollToEnd({ animated: false });
  }, [expression]);
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
    <View style={[styles.display, compact && styles.displayCompact]}>
      <View style={styles.toolbar}>
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
      ) : <View />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cleanExpression ? "Edit current equation" : "Type a measurement"}
        onPress={onOpenSmartInput}
        style={({ pressed }) => [styles.editButton, pressed && styles.actionPressed]}
      >
        <Text style={styles.editText}>✎ {cleanExpression ? "Edit" : "Type"}</Text>
      </Pressable>
      </View>

      <View style={[styles.valueArea, compact && styles.valueAreaCompact]}>
      <ScrollView horizontal ref={equationRef} style={[styles.equationScroll, compact && styles.equationScrollCompact]}
        contentContainerStyle={styles.equationContent} showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => equationRef.current?.scrollToEnd({ animated: false })}>
      <Pressable accessibilityLabel="Edit current equation" accessibilityRole="button" onPress={onOpenSmartInput}>
        <Text
          numberOfLines={1}
          style={[styles.topLine, !hasResult && !cleanExpression && styles.topLineHint]}
        >
          {topLine}
        </Text>
      </Pressable>
      </ScrollView>

        {hasResult ? <FormattedMainValue value={mainDisplay} compact={compact} /> : (
          <ScrollView horizontal ref={entryRef} style={[styles.entryScroll, compact && styles.entryScrollCompact]}
            contentContainerStyle={styles.equationContent} showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => entryRef.current?.scrollToEnd({ animated: false })}>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit current equation" onPress={onOpenSmartInput}>
          <Text
            numberOfLines={1}
            style={[styles.mainValue, compact && styles.mainValueCompact]}
          >
            {mainDisplay}
          </Text>
          </Pressable>
          </ScrollView>
        )}
      </View>

      <Pressable disabled={!error && !interpretation && !roundingNotice}
        accessibilityRole="button" accessibilityLabel="Read calculation details"
        onPress={() => setDetailsOpen(true)} style={styles.feedbackSlot}>
        {error ? (
          <Text accessibilityRole="alert" numberOfLines={1} style={styles.error}>
            {error}
          </Text>
        ) : roundingNotice ? (
          <Text numberOfLines={1} style={styles.roundingNotice}>{roundingNotice}</Text>
        ) : interpretation ? (
          <View style={styles.interpretationRow}>
            <Text numberOfLines={1} style={styles.interpretationText}>
              ✦ Interpreted as {interpretation}
            </Text>
          </View>
        ) : null}
        {error || interpretation || roundingNotice ? <Text style={styles.detailsIcon}>ⓘ</Text> : null}
      </Pressable>

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
      <Modal transparent visible={detailsOpen} animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
        <SafeAreaProvider>
          <SafeAreaView edges={["top", "bottom"]} style={styles.detailSafe}>
            <Pressable accessibilityLabel="Close calculation details" onPress={() => setDetailsOpen(false)} style={styles.detailScrim} />
            <View style={styles.detailSheet}>
              <View style={styles.toolbar}>
                <Text style={styles.detailTitle}>Calculation details</Text>
                <Pressable accessibilityRole="button" onPress={() => setDetailsOpen(false)} style={styles.editButton}>
                  <Text style={styles.editText}>Done</Text>
                </Pressable>
              </View>
              <ScrollView>
                {error ? <Text style={styles.detailError}>{error}</Text> : null}
                {roundingNotice ? <Text style={styles.detailBody}>{roundingNotice}</Text> : null}
                {interpretation ? <Text style={styles.detailBody}>Interpreted as {interpretation}</Text> : null}
              </ScrollView>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

function FormattedMainValue({ value, compact }: { value: string; compact: boolean }) {
  const parsed = parseFractionDisplay(value);

  if (!parsed) {
    return (
      <Text
        style={[styles.mainValue, compact && styles.mainValueCompact]}
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
      style={[styles.mainValue, compact && styles.mainValueCompact]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.35}
    >
      {parsed.before}
      <Text style={[styles.inlineFraction, compact && styles.inlineFractionCompact]}>
        {parsed.numerator}/{parsed.denominator}
      </Text>
      {parsed.after.length > 0 && (
        <Text style={[styles.inlineUnit, compact && styles.inlineUnitCompact]}>{parsed.after}</Text>
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
    height: 246,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    ...Effects.surfaceRaised,
  },

  valueArea: {
    justifyContent: "flex-end",
    height: 96,
    paddingHorizontal: 2,
  },
  displayCompact: { height: 222 },
  valueAreaCompact: { height: 72 },
  equationScrollCompact: { height: 24 },
  entryScrollCompact: { height: 48 },
  mainValueCompact: { fontSize: 42, lineHeight: 48 },
  inlineFractionCompact: { fontSize: 30 },
  inlineUnitCompact: { fontSize: 34 },

  displayPressed: {
    opacity: 0.86,
  },

  topLine: {
    color: Colors.textMuted,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
    minHeight: 25,
  },

  topLineHint: {
    color: Colors.textSubtle,
    fontSize: 14,
    fontWeight: "700",
  },

  mainValue: {
    color: Colors.text,
    fontSize: 54,
    fontWeight: "400",
    fontVariant: ["tabular-nums"],
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
    fontWeight: "400",
  },

  feedbackSlot: {
    height: 44,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  interpretationRow: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },

  interpretationText: {
    color: Colors.primary,
    flex: 1,
    fontSize: 12,
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
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },

  roundingNotice: {
    color: Colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },

  actionSlot: {
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
  },

  unitToggle: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    minWidth: 52,
    paddingHorizontal: 10,
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
    height: 44,
    justifyContent: "center",
    minWidth: 86,
    paddingHorizontal: 11,
    ...Effects.controlRaised,
  },

  copyButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
    ...Effects.pressed,
  },
  toolbar: { flexDirection: "row", height: 44, alignItems: "center", justifyContent: "space-between" },
  editButton: { minHeight: 44, minWidth: 54, paddingHorizontal: 8, justifyContent: "center", alignItems: "center" },
  editText: { color: Colors.textMuted, fontSize: 13, fontWeight: "700" },
  equationScroll: { flexGrow: 0, height: 26 },
  entryScroll: { flexGrow: 0, height: 70 },
  equationContent: { flexGrow: 1, justifyContent: "flex-end", alignItems: "center" },
  detailsIcon: { color: Colors.textMuted, fontSize: 17 },
  detailSafe: { flex: 1, justifyContent: "flex-end" },
  detailScrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.7)" },
  detailSheet: { backgroundColor: Colors.surface, padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%" },
  detailTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", flexShrink: 1 },
  detailBody: { color: Colors.text, fontSize: 15, lineHeight: 23, marginVertical: 10 },
  detailError: { color: Colors.error, fontSize: 15, lineHeight: 23, marginVertical: 10 },
});
