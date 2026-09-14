import { forwardRef } from "react";
import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native";
import { Radius, useAppTheme } from "../theme";

type Props = PressableProps & { feedback?: "standard" | "none" };

/** One press treatment for controls; keeps native press/cancel, refs and handlers intact. */
export const FeedbackPressable = forwardRef<View, Props>(function FeedbackPressable(
  { style, feedback = "standard", disabled, ...props }, ref,
) {
  const { theme: { colors }, reduceMotion } = useAppTheme();
  return <Pressable {...props} ref={ref} disabled={disabled} style={state => {
    const current = typeof style === "function" ? style(state) : style;
    if (!state.pressed || disabled || feedback === "none") return current;
    const resting = StyleSheet.flatten(typeof style === "function" ? style({ ...state, pressed: false }) : style) ?? {};
    const neutral = resting.backgroundColor == null || [colors.transparent, colors.bg, colors.surface, colors.surface2, colors.surface3].includes(String(resting.backgroundColor));
    const ring = resting.backgroundColor === colors.primary ? colors.inverseText
      : resting.backgroundColor === colors.errorSoft ? colors.error : colors.primary;
    const indicator: ViewStyle = {
      // Keep primary, destructive, and physical reference fills intact.
      backgroundColor: neutral ? colors.primarySoft : resting.backgroundColor,
      borderColor: resting.borderColor,
      // An inset ring does not resize content or make labels wrap during a press.
      boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: 2, color: ring, inset: true }],
      borderRadius: resting.borderRadius ?? Radius.small,
      opacity: resting.opacity ?? 1,
      transform: reduceMotion ? (resting.transform ?? []) : typeof resting.transform === "string"
        ? `${resting.transform} scale(0.98)` : [...(Array.isArray(resting.transform) ? resting.transform : []), { scale: 0.98 }],
    };
    return [current, indicator];
  }} />;
});
