import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { defineStyles, Layout, Space } from "../theme";

/** Shared header spacing; tools supply their title and relevant actions. */
export function ScreenHeader({ children }: PropsWithChildren) {
  const styles = useStyles();
  return <View style={styles.header}>{children}</View>;
}
const useStyles = defineStyles(() => ({
  header: { alignItems: "center", alignSelf: "center", flexDirection: "row", gap: Space.sm, maxWidth: Layout.contentWidth, paddingHorizontal: Space.md, paddingVertical: Space.sm, width: "100%" },
}));
