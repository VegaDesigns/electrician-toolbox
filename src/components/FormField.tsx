import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { defineStyles, FontSize, Layout, Radius, Space, useAppTheme } from "../theme";

export const FormField = forwardRef<TextInput, TextInputProps>(function FormField({ style, placeholderTextColor, ...props }, ref) {
  const styles = useStyles();
  const { theme } = useAppTheme();
  return <TextInput ref={ref} placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted} {...props} style={[styles.input, style]} />;
});
const useStyles = defineStyles(({ colors }) => ({
  input: { minHeight: Layout.touchTarget, color: colors.text, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: Radius.control, fontSize: FontSize.body, padding: Space.sm },
}));
