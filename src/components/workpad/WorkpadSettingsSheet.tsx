import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , FontSize, Radius, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import React from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { formatFeetInches, type Precision } from "../../utils/calc/measure";
import type { ResultFormatKey, ResultOption } from "./CalcDisplay";

const PRECISION_OPTIONS: Precision[] = ["none", 32, 16, 8, 4, 2];

type Props = {
  onChangePrecision: (precision: Precision) => void;
  onClose: () => void;
  onSelectResultFormat: (key: ResultFormatKey) => void;
  precision: Precision;
  resultOptions: ResultOption[];
  selectedResultKey: ResultFormatKey;
  visible: boolean;
};

export default function WorkpadSettingsSheet({
  onChangePrecision,
  onClose,
  onSelectResultFormat,
  precision,
  resultOptions,
  selectedResultKey,
  visible,
}: Props) {
  const styles = useStyles();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
          <Pressable
            accessibilityLabel="Close Workpad settings"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.scrim} feedback="none"
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>WORKPAD</Text>
                <Text style={styles.title}>Settings</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.settingBlock}>
              <Text style={styles.settingTitle}>Measurement precision</Text>
              <Text style={styles.settingHint}>Round to the nearest fraction. None turns fractional rounding off.</Text>
              <View accessibilityRole="radiogroup" style={styles.segmented}>
                {PRECISION_OPTIONS.map((value) => {
                  const selected = precision === value;
                  return (
                    <Pressable
                      accessibilityLabel={getPrecisionAccessibilityLabel(value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={value}
                      onPress={() => onChangePrecision(value)}
                      style={({ pressed }) => [
                        styles.segment,
                        selected && styles.segmentSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                        {value === "none" ? "None" : `1/${value}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.exampleLabel}>EXAMPLE</Text>
              <Text style={styles.exampleValue}>4.3″  →  {formatFeetInches(4.3, precision)}</Text>
            </View>

            {resultOptions.length > 1 ? (
              <View style={styles.settingBlock}>
                <Text style={styles.settingTitle}>Current answer format</Text>
                <Text style={styles.settingHint}>
                  Choose a detailed format for this answer only.
                </Text>
                <View accessibilityRole="radiogroup" style={styles.formatGrid}>
                  {resultOptions.map((option) => {
                    const selected = option.key === selectedResultKey;

                    return (
                      <Pressable
                        accessibilityLabel={`${option.label}: ${option.value}`}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        key={option.key}
                        onPress={() => onSelectResultFormat(option.key)}
                        style={({ pressed }) => [
                          styles.formatOption,
                          selected && styles.formatOptionSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.formatLabel,
                            selected && styles.formatLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          adjustsFontSizeToFit
                          minimumFontScale={0.7}
                          numberOfLines={1}
                          style={styles.formatValue}
                        >
                          {option.value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.formatNote}>
                  The next calculation returns to automatic units.
                </Text>
              </View>
            ) : null}

            <View style={styles.savedNote}>
              <View style={styles.savedDot} />
              <Text style={styles.savedText}>
                Measurement precision is saved automatically
              </Text>
            </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function getPrecisionAccessibilityLabel(value: Precision): string {
  if (value === "none") return "Do not round measurements";
  if (value === 2) return "Round to one half inch";
  if (value === 4) return "Round to one fourth inch";
  if (value === 8) return "Round to one eighth inch";
  if (value === 16) return "Round to one sixteenth inch";
  return "Round to one thirty-second inch";
}

const useStyles = defineStyles(({ colors: Colors }) => ({
  exampleLabel: { color: Colors.textMuted, fontSize: FontSize.caption, letterSpacing: 1, marginTop: 14 },
  exampleValue: { color: Colors.text, fontSize: FontSize.subtitle, fontWeight: "600", marginTop: 5, fontVariant: ["tabular-nums"] },
  safe: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    backgroundColor: Colors.overlay,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: 1,
    paddingBottom: 18,
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: Space.md,
    paddingTop: 11,
  },
  eyebrow: { color: Colors.primary, fontSize: FontSize.caption, fontWeight: "500", letterSpacing: 1 },
  title: { fontFamily: Fonts.heading, color: Colors.text, fontSize: FontSize.title, fontWeight: "500", marginTop: 2 },
  doneButton: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.control,
    paddingHorizontal: 15,
    paddingVertical: 10,

  },
  doneButtonText: { color: Colors.inverseText, fontSize: FontSize.caption, fontWeight: "500" },
  settingBlock: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    marginBottom: 10,
    padding: 13,

  },
  settingTitle: { color: Colors.text, fontSize: FontSize.label, fontWeight: "500" },
  settingHint: { color: Colors.textMuted, fontSize: FontSize.caption, lineHeight: 18, marginTop: 3 },
  segmented: {
    backgroundColor: Colors.bg,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 11,
    padding: 3,
  },
  segment: {
    alignItems: "center",
    borderRadius: Radius.small,
    flexBasis: "30%",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 5,
  },
  segmentSelected: { backgroundColor: Colors.primary,  },
  segmentText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500" },
  segmentTextSelected: { color: Colors.inverseText, fontWeight: "500" },
  formatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 11,
  },
  formatOption: {
    backgroundColor: Colors.bg,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: Space.xs,
  },
  formatOptionSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,

  },
  formatLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.45,
    textTransform: "none",
  },
  formatLabelSelected: { color: Colors.primary },
  formatValue: {
    color: Colors.text,
    fontSize: FontSize.label,
    fontWeight: "500",
    marginTop: 3,
  },
  formatNote: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    marginTop: Space.xs,
    textAlign: "center",
  },
  savedNote: { alignItems: "center", flexDirection: "row", gap: 7, paddingHorizontal: 3, paddingTop: 2 },
  savedDot: { backgroundColor: Colors.primary, borderRadius: 4, height: 6, width: 6 },
  savedText: { color: Colors.textSubtle, fontSize: FontSize.caption, fontWeight: "500" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }],  },
}));
