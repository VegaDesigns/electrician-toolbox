import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , Radius, FontSize, Fonts } from "../../theme/tokens";
import { defineStyles, useAppTheme } from "../../theme";
import { displayScale } from "../../utils/calc/display";
import type { EquationSelection } from "../../utils/calc/equationEdit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
  inputRef: React.RefObject<TextInput | null>;
  selection?: EquationSelection;
  onBeginEdit: () => void;
  onSelectionChange: (selection: EquationSelection) => void;
  onChangeText: (text: string) => void;
  onSubmitEdit: () => void;
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
  inputRef,
  selection,
  onBeginEdit,
  onSelectionChange,
  onChangeText,
  onSubmitEdit,
  onToggleUnit,
  primary,
  roundingNotice,
  showUnitToggle,
  unitToggleLabel,
}: Props) {
  const styles = useStyles();
  const { theme: { colors } } = useAppTheme();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const entryRef = useRef<ScrollView>(null);
  const entryWidth = useRef(0);
  const naturalWidth = useRef(0);
  const [fittedScale, setFittedScale] = useState(1);
  const followFrame = useRef<number | null>(null);
  const followLatest = useCallback(() => {
    // Content/layout and input events can arrive in the same frame. Follow once,
    // immediately, rather than continually restarting a native scroll animation.
    if (followFrame.current !== null) return;
    followFrame.current = requestAnimationFrame(() => {
      followFrame.current = null;
      entryRef.current?.scrollToEnd({ animated: false });
      // Browsers do not follow selection updates on an unfocused input. Keep
      // normal keypad entry at the trailing digit without stealing edit focus.
      if (Platform.OS === "web" && inputRef.current && !inputRef.current.isFocused()) {
        const field = inputRef.current as unknown as { scrollLeft: number; scrollWidth: number };
        field.scrollLeft = field.scrollWidth;
      }
    });
  }, [inputRef]);
  useEffect(followLatest, [expression, primary, hasResult, compact, followLatest]);
  useEffect(() => () => {
    if (followFrame.current !== null) cancelAnimationFrame(followFrame.current);
  }, []);
  const baseSize = compact ? 38 : FontSize.hero;
  const minimumSize = compact ? FontSize.heading : FontSize.screen;
  function fitMeasuredText() {
    // Retain this size while the next character is being measured. Never reset
    // to full size on a keystroke. At the size floor, React skips state updates.
    setFittedScale(previous => displayScale(naturalWidth.current, entryWidth.current, baseSize, minimumSize, previous));
  }
  const cleanExpression = expression.trim();

  const mainDisplay = hasResult
    ? primary
    : cleanExpression.length > 0
      ? cleanExpression
      : "0";
  const scale = Math.max(minimumSize / baseSize, fittedScale);

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
      <View />
      </View>

      <View style={[styles.valueArea, compact && styles.valueAreaCompact]}
        onLayout={event => { entryWidth.current = event.nativeEvent.layout.width - 4; fitMeasuredText(); }}>
        {/* One persistent native field gives real caret placement, selection,
            paste and horizontal caret following, without a second keyboard. */}
        <TextInput
          ref={inputRef}
          accessibilityLabel="Equation"
          accessibilityHint="Tap to place the cursor, then use the calculator keys. Press equals to calculate."
          value={expression}
          placeholder={hasResult ? "" : "0"}
          placeholderTextColor={colors.text}
          selectionColor={colors.primary}
          selection={selection ?? { start: expression.length, end: expression.length }}
          showSoftInputOnFocus={false}
          inputMode="none"
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          multiline={false}
          returnKeyType="done"
          onFocus={onBeginEdit}
          onSelectionChange={event => {
            if (inputRef.current?.isFocused()) onSelectionChange(event.nativeEvent.selection);
          }}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEdit}
          style={[
            styles.equationInput,
            hasResult ? styles.completedEquation : [styles.liveEquation, compact && styles.liveEquationCompact,
              { fontSize: baseSize * scale, letterSpacing: -1.5 * scale }],
          ]}
        />
        {hasResult ? (
          <ScrollView horizontal ref={entryRef} style={[styles.entryScroll, compact && styles.entryScrollCompact]}
            contentContainerStyle={styles.equationContent} showsHorizontalScrollIndicator={false}
            onLayout={followLatest}
            onContentSizeChange={followLatest}>
            <FormattedMainValue value={mainDisplay} compact={compact} scale={scale} formatFraction={hasResult} />
          </ScrollView>
        ) : null}
      </View>
      {/* Measure the unscaled text offscreen. Horizontal content has no width cap;
          unlike character-count guesses, this also measures units and fractions. */}
      <ScrollView horizontal scrollEnabled={false} pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants"
        style={styles.measurement} showsHorizontalScrollIndicator={false}>
        <FormattedMainValue value={mainDisplay} compact={compact} formatFraction={hasResult}
          onLayout={event => { naturalWidth.current = event.nativeEvent.layout.width; fitMeasuredText(); }} />
      </ScrollView>

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
                {cleanExpression ? <>
                  <Text style={styles.detailLabel}>EQUATION</Text>
                  <Text selectable style={[styles.detailBody, styles.fullCalculation]}>{cleanExpression}</Text>
                </> : null}
                {hasResult ? <>
                  <Text style={styles.detailLabel}>ANSWER</Text>
                  <Text selectable style={[styles.detailBody, styles.fullCalculation]}>{primary}</Text>
                </> : null}
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

