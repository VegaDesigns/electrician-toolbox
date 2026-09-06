import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Effects } from "../../theme";

type FillMode = "box" | "conduit";

export function FillModeSwitch({ mode }: { mode: FillMode }) {
  function choose(nextMode: FillMode) {
    if (nextMode === mode) return;
    Haptics.selectionAsync().catch(() => {});
    router.replace(nextMode === "conduit" ? "/conduit-fill" : "/box-fill");
  }

  return (
    <View accessibilityLabel="Fill guide type" style={styles.track}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === "conduit" }}
        onPress={() => choose("conduit")}
        style={({ pressed }) => [
          styles.option,
          mode === "conduit" && styles.optionSelected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.optionText, mode === "conduit" && styles.optionTextSelected]}>
          Conduit
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === "box" }}
        onPress={() => choose("box")}
        style={({ pressed }) => [
          styles.option,
          mode === "box" && styles.optionSelected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.optionText, mode === "box" && styles.optionTextSelected]}>
          Box
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    maxWidth: 528,
    padding: 4,
    width: "100%",
    ...Effects.recessed,
  },
  option: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: Colors.primary,
    ...Effects.primaryRaised,
  },
  optionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  optionTextSelected: { color: Colors.inverseText },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
