import { FeedbackPressable } from "./FeedbackPressable";
import { AppIcon, type IconName } from "./AppIcon";
import { defineStyles, Layout, Radius } from "../theme";

export function IconButton({ icon, label, onPress, disabled = false }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  const styles = useStyles();
  return <FeedbackPressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{ disabled }} aria-disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
    <AppIcon name={icon} />
  </FeedbackPressable>;
}
const useStyles = defineStyles(({ colors }) => ({
  button: { width: Layout.touchTarget, height: Layout.touchTarget, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: Radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface3 },
  disabled: { opacity: 0.45 },
}));