function FormattedMainValue({ value, compact, scale = 1, formatFraction = true, onLayout }: {
  value: string; compact: boolean; scale?: number; formatFraction?: boolean; onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const styles = useStyles();

  const parsed = formatFraction ? parseFractionDisplay(value) : null;
  const sized = { fontSize: (compact ? 38 : FontSize.hero) * scale, letterSpacing: -1.5 * scale };

  if (!parsed) {
    return (
      <Text
        onLayout={onLayout}
        style={[styles.mainValue, compact && styles.mainValueCompact, sized]}
        numberOfLines={1}
      >
        {value}
      </Text>
    );
  }

  return (
    <Text
      onLayout={onLayout}
      style={[styles.mainValue, compact && styles.mainValueCompact, sized]}
      numberOfLines={1}
    >
      {parsed.before}
      <Text style={[styles.inlineFraction, { fontSize: (compact ? FontSize.heading : FontSize.screen) * scale, letterSpacing: -0.8 * scale }]}>
        {parsed.numerator}/{parsed.denominator}
      </Text>
      {parsed.after.length > 0 && (
        <Text style={[styles.inlineUnit, { fontSize: (compact ? FontSize.screen : FontSize.display) * scale }]}>{parsed.after}</Text>
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
  equationInput: { color: Colors.text, fontVariant: ["tabular-nums"], textAlign: "right", padding: 0, borderWidth: 0, backgroundColor: Colors.transparent, includeFontPadding: false },
  // Keep the equation's existing baseline but give it a full-height tap area.
  completedEquation: { color: Colors.textMuted, fontSize: FontSize.subtitle, fontWeight: "600", height: 48, marginTop: -11, marginBottom: -11 },
  liveEquation: { fontSize: FontSize.hero, fontWeight: "400", height: 70, marginTop: 26 },
  liveEquationCompact: { height: 48, marginTop: 24 },
  measurement: { position: "absolute", left: 0, right: 0, top: 0, height: 0, opacity: 0 },
  entryScrollCompact: { height: 46 },
  mainValueCompact: { fontSize: 38, lineHeight: 44 },
  inlineFractionCompact: { fontSize: FontSize.heading },
  inlineUnitCompact: { fontSize: FontSize.screen },

  displayPressed: {
    opacity: 0.86,
  },

  mainValue: {
    color: Colors.text,
    fontSize: FontSize.hero,
    fontWeight: "400",
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    letterSpacing: -1.5,
    lineHeight: 66,
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
  detailLabel: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500", marginTop: Space.sm },
  fullCalculation: { fontSize: FontSize.subtitle, lineHeight: 28 },
  editButton: { minHeight: 48, minWidth: 54, paddingHorizontal: Space.xs, justifyContent: "center", alignItems: "center" },
  editText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500" },
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
