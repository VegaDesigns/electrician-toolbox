import { FeedbackPressable as Pressable } from "../FeedbackPressable";
import { Space , Radius, FontSize } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

type FillMode = "box" | "conduit";

export function FillModeSwitch({ mode }: { mode: FillMode }) {
  const styles = useStyles();

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

const useStyles = defineStyles(({ colors: Colors }) => ({
  track: {
    alignSelf: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: Space.xxs,
    maxWidth: 528,
    padding: Space.xxs,
    width: "100%",

  },
  option: {
    alignItems: "center",
    borderRadius: Radius.control,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: Colors.primary,

  },
  optionText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  optionTextSelected: { color: Colors.inverseText },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
}));
