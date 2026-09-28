import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, Platform, Text, View } from "react-native";
import { defineStyles, FontSize, Space, useAppTheme } from "../theme";
import { createCountdown } from "../utils/countdown";
import { FeedbackPressable } from "./FeedbackPressable";

export const UNDO_DURATION_MS = 5000;

/** Mount with a new key after each removal/undo to give the next action a full window. */
export function TimedUndoBar({ message, paused, onUndo, onExpire }: {
  message: string; paused: boolean; onUndo: () => void; onExpire: () => void;
}) {
  const styles = useStyles();
  const { reduceMotion } = useAppTheme();
  const [foreground, setForeground] = useState(AppState.currentState !== "background" && AppState.currentState !== "inactive");
  const [duration, setDuration] = useState<number | null>(null);
  const [progress] = useState(() => new Animated.Value(1));
  const expireRef = useRef(onExpire);
  useEffect(() => { expireRef.current = onExpire; }, [onExpire]);
  const timer = useRef<ReturnType<typeof createCountdown> | null>(null);

  useEffect(() => {
    let active = true;
    // Honor Android's user-selected accessibility timeout. Allow extra time with
    // a screen reader on both platforms, without keeping the bar indefinitely.
    void AccessibilityInfo.isScreenReaderEnabled().then(async enabled => {
      const minimum = enabled ? 15000 : UNDO_DURATION_MS;
      return Platform.OS === "android" ? AccessibilityInfo.getRecommendedTimeoutMillis(minimum) : minimum;
    }).then(ms => { if (active) setDuration(ms); }).catch(() => { if (active) setDuration(UNDO_DURATION_MS); });
    const subscription = AppState.addEventListener("change", state => setForeground(state === "active"));
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (duration === null) return;
    const countdown = createCountdown(duration, () => expireRef.current());
    timer.current = countdown;
    return () => { countdown.dispose(); timer.current = null; };
  }, [duration]);

  useEffect(() => {
    const countdown = timer.current;
    if (!countdown || duration === null) return;
    progress.stopAnimation();
    const remaining = countdown.pause();
    progress.setValue(remaining / duration);
    if (!paused && foreground) {
      countdown.resume();
      // Reduce Motion still gets a static time indicator and the same expiry.
      if (!reduceMotion) Animated.timing(progress, {
        toValue: 0, duration: remaining, easing: Easing.linear, useNativeDriver: false,
      }).start();
    }
    return () => { countdown.pause(); progress.stopAnimation(); };
  }, [duration, foreground, paused, progress, reduceMotion]);

  return <View style={styles.bar}>
    <View style={styles.row}>
      <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
      <FeedbackPressable accessibilityRole="button" accessibilityLabel="Undo removal" disabled={paused}
        onPress={onUndo} style={styles.button}><Text style={[styles.action, paused && styles.disabled]}>Undo</Text></FeedbackPressable>
    </View>
    <View style={styles.track} aria-hidden>
      <Animated.View testID="undo-countdown" style={[styles.progress, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
    </View>
  </View>;
}

const useStyles = defineStyles(({ colors }) => ({
  bar: { backgroundColor: colors.surface2, borderTopWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Space.md },
  message: { color: colors.textMuted, fontSize: FontSize.label, flex: 1 },
  button: { minHeight: 48, minWidth: 64, justifyContent: "center", alignItems: "center" },
  action: { color: colors.primary, fontSize: FontSize.label, fontWeight: "500" },
  disabled: { opacity: 0.45 },
  track: { height: 3, backgroundColor: colors.border },
  progress: { height: 3, backgroundColor: colors.primary },
}));
