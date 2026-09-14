import { Pressable, Text } from "react-native";
import { defineStyles, FontSize, Layout, Radius } from "../theme";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Shared return control; callers retain their navigation and save guards. */
export function BackButton({ onPress, disabled = false, accessibilityLabel = "Return to toolbox home" }: Props) {
  const styles = useStyles();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    disabled={disabled} accessibilityState={{ disabled }} aria-disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
    <Text style={styles.arrow}>←</Text>
  </Pressable>;
}

const useStyles = defineStyles(({ colors }) => ({
  button: { width: Layout.touchTarget, height: Layout.touchTarget, alignItems: "center", justifyContent: "center", borderRadius: Radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface3 },
  arrow: { color: colors.text, fontSize: FontSize.section, fontWeight: "500" },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
}));
