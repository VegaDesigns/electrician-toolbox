import { Text } from "react-native";
import { FeedbackPressable } from "../FeedbackPressable";
import { defineStyles, Layout, Space, FontSize, Radius } from "../../theme";

export function ResetDraftButton({ onPress, label }: { onPress: () => void; label: string }) {
  const styles = useStyles();
  return <FeedbackPressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.button}>
    <Text style={styles.text}>Reset</Text>
  </FeedbackPressable>;
}
const useStyles = defineStyles(({ colors }) => ({
  button: { minHeight: Layout.touchTarget, minWidth: Layout.touchTarget, paddingHorizontal: Space.sm, borderRadius: Radius.control, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 },
  text: { color: colors.primary, fontSize: FontSize.label, fontWeight: "500" },
}));
