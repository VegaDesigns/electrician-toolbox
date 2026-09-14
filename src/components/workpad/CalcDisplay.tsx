import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , Radius, FontSize, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import React, { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const styles = useStyles();

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

      <Pressable accessibilityRole="button" accessibilityLabel="Edit current equation" onPress={onOpenSmartInput} style={[styles.valueArea, compact && styles.valueAreaCompact]}>
      <ScrollView horizontal ref={equationRef} style={[styles.equationScroll, compact && styles.equationScrollCompact]}
        contentContainerStyle={styles.equationContent} showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => equationRef.current?.scrollToEnd({ animated: false })}>
        <Text
          numberOfLines={1}
          style={[styles.topLine, !hasResult && !cleanExpression && styles.topLineHint]}
        >
          {topLine}
        </Text>
      </ScrollView>

        {hasResult ? <FormattedMainValue value={mainDisplay} compact={compact} /> : (
          <ScrollView horizontal ref={entryRef} style={[styles.entryScroll, compact && styles.entryScrollCompact]}
            contentContainerStyle={styles.equationContent} showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => entryRef.current?.scrollToEnd({ animated: false })}>
          <Text
            numberOfLines={1}
            style={[styles.mainValue, compact && styles.mainValueCompact]}
          >
            {mainDisplay}
          </Text>
          </ScrollView>
        )}
      </Pressable>

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
            <Pressable accessibilityLabel="Close calculation details" onPress={() => setDetailsOpen(false)} style={styles.detailScrim} feedback="none" />
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
  const styles = useStyles();

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

const useStyles = defineStyles(({ colors: Colors }) => ({
  display: {
    height: 262,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    borderWidth: 0,

  },

  valueArea: {
    justifyContent: "flex-end",
    height: 96,
    paddingHorizontal: 2,
  },
  displayCompact: { height: 238 },
  valueAreaCompact: { height: 72 },
  equationScrollCompact: { height: 24 },
  entryScrollCompact: { height: 48 },
  mainValueCompact: { fontSize: FontSize.display, lineHeight: 48 },
  inlineFractionCompact: { fontSize: FontSize.heading },
  inlineUnitCompact: { fontSize: FontSize.screen },

  displayPressed: {
    opacity: 0.86,
  },

  topLine: {
    color: Colors.textMuted,
    fontSize: FontSize.subtitle,
    fontWeight: "600",
    textAlign: "right",
    minHeight: 25,
  },

  topLineHint: {
    color: Colors.textSubtle,
    fontSize: FontSize.label,
    fontWeight: "500",
  },

  mainValue: {
    color: Colors.text,
    fontSize: FontSize.hero,
    fontWeight: "400",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    letterSpacing: -1.5,
  },

  inlineFraction: {
    color: Colors.text,
    fontSize: FontSize.screen,
    fontWeight: "400",
    letterSpacing: -0.8,
  },

  inlineUnit: {
    color: Colors.text,
    fontSize: FontSize.display,
    fontWeight: "400",
  },

  feedbackSlot: {
    height: 48,
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
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  interpretationDismiss: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 24,
  },

  interpretationDismissText: {
    color: Colors.primary,
    fontSize: FontSize.subtitle,
    fontWeight: "500",
    lineHeight: 20,
  },

  error: {
    color: Colors.error,
    flex: 1,
    fontSize: FontSize.caption,
    fontWeight: "500",
    textAlign: "right",
  },

  roundingNotice: {
    color: Colors.textMuted,
    flex: 1,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  actionSlot: {
    alignItems: "center",
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
  },

  unitToggle: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.primaryMuted,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    minWidth: 52,
    paddingHorizontal: 10,
    zIndex: 2,

  },

  unitToggleText: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  copyButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    minWidth: 86,
    paddingHorizontal: 11,

  },

  copyButtonText: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],

  },
  toolbar: { flexDirection: "row", height: 48, alignItems: "center", justifyContent: "space-between" },
  editButton: { minHeight: 48, minWidth: 54, paddingHorizontal: Space.xs, justifyContent: "center", alignItems: "center" },
  editText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500" },
  equationScroll: { flexGrow: 0, height: 26 },
  entryScroll: { flexGrow: 0, height: 70 },
  equationContent: { flexGrow: 1, justifyContent: "flex-end", alignItems: "center" },
  detailsIcon: { color: Colors.textMuted, fontSize: FontSize.body },
  detailSafe: { flex: 1, justifyContent: "flex-end" },
  detailScrim: { ...StyleSheet.absoluteFill, backgroundColor: Colors.overlay },
  detailSheet: { backgroundColor: Colors.surface, padding: Space.md, borderTopLeftRadius: Radius.sheet, borderTopRightRadius: Radius.sheet, maxHeight: "75%" },
  detailTitle: { fontFamily: Fonts.heading, color: Colors.text, fontSize: FontSize.subtitle, fontWeight: "500", flexShrink: 1 },
  detailBody: { color: Colors.text, fontSize: FontSize.label, lineHeight: 23, marginVertical: 10 },
  detailError: { color: Colors.error, fontSize: FontSize.label, lineHeight: 23, marginVertical: 10 },
}));
