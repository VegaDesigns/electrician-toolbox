import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , Radius, FontSize, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Modal, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const styles = useStyles();

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
              style={styles.scrim} feedback="none"
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

const useStyles = defineStyles(({ colors: Colors }) => ({
  control: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  stepButton: { alignItems: "center", height: 48, justifyContent: "center", width: 37 },
  stepButtonDisabled: { opacity: 0.35 },
  stepText: { color: Colors.primary, fontSize: FontSize.section, fontWeight: "500" },
  valueButton: { alignItems: "center", justifyContent: "center", minWidth: 42 },
  valueText: { color: Colors.text, fontSize: FontSize.subtitle, fontWeight: "500", lineHeight: 20 },
  valueLabel: { color: Colors.textSubtle, fontSize: FontSize.caption, fontWeight: "500", letterSpacing: 0.7 },
  modalSafe: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    backgroundColor: Colors.overlay,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: 1,
    paddingBottom: 22,
    paddingHorizontal: Space.md,

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
    paddingTop: Space.sm,
  },
  eyebrow: { color: Colors.primary, fontSize: FontSize.caption, fontWeight: "500", letterSpacing: 1 },
  title: { fontFamily: Fonts.heading, color: Colors.text, fontSize: FontSize.section, fontWeight: "500", marginTop: 2 },
  closeButton: { alignItems: "center", backgroundColor: Colors.surface2, borderRadius: Radius.control, height: 40, justifyContent: "center", width: 40 },
  closeText: { color: Colors.textMuted, fontSize: FontSize.title, fontWeight: "500", lineHeight: 26 },
  display: {
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderColor: Colors.primaryMuted,
    borderRadius: Radius.card,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
  },
  displayValue: { color: Colors.text, fontSize: FontSize.screen, fontWeight: "500" },
  displayEmpty: { color: Colors.textSubtle },
  keypad: { flexDirection: "row", flexWrap: "wrap", gap: Space.xs, marginTop: 10 },
  numberKey: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: "31.8%",

  },
  actionKey: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: "31.8%",

  },
  numberKeyText: { color: Colors.text, fontSize: FontSize.section, fontWeight: "500" },
  clearKeyText: { color: Colors.error, fontSize: FontSize.caption, fontWeight: "500" },
  backspaceKeyText: { color: Colors.primary, fontSize: FontSize.section, fontWeight: "500" },
  doneButton: {
    alignItems: "center",
    backgroundColor: Colors.action,
    borderRadius: Radius.control,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,

  },
  doneButtonDisabled: { opacity: 0.35 },
  doneText: { color: Colors.inverseText, fontSize: FontSize.caption, fontWeight: "500" },
  hint: { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: Space.xs, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }],  },
}));
