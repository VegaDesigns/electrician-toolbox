import { useMeasurementI18n } from "./measurementI18n";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { defineStyles, FontSize, Layout, Radius, Space } from "../../theme";
import { COMMON_FRACTIONS } from "../../utils/calc/fractions";
import { enterMeasurementKey, measurementEntry, measurementText, pickMeasurementFraction, removeMeasurementFraction } from "../../utils/bending/measurementEntry";

export function MeasurementKeypad({ initialValue, error, onChange, onSubmit }: {
  initialValue: string; error: string; onChange: () => void; onSubmit: (value: string) => void;
}) {
  const { t } = useMeasurementI18n();
  const s = useStyles();
  const [entry, setEntry] = useState(() => measurementEntry(initialValue));
  const [mode, setMode] = useState<"number" | "fractions" | "custom">("number");
  const [custom, setCustom] = useState({ top: "", bottom: "", active: "top" as "top" | "bottom", replace: true });
  const [localError, setLocalError] = useState("");
  function clearError() { setLocalError(""); onChange(); }
  function key(value: string) {
    clearError();
    if (mode !== "custom") { setEntry(current => enterMeasurementKey(current, value)); return; }
    setCustom(current => {
      if (value === "backspace") return { ...current, [current.active]: current[current.active].slice(0, -1), replace: false };
      if (!/^\d$/.test(value)) return current;
      const previous = current.replace ? "" : current[current.active];
      return { ...current, [current.active]: (previous + value).slice(0, 3), replace: false };
    });
  }
  function pick(label: string) {
    const next = pickMeasurementFraction(entry, label);
    if (!next) { setLocalError("Use a fraction greater than 0 and less than 1."); return; }
    setEntry(next); setMode("number"); clearError();
  }
  function openCustom() {
    const fraction = entry.text.match(/(\d+)\/(\d+)$/);
    setCustom({ top: fraction?.[1] ?? "", bottom: fraction?.[2] ?? "", active: "top", replace: true });
    setMode("custom"); clearError();
  }
  const fractionLabel = entry.text.match(/\d+\/\d+$/)?.[0];
  return <View style={s.body}>
    <View style={s.display}>
      <Text style={s.label}>{t("Inches")}</Text>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={t(`Measurement: ${entry.text || "empty"} inches`)}
        numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={s.value}>
        {entry.text || "0"}″
      </Text>
    </View>
    <View style={s.tools}>
      {mode === "number" ? <>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Clear measurement")} style={s.quiet} onPress={() => key("clear")}>
          <Text style={s.text}>{t("Clear")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Choose fraction")} style={[s.quiet, s.soft]}
          onPress={() => { setMode("fractions"); clearError(); }}>
          <Text style={s.accent}>{t("frac")}</Text>
        </Pressable>
      </> : <>
        <Pressable accessibilityRole="button" accessibilityLabel={t(mode === "custom" ? "Back to common fractions" : "Return to number keypad")}
          style={[s.quiet, s.soft]} onPress={() => { setMode(mode === "custom" ? "fractions" : "number"); clearError(); }}>
          <Text style={s.accent}>{t("← Back")}</Text>
        </Pressable>
        {mode === "custom" ? <Pressable accessibilityRole="button" accessibilityLabel={t("Clear custom fraction")} style={s.quiet}
          onPress={() => { setCustom({ top: "", bottom: "", active: "top", replace: true }); clearError(); }}>
          <Text style={s.text}>{t("Clear")}</Text>
        </Pressable> : fractionLabel ? <Pressable accessibilityRole="button" style={s.quiet}
          onPress={() => { setEntry(removeMeasurementFraction(entry)); setMode("number"); clearError(); }}>
          <Text style={s.text}>{t("Remove fraction")}</Text>
        </Pressable> : null}
      </>}
    </View>
    {mode === "fractions" ? <View style={s.picker}>
      <Text style={s.label}>{t("COMMON FRACTIONS")}</Text>
      {[COMMON_FRACTIONS.slice(0, 4), COMMON_FRACTIONS.slice(4)].map((row, i) => <View key={i} style={s.row}>
        {row.map(fraction => <Pressable key={fraction.label} accessibilityRole="button" accessibilityLabel={t(`${fraction.label} inch`)}
          accessibilityState={{ selected: fractionLabel === fraction.label }}
          onPress={() => pick(fraction.label)} style={[s.key, fractionLabel === fraction.label && s.selected]}>
          <Text style={s.fractionText}>{fraction.label}</Text>
        </Pressable>)}
      </View>)}
      <Pressable accessibilityRole="button" style={[s.quiet, s.customButton]} onPress={openCustom}>
        <Text style={s.accent}>{t("Custom fraction")}</Text>
        <Text style={s.text}>›</Text>
      </Pressable>
    </View> : <>
      {mode === "custom" ? <View style={s.customFields}>
        {(["top", "bottom"] as const).map((field, i) => <React.Fragment key={field}>
          {i === 1 && <Text style={s.slash}>/</Text>}
          <Pressable accessibilityRole="button" accessibilityLabel={t(field === "top" ? "Custom fraction numerator" : "Custom fraction denominator")}
            accessibilityState={{ selected: custom.active === field }}
            style={[s.customField, custom.active === field && s.selected]}
            onPress={() => setCustom(current => ({ ...current, active: field, replace: true }))}>
            <Text style={s.label}>{t(field === "top" ? "Top" : "Bottom")}</Text>
            <Text style={s.customValue}>{custom[field] || "—"}</Text>
          </Pressable>
        </React.Fragment>)}
      </View> : null}
      <View style={s.keys}>
        {[["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"], [".", "0", "backspace"]].map((row, i) => <View key={i} style={s.row}>
          {row.map(value => {
            const disabled = mode === "custom" && value === ".";
            return <Pressable key={value} accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled }}
              accessibilityLabel={t(value === "." ? "Decimal point" : value === "backspace" ? "Backspace" : value)}
              onPress={() => key(value)} style={[s.key, disabled && s.disabled]}>
              <Text style={s.digit}>{t(value === "backspace" ? "⌫" : value)}</Text>
            </Pressable>;
          })}
        </View>)}
      </View>
    </>}
    {error || localError ? <Text accessibilityRole="alert" style={s.error}>{t(localError || error)}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={t(mode === "custom" ? "Use custom fraction" : "Done, use measurement")}
      onPress={() => mode === "custom" ? pick(`${custom.top}/${custom.bottom}`) : onSubmit(measurementText(entry))} style={s.done}>
      <Text style={s.doneText}>{t(mode === "custom" ? "Use fraction" : "Done ✓")}</Text>
    </Pressable>
  </View>;
}

