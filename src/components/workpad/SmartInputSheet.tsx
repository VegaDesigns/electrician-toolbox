import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../../theme";

type Props = {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSubmit: (value: string) => string | null;
};

const EXAMPLES = [`1' 6" + 5 1/2"`, "1.5ft", "5 and 4/8th"];

export default function SmartInputSheet({
  visible,
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;

    setValue(initialValue);
    setError(null);
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [initialValue, visible]);

  function submit() {
    const nextError = onSubmit(value);
    setError(nextError);
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    minWidth: 76,
    minHeight: 44,
    justifyContent: "center",
  },
  headerButtonText: { color: Colors.textMuted, fontSize: 15, fontWeight: "700" },
  doneButton: { alignItems: "flex-end" },
  doneText: { color: Colors.primary, fontSize: 15, fontWeight: "900" },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900" },
  content: { padding: 20, gap: 14 },
  label: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  input: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlignVertical: "top",
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorSoft,
    padding: 12,
  },
  errorText: { color: "#FCA5A5", fontSize: 14, fontWeight: "800" },
  examplesTitle: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  examples: { gap: 10 },
  example: {
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  exampleText: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  help: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
