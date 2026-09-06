import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalcDisplay, {
  type ResultFormatKey,
  type ResultOption,
} from "../../components/workpad/CalcDisplay";
import CalcKeypad from "../../components/workpad/CalcKeypad";
import HistoryDrawer from "../../components/workpad/HistoryDrawer";
import SmartInputSheet from "../../components/workpad/SmartInputSheet";
import WorkpadSettingsSheet from "../../components/workpad/WorkpadSettingsSheet";

import {
  createInitialCalcState,
  getExpressionString,
  pressKey,
  type CalcKey,
  type CalcResult,
} from "../../utils/calc/engine";

import {
  formatFeetInches,
  ftToIn,
  getRoundingDirection,
  inToFt,
  roundInches,
  type Precision,
} from "../../utils/calc/measure";
import { parseSmartExpression } from "../../utils/calc/parser";
import {
  inferPreferredResultFormat,
  shouldOfferUnitToggle,
  shouldShowInterpretation,
} from "../../utils/calc/outputIntent";

import {
  clearCalcHistory,
  createCalcHistoryItem,
  deleteCalcHistoryItem,
  loadCalcHistory,
  saveCalcHistoryItem,
  toggleCalcHistoryFavorite,
  type CalcHistoryItem,
} from "../../utils/storage/calcHistory";
import {
  DEFAULT_WORKPAD_PREFERENCES,
  loadWorkpadPreferences,
  saveWorkpadPreferences,
} from "../../utils/storage/preferences";

import { styles } from "./styles";

type FractionPick = { label: string; value: number };

function HistoryIcon() {
  return (
    <View aria-hidden style={styles.historyIcon}>
      <View style={styles.historyClockFace}>
        <View style={styles.historyClockHour} />
        <View style={styles.historyClockMinute} />
        <View style={styles.historyClockCenter} />
      </View>
    </View>
  );
}

function formatCleanDecimal(n: number, maxDecimals = 6): string {
  if (!Number.isFinite(n)) return "0";

  const factor = Math.pow(10, maxDecimals);
  const rounded =
    Math.round((n + Math.sign(n) * Number.EPSILON) * factor) / factor;

  if (Object.is(rounded, -0)) return "0";

  return rounded.toFixed(maxDecimals).replace(/\.?0+$/, "");
}

function formatPlainNumber(n: number): string {
  return formatCleanDecimal(n, 8);
}

function formatDecimalResult(n: number, maxDecimals: number): string {
  const formatted = formatCleanDecimal(n, maxDecimals);
  return formatted.includes(".") ? formatted : `${formatted}.0`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x || 1;
}

function formatInchesOnlyFraction(
  totalInches: number,
  precisionValue: Precision,
): string {
  if (!Number.isFinite(totalInches)) return '0"';
  if (precisionValue === "none") {
    return `${formatCleanDecimal(totalInches, 6)}"`;
  }

  const sign = totalInches < 0 ? "-" : "";
  const absInches = Math.abs(totalInches);

  const totalUnits = Math.round(absInches * precisionValue);

  const wholeInches = Math.floor(totalUnits / precisionValue);
  const fractionUnits = totalUnits - wholeInches * precisionValue;

  const parts: string[] = [];

  if (wholeInches > 0) {
    parts.push(String(wholeInches));
  }

  if (fractionUnits > 0) {
    const divisor = gcd(fractionUnits, precisionValue);
    const numerator = fractionUnits / divisor;
    const denominator = precisionValue / divisor;

    parts.push(`${numerator}/${denominator}`);
  }

  if (parts.length === 0) {
    return '0"';
  }

  return `${sign}${parts.join(" ")}"`;
}

