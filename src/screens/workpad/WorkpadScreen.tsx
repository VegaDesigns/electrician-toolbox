import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

import CalcDisplay, {
  type ResultFormatKey,
  type ResultOption,
} from "../../components/workpad/CalcDisplay";
import CalcKeypad from "../../components/workpad/CalcKeypad";
import FractionTray from "../../components/workpad/FractionTray";
import HistoryDrawer from "../../components/workpad/HistoryDrawer";

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
  inToFt,
  roundInches,
  type Precision,
} from "../../utils/calc/measure";

import {
  clearCalcHistory,
  createCalcHistoryItem,
  deleteCalcHistoryItem,
  loadCalcHistory,
  saveCalcHistoryItem,
  type CalcHistoryItem,
} from "../../utils/storage/calcHistory";

import { Colors } from "../../theme";
import { styles } from "./styles";

type FractionPick = { label: string; value: number };

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
  const [state, setState] = useState(createInitialCalcState());
  const [isFracOpen, setIsFracOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<CalcHistoryItem[]>([]);
  const [selectedResultKey, setSelectedResultKey] =
    useState<ResultFormatKey>("ft-in");

  const lastSavedHistoryKeyRef = useRef<string>("");

  const precision: Precision = 16;
  const roundMode: "nearest" | "up" = "nearest";

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

    const roundedInches = roundInches(result.inches, precision, roundMode);
    const decFt = inToFt(result.inches);

    return [
      {
        key: "ft-in",
        label: "Ft/In",
        value: formatFeetInches(roundedInches, precision),
      },
      {
        key: "exact-in",
        label: "Exact in",
        value: `${formatCleanDecimal(result.inches, 6)}"`,
      },
      {
        key: "decimal-ft",
        label: "Total ft",
        value: `${formatCleanDecimal(decFt, 4)} ft`,
      },
      {
        key: "rounded-in",
        label: "Rounded in",
        value: formatInchesOnlyFraction(roundedInches, precision),
      },
    ];
  }, [result, precision, roundMode]);

  const primary = useMemo(() => {
    if (!result) return "0";

    const selected = resultOptions.find((o) => o.key === selectedResultKey);

    if (selected) {
      return selected.value;
    }

    if (result.kind === "number") {
      return formatPlainNumber(result.value);
    }

    const rounded = roundInches(result.inches, precision, roundMode);
    return formatFeetInches(rounded, precision);
  }, [result, resultOptions, selectedResultKey, precision, roundMode]);

  useEffect(() => {
    loadCalcHistory()
      .then(setHistoryItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasResult || !result || state.lastExpression.trim().length === 0) {
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
            roundInches(result.inches, precision, roundMode),
            precision,
          );

    const item = createCalcHistoryItem(state.lastExpression, historyResult);

    saveCalcHistoryItem(item)
      .then(setHistoryItems)
      .catch(() => {});
  }, [hasResult, result, state.lastExpression, precision, roundMode]);

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

      setSelectedResultKey("ft-in");
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
          setSelectedResultKey("ft-in");
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
    Haptics.selectionAsync().catch(() => {});
  }

  function onClearHistory() {
    clearCalcHistory()
      .then(() => {
        setHistoryItems([]);
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Workpad Calculator</Text>
            <Text style={styles.subtitle}>
              Tap a measurement result format to make it the main answer.
            </Text>
          </View>

          <Pressable
            onPress={() => setIsHistoryOpen(true)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              },
              pressed && {
                opacity: 0.75,
                transform: [{ scale: 0.98 }],
              },
            ]}
          >
            <Text
              style={{
                color: Colors.text,
                fontSize: 13,
                fontWeight: "900",
              }}
            >
              History
            </Text>
          </Pressable>
        </View>

        <CalcDisplay
          expression={expression}
          primary={primary}
          resultOptions={resultOptions}
          selectedResultKey={selectedResultKey}
          onSelectResultOption={onSelectResultOption}
          error={state.error}
          hasResult={hasResult}
        />

        {isFracOpen && (
          <FractionTray
            onClose={() => setIsFracOpen(false)}
            onPick={(f) => onPickFraction(f)}
          />
        )}

        <CalcKeypad onKeyPress={onKeyPress} />
      </View>

      <HistoryDrawer
        visible={isHistoryOpen}
        items={historyItems}
        onClose={() => setIsHistoryOpen(false)}
        onClear={onClearHistory}
        onDeleteItem={onDeleteHistoryItem}
      />
    </SafeAreaView>
  );
}