const useStyles = defineStyles(({ colors: C }) => ({
  body: { gap: Space.xs },
  display: { minHeight: 80, padding: Space.sm, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.borderStrong, borderRadius: Radius.control },
  label: { color: C.textMuted, fontSize: FontSize.caption, lineHeight: 18 },
  value: { color: C.text, fontSize: FontSize.screen, lineHeight: 40, fontVariant: ["tabular-nums"], textAlign: "right" },
  tools: { flexDirection: "row", justifyContent: "space-between" },
  quiet: { minHeight: Layout.touchTarget, minWidth: 64, paddingHorizontal: Space.sm, justifyContent: "center", borderRadius: Radius.control },
  soft: { backgroundColor: C.primarySoft },
  accent: { color: C.primary, fontSize: FontSize.label, fontWeight: "500" },
  text: { color: C.textMuted, fontSize: FontSize.label },
  keys: { gap: Space.xs, minHeight: 248 },
  row: { flexDirection: "row", gap: Space.xs },
  key: { flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: Radius.control },
  digit: { color: C.text, fontSize: FontSize.title, fontWeight: "500" },
  fractionText: { color: C.text, fontSize: FontSize.body, fontWeight: "500" },
  disabled: { opacity: 0.35 },
  picker: { minHeight: 248, gap: Space.xs },
  selected: { backgroundColor: C.primarySoft, borderColor: C.primary },
  customButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: C.border },
  customFields: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  customField: { flex: 1, padding: Space.xs, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: Radius.control },
  customValue: { color: C.text, fontSize: FontSize.title, lineHeight: 32, textAlign: "center", fontVariant: ["tabular-nums"] },
  slash: { color: C.textMuted, fontSize: FontSize.title },
  done: { minHeight: Layout.touchTarget, alignItems: "center", justifyContent: "center", backgroundColor: C.action, borderRadius: Radius.control },
  doneText: { color: C.inverseText, fontSize: FontSize.body, fontWeight: "600" },
  error: { color: C.error, fontSize: FontSize.label, lineHeight: 20 },
}));