export default function WorkpadScreen() {
  const { height } = useWindowDimensions();
  const [state, setState] = useState(createInitialCalcState());
  const [isFracOpen, setIsFracOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSmartInputOpen, setIsSmartInputOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<CalcHistoryItem[]>([]);
  const [cleanedExpression, setCleanedExpression] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy answer");
  const [precision, setPrecision] = useState<Precision>(
    DEFAULT_WORKPAD_PREFERENCES.precision,
  );
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [selectedResultKey, setSelectedResultKey] =
    useState<ResultFormatKey>("ft-in");

  const lastSavedHistoryKeyRef = useRef<string>("");
  const skipNextHistorySaveRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCompact = height < 740;

  const expression = useMemo(() => getExpressionString(state), [state]);

  const result: CalcResult | null = state.lastResult;

  const isEditing = state.tokens.length > 0 || state.buffer.length > 0;
  const hasResult = !!result && !isEditing;

  const resultOptions: ResultOption[] = useMemo(() => {
    if (!result) return [];

    if (result.kind === "number") {
      return [
        {
          key: "standard",
          label: "Result",
          value: formatPlainNumber(result.value),
        },
      ];
    }

    const roundedInches = roundInches(result.inches, precision);
    const decFt = inToFt(result.inches);

    return [
      {
        key: "ft-in",
        label: "Feet & inches",
        value: formatFeetInches(roundedInches, precision),
      },
      {
        key: "rounded-in",
        label: "Inches",
        value: formatInchesOnlyFraction(roundedInches, precision),
      },
      {
        key: "exact-in",
        label: "Exact inches",
        value: `${formatDecimalResult(result.inches, 6)}"`,
      },
      {
        key: "decimal-ft",
        label: "Decimal feet",
        value: `${formatDecimalResult(decFt, 4)} ft`,
      },
    ];
  }, [result, precision]);

  const primary = useMemo(() => {
    if (!result) return "0";

    const selected = resultOptions.find((o) => o.key === selectedResultKey);

    if (selected) {
      return selected.value;
    }

    if (result.kind === "number") {
      return formatPlainNumber(result.value);
    }

    const rounded = roundInches(result.inches, precision);
    return formatFeetInches(rounded, precision);
  }, [result, resultOptions, selectedResultKey, precision]);

  useEffect(() => {
    loadCalcHistory()
      .then(setHistoryItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    loadWorkpadPreferences()
      .then((preferences) => {
        setPrecision(preferences.precision);
      })
      .finally(() => setPreferencesLoaded(true));
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    saveWorkpadPreferences({ precision }).catch(() => {});
  }, [precision, preferencesLoaded]);

  useEffect(() => {
    if (!hasResult || !result || state.lastExpression.trim().length === 0) {
      return;
    }

    if (skipNextHistorySaveRef.current) {
      skipNextHistorySaveRef.current = false;
      return;
    }

    const rawResultKey =
      result.kind === "measure"
        ? `measure:${result.inches}`
        : `number:${result.value}`;

    const historyKey = `${state.lastExpression}=${rawResultKey}`;

    if (lastSavedHistoryKeyRef.current === historyKey) {
      return;
    }

    lastSavedHistoryKeyRef.current = historyKey;

    const historyResult =
      result.kind === "number"
        ? formatPlainNumber(result.value)
        : formatFeetInches(
            roundInches(result.inches, precision),
            precision,
          );

    const item = createCalcHistoryItem(
      state.lastExpression,
      historyResult,
      {
        kind: result.kind,
        value: result.kind === "measure" ? result.inches : result.value,
      },
      cleanedExpression || state.lastExpression,
    );

    saveCalcHistoryItem(item)
      .then(setHistoryItems)
      .catch(() => {});
  }, [
    cleanedExpression,
    hasResult,
    result,
    state.lastExpression,
    precision,
  ]);

  function applyFraction(
    buffer: string,
    fractionLabel: string,
  ): { next: string; error: string | null } {
    const b = buffer.trim();

    if (b.includes(".")) {
      return {
        next: buffer,
        error: "Decimals stay decimal until calculated",
      };
    }

    if (b.length === 0) {
      return {
        next: fractionLabel,
        error: null,
      };
    }

    const existingFractionMatch = b.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);

    if (existingFractionMatch) {
      const whole = existingFractionMatch[1];

      return {
        next: whole ? `${whole} ${fractionLabel}` : fractionLabel,
        error: null,
      };
    }

    const whole = Number(b);

    if (Number.isInteger(whole) && whole >= 0) {
      return {
        next: whole === 0 ? fractionLabel : `${whole} ${fractionLabel}`,
        error: null,
      };
    }

    return {
      next: buffer,
      error: "Enter a whole number before adding a fraction",
    };
  }

  function onKeyPress(key: CalcKey) {
    if (key === "FRAC") {
      setIsFracOpen((v) => !v);
      Haptics.selectionAsync().catch(() => {});
      return;
    }

    if (isFracOpen) {
      setIsFracOpen(false);
    }

    if (key !== "=") {
      setCleanedExpression("");
    }

    if (
      hasResult &&
      result?.kind === "number" &&
      (key === "IN" || key === "FT")
    ) {
      const displayNumber = formatPlainNumber(result.value);

      const inches = key === "IN" ? result.value : ftToIn(result.value);

      const display =
        key === "IN" ? `${displayNumber}in` : `${displayNumber}ft`;

      setState({
        tokens: [
          {
            kind: "measure",
            inches,
            display,
          },
        ],
        buffer: "",
        mode: "measure",
        lastResult: null,
        lastExpression: "",
        error: null,
      });

      setSelectedResultKey(key === "IN" ? "rounded-in" : "ft-in");
      Haptics.selectionAsync().catch(() => {});
      return;
    }

    if (
      hasResult &&
      result?.kind === "measure" &&
      (key === "IN" || key === "FT")
    ) {
      Haptics.selectionAsync().catch(() => {});
      return;
    }

    setState((prev) => {
      const next = pressKey(prev, key);

      if (key === "=" && next.error === null) {
        if (next.lastResult?.kind === "measure") {
          setSelectedResultKey(
            inferPreferredResultFormat(next.lastExpression, "measure"),
          );
        }

        if (next.lastResult?.kind === "number") {
          setSelectedResultKey("standard");
        }

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      } else if (key === "C" || key === "⌫") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        Haptics.selectionAsync().catch(() => {});
      }

      return next;
    });
  }

  function onPickFraction(f: FractionPick) {
    setState((prev) => {
      const r = applyFraction(prev.buffer, f.label);

      return {
        ...prev,
        buffer: r.next,
        error: r.error,
      };
    });

    setIsFracOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }

  function onSelectResultOption(key: ResultFormatKey) {
    setSelectedResultKey(key);
    setCopyLabel("Copy answer");
    Haptics.selectionAsync().catch(() => {});
  }

  function onToggleResultUnit() {
    const showingFeet =
      selectedResultKey === "ft-in" || selectedResultKey === "decimal-ft";
    setSelectedResultKey(showingFeet ? "rounded-in" : "ft-in");
    setCopyLabel("Copy answer");
    Haptics.selectionAsync().catch(() => {});
  }

  function onCopyPrimary() {
    Clipboard.setStringAsync(primary)
      .then(() => {
        setCopyLabel("Copied");
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});

        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(
          () => setCopyLabel("Copy answer"),
          1600,
        );
      })
      .catch(() => {
        setCopyLabel("Copy failed");
      });
  }

  function onClearHistory() {
    clearCalcHistory()
      .then((next) => {
        setHistoryItems(next);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      })
      .catch(() => {});
  }

  function onDeleteHistoryItem(id: string) {
    deleteCalcHistoryItem(id)
      .then((next) => {
        setHistoryItems(next);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      })
      .catch(() => {});
  }

  function onToggleHistoryFavorite(id: string) {
    toggleCalcHistoryFavorite(id)
      .then((next) => {
        setHistoryItems(next);
        Haptics.selectionAsync().catch(() => {});
      })
      .catch(() => {});
  }

  function onSelectHistoryItem(item: CalcHistoryItem) {
    if (item.resultKind !== "number" && item.resultKind !== "measure") {
      setIsHistoryOpen(false);
      return;
    }

    if (typeof item.rawValue !== "number" || !Number.isFinite(item.rawValue)) {
      setIsHistoryOpen(false);
      return;
    }

    skipNextHistorySaveRef.current = true;
    setCleanedExpression(item.cleanedExpression ?? item.expression);

    if (item.resultKind === "measure") {
      setState({
        tokens: [],
        buffer: "",
        mode: "measure",
        lastResult: {
          kind: "measure",
          inches: item.rawValue,
        },
        lastExpression: item.expression,
        error: null,
      });

      setSelectedResultKey(
        inferPreferredResultFormat(item.expression, "measure"),
      );
    } else {
      setState({
        tokens: [],
        buffer: "",
        mode: "number",
        lastResult: {
          kind: "number",
          value: item.rawValue,
        },
        lastExpression: item.expression,
        error: null,
      });

      setSelectedResultKey("standard");
    }

    setIsHistoryOpen(false);
    Haptics.selectionAsync().catch(() => {});
  }

  function onSubmitSmartInput(value: string): string | null {
    const parsed = parseSmartExpression(value);

    if (!parsed.ok) return parsed.error;

    setState({
      tokens: [],
      buffer: "",
      mode: parsed.result.kind === "measure" ? "measure" : "number",
      lastResult: parsed.result,
      lastExpression: value.trim(),
      error: null,
    });
    setCleanedExpression(parsed.cleaned);
    setSelectedResultKey(inferPreferredResultFormat(value, parsed.result.kind));
    setIsSmartInputOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    return null;
  }

  function updatePrecision(next: Precision) {
    setPrecision(next);
    Haptics.selectionAsync().catch(() => {});
  }

  const interpretation =
    hasResult &&
    result &&
    shouldShowInterpretation(
      state.lastExpression,
      cleanedExpression,
      result.kind,
    )
      ? cleanedExpression.trim()
      : "";
  const showUnitToggle = shouldOfferUnitToggle(result);
  const roundingNotice = useMemo(() => {
    if (
      !hasResult ||
      result?.kind !== "measure" ||
      precision === "none" ||
      (selectedResultKey !== "ft-in" && selectedResultKey !== "rounded-in")
    ) {
      return "";
    }

    const rounded = roundInches(result.inches, precision);
    const direction = getRoundingDirection(result.inches, rounded);
    if (!direction) return "";

    const original =
      selectedResultKey === "ft-in"
        ? formatFeetInches(result.inches, "none")
        : `${formatCleanDecimal(result.inches, 6)}"`;

    return `${direction === "up" ? "↑" : "↓"} Rounded ${direction} from ${original}`;
  }, [hasResult, precision, result, selectedResultKey]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityLabel="Return to toolbox home"
          accessibilityRole="button"
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.replace("/");
          }}
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.homeButtonText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Workpad Calculator</Text>

        <Pressable
          accessibilityLabel="Open calculation history"
          accessibilityRole="button"
          onPress={() => setIsHistoryOpen(true)}
          style={({ pressed }) => [
            styles.historyButton,
            pressed && styles.pressed,
          ]}
        >
          <HistoryIcon />
        </Pressable>

        <Pressable
          accessibilityHint="Changes measurement precision and rounding"
          accessibilityLabel="Open Workpad settings"
          accessibilityRole="button"
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setIsSettingsOpen(true);
          }}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.settingsButtonText}>⚙︎</Text>
        </Pressable>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.container,
          isCompact && styles.containerCompact,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CalcDisplay
          copyLabel={copyLabel}
          error={state.error}
          expression={expression}
          hasResult={hasResult}
          interpretation={interpretation}
          onCopy={onCopyPrimary}
          onDismissInterpretation={() => setCleanedExpression("")}
          onOpenSmartInput={() => setIsSmartInputOpen(true)}
          onToggleUnit={onToggleResultUnit}
          primary={primary}
          roundingNotice={roundingNotice}
          showUnitToggle={showUnitToggle}
          unitToggleLabel={
            selectedResultKey === "ft-in" ||
            selectedResultKey === "decimal-ft"
              ? "in"
              : "ft/in"
          }
        />

        <CalcKeypad
          compact={isCompact}
          fractionMode={isFracOpen}
          onExitFractionMode={() => setIsFracOpen(false)}
          onKeyPress={onKeyPress}
          onPickFraction={onPickFraction}
        />
      </ScrollView>

      <HistoryDrawer
        visible={isHistoryOpen}
        items={historyItems}
        onClose={() => setIsHistoryOpen(false)}
        onClear={onClearHistory}
        onDeleteItem={onDeleteHistoryItem}
        onSelectItem={onSelectHistoryItem}
        onToggleFavorite={onToggleHistoryFavorite}
      />

      {isSmartInputOpen && (
        <SmartInputSheet
          initialValue={state.lastExpression}
          onClose={() => setIsSmartInputOpen(false)}
          onSubmit={onSubmitSmartInput}
        />
      )}

      <WorkpadSettingsSheet
        onChangePrecision={updatePrecision}
        onClose={() => setIsSettingsOpen(false)}
        onSelectResultFormat={onSelectResultOption}
        precision={precision}
        resultOptions={resultOptions}
        selectedResultKey={selectedResultKey}
        visible={isSettingsOpen}
      />
    </SafeAreaView>
  );
}
