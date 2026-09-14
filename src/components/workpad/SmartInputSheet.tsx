import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , FontSize, Radius, Fonts } from "../../theme/tokens";
import { useAppTheme, defineStyles } from "../../theme";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  initialValue: string;
  onClose: () => void;
  onSubmit: (value: string) => string | null;
};

const EXAMPLES = [`1' 6" + 5 1/2"`, "1.5ft", "5 and 4/8th"];

export default function SmartInputSheet({
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  const styles = useStyles();
  const { theme: { colors: Colors } } = useAppTheme();

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  function submit() {
    const nextError = onSubmit(value);
    setError(nextError);
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel smart entry"
              hitSlop={8}
              onPress={onClose}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Smart Entry</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Calculate smart entry"
              hitSlop={8}
              onPress={submit}
              style={[styles.headerButton, styles.doneButton]}
            >
              <Text style={styles.doneText}>Calculate</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Type it the way you would say it</Text>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Measurement or calculation"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
              multiline
              onChangeText={(text) => {
                setValue(text);
                setError(null);
              }}
              onSubmitEditing={submit}
              placeholder={`Example: 1' 6" + 5 1/2"`}
              placeholderTextColor={Colors.textSubtle}
              returnKeyType="done"
              selectionColor={Colors.primary}
              style={styles.input}
              value={value}
            />

            {!!error && (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.examplesTitle}>Try an example</Text>
            <View style={styles.examples}>
              {EXAMPLES.map((example) => (
                <Pressable
                  accessibilityRole="button"
                  key={example}
                  onPress={() => {
                    setValue(example);
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  style={({ pressed }) => [
                    styles.example,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.help}>
              Supports feet, inches, decimals, fractions, mixed fractions, and
              +, -, ×, or ÷ calculations.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = defineStyles(({ colors: Colors }) => ({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    minWidth: 76,
    minHeight: 44,
    justifyContent: "center",
  },
  headerButtonText: { color: Colors.textMuted, fontSize: FontSize.label, fontWeight: "500" },
  doneButton: { alignItems: "flex-end" },
  doneText: { color: Colors.primary, fontSize: FontSize.label, fontWeight: "500" },
  title: { fontFamily: Fonts.heading, color: Colors.text, fontSize: FontSize.body, fontWeight: "500" },
  content: { padding: 20, gap: 14 },
  label: { color: Colors.text, fontSize: FontSize.subtitle, fontWeight: "500" },
  input: {
    minHeight: 112,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: FontSize.title,
    fontWeight: "500",
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    textAlignVertical: "top",
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,

  },
  errorBox: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorSoft,
    padding: Space.sm,
  },
  errorText: { color: Colors.error, fontSize: FontSize.label, fontWeight: "500" },
  examplesTitle: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  examples: { gap: 10 },
  example: {
    minHeight: 48,
    justifyContent: "center",
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,

  },
  exampleText: { color: Colors.text, fontSize: FontSize.body, fontWeight: "500" },
  help: { color: Colors.textMuted, fontSize: FontSize.caption, lineHeight: 19 },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],

  },
}));
