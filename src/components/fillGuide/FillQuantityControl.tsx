import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { Colors, Effects } from "../../theme";

type Props = {
  accessibilityLabel: string;
  onChange: (value: number) => void;
  value: number;
};

function clampQuantity(value: number) {
  return Math.max(1, Math.min(999, Math.floor(value)));
}

export function FillQuantityControl({
  accessibilityLabel,
  onChange,
  value,
}: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [replaceOnNextDigit, setReplaceOnNextDigit] = useState(true);

  function pulse() {
    Haptics.selectionAsync().catch(() => {});
  }

  function step(change: number) {
    pulse();
    onChange(clampQuantity(value + change));
  }

  function openEditor() {
    pulse();
    setDraft(String(value));
    setReplaceOnNextDigit(true);
    setEditorOpen(true);
  }

  function saveEditor() {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    onChange(clampQuantity(parsed));
    setEditorOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  function enterDigit(digit: string) {
    pulse();
    setDraft((current) => {
      if (replaceOnNextDigit || current === "0") return digit;
      return current.length >= 3 ? current : `${current}${digit}`;
    });
    setReplaceOnNextDigit(false);
  }

  function clearDraft() {
    pulse();
    setDraft("");
    setReplaceOnNextDigit(false);
  }

  function backspace() {
    pulse();
    setDraft((current) => current.slice(0, -1));
    setReplaceOnNextDigit(false);
  }

  const canSave = Number(draft) >= 1;

  return (
    <>
      <View style={styles.control}>
        <Pressable
          accessibilityLabel={`Decrease ${accessibilityLabel}`}
          accessibilityRole="button"
          disabled={value <= 1}
          onPress={() => step(-1)}
          style={({ pressed }) => [
            styles.stepButton,
            value <= 1 && styles.stepButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>

        <Pressable
          accessibilityHint="Opens a number pad for direct entry"
          accessibilityLabel={`Edit ${accessibilityLabel}, current value ${value}`}
          accessibilityRole="button"
          onPress={openEditor}
          style={({ pressed }) => [styles.valueButton, pressed && styles.pressed]}
        >
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.valueLabel}>QTY</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={`Increase ${accessibilityLabel}`}
          accessibilityRole="button"
          disabled={value >= 999}
          onPress={() => step(1)}
          style={({ pressed }) => [
            styles.stepButton,
            value >= 999 && styles.stepButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepText}>＋</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setEditorOpen(false)}
        transparent
        visible={editorOpen}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
            <Pressable
              accessibilityLabel="Cancel quantity entry"
              accessibilityRole="button"
              onPress={() => setEditorOpen(false)}
              style={styles.scrim}
            />
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.eyebrow}>WIRE QUANTITY</Text>
                  <Text style={styles.title}>How many?</Text>
                </View>
                <Pressable
                  accessibilityLabel="Cancel quantity entry"
                  accessibilityRole="button"
                  onPress={() => setEditorOpen(false)}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
              <View accessibilityLabel={`${accessibilityLabel}, ${draft || "empty"}`} style={styles.display}>
                <Text style={[styles.displayValue, !draft && styles.displayEmpty]}>{draft || "—"}</Text>
              </View>
              <View style={styles.keypad}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <Pressable
                    accessibilityLabel={digit}
                    accessibilityRole="button"
                    key={digit}
                    onPress={() => enterDigit(digit)}
                    style={({ pressed }) => [styles.numberKey, pressed && styles.pressed]}
                  >
                    <Text style={styles.numberKeyText}>{digit}</Text>
                  </Pressable>
                ))}
                <Pressable
                  accessibilityLabel="Clear quantity"
                  accessibilityRole="button"
                  onPress={clearDraft}
                  style={({ pressed }) => [styles.actionKey, pressed && styles.pressed]}
                >
                  <Text style={styles.clearKeyText}>Clear</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="0"
                  accessibilityRole="button"
                  onPress={() => enterDigit("0")}
                  style={({ pressed }) => [styles.numberKey, pressed && styles.pressed]}
                >
                  <Text style={styles.numberKeyText}>0</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Backspace"
                  accessibilityRole="button"
                  onPress={backspace}
                  style={({ pressed }) => [styles.actionKey, pressed && styles.pressed]}
                >
                  <Text style={styles.backspaceKeyText}>⌫</Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={!canSave}
                onPress={saveEditor}
                style={({ pressed }) => [
                  styles.doneButton,
                  !canSave && styles.doneButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
              <Text style={styles.hint}>Enter a number from 1 to 999.</Text>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  control: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  stepButton: { alignItems: "center", height: 48, justifyContent: "center", width: 37 },
  stepButtonDisabled: { opacity: 0.35 },
  stepText: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  valueButton: { alignItems: "center", justifyContent: "center", minWidth: 42 },
  valueText: { color: Colors.text, fontSize: 18, fontWeight: "900", lineHeight: 20 },
  valueLabel: { color: Colors.textSubtle, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  modalSafe: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    backgroundColor: "rgba(0,0,0,0.70)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: 22,
    paddingHorizontal: 16,
    ...Effects.surfaceRaised,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: Colors.borderStrong,
    borderRadius: 3,
    height: 4,
    marginTop: 9,
    width: 42,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingTop: 12,
  },
  eyebrow: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 2 },
  closeButton: { alignItems: "center", backgroundColor: Colors.surface2, borderRadius: 11, height: 40, justifyContent: "center", width: 40 },
  closeText: { color: Colors.textMuted, fontSize: 25, fontWeight: "700", lineHeight: 26 },
  display: {
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderColor: Colors.primaryMuted,
    borderRadius: 15,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
  },
  displayValue: { color: Colors.text, fontSize: 34, fontWeight: "900" },
  displayEmpty: { color: Colors.textSubtle },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  numberKey: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 11,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: "31.8%",
    ...Effects.controlRaised,
  },
  actionKey: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: 11,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: "31.8%",
    ...Effects.controlRaised,
  },
  numberKeyText: { color: Colors.text, fontSize: 20, fontWeight: "900" },
  clearKeyText: { color: Colors.error, fontSize: 12, fontWeight: "900" },
  backspaceKeyText: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  doneButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 11,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
    ...Effects.primaryRaised,
  },
  doneButtonDisabled: { opacity: 0.35 },
  doneText: { color: Colors.inverseText, fontSize: 12, fontWeight: "900" },
  hint: { color: Colors.textMuted, fontSize: 10, marginTop: 8, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }], ...Effects.pressed },
});
