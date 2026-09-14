import { Text, View } from "react-native";
import { IconButton } from "./IconButton";
import { defineStyles, Fonts, FontSize, Space } from "../theme";

export function SheetHeader({ title, eyebrow, onClose, closeLabel = "Close" }: { title: string; eyebrow: string; onClose: () => void; closeLabel?: string }) {
  const styles = useStyles();
  return <View style={styles.header}><View style={styles.copy}>
    <Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text>
  </View><IconButton icon="close" label={closeLabel} onPress={onClose} /></View>;
}
const useStyles = defineStyles(({ colors }) => ({
  header: { flexDirection: "row", alignItems: "center", gap: Space.sm, paddingVertical: Space.md },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primary, fontSize: FontSize.caption, fontWeight: "500", letterSpacing: 1 },
  title: { color: colors.text, fontFamily: Fonts.heading, fontSize: FontSize.title, fontWeight: "500" },
}));
