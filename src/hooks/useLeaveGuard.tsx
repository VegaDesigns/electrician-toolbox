import { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { defineStyles, FontSize, Layout, Radius, Space } from "../theme";

/** Native/system navigation and explicit local back actions share one decision. */
export function useLeaveGuard(hasUnsavedChanges: boolean) {
  const styles = useStyles();
  const navigation = useNavigation();
  const [pending, setPending] = useState<null | (() => void)>(null);
  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    setPending(() => () => navigation.dispatch(data.action));
  });
  useEffect(() => {
    if (Platform.OS !== "web" || !hasUnsavedChanges) return;
    const preventReload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventReload);
    return () => window.removeEventListener("beforeunload", preventReload);
  }, [hasUnsavedChanges]);
  function requestLeave(action: () => void) {
    if (hasUnsavedChanges) setPending(() => action);
    else action();
  }
  const dialog = <Modal transparent animationType="fade" visible={!!pending} onRequestClose={() => setPending(null)}>
    <SafeAreaView style={styles.overlay}>
      <View style={styles.sheet}><ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Leave with unsaved changes?</Text>
        <Text style={styles.body}>Keep editing to finish or retry saving. Leaving may discard unfinished entry text. Changes that could not be saved can be lost if you close the app.</Text>
        <FeedbackPressable accessibilityRole="button" onPress={() => setPending(null)} style={styles.primary}><Text style={styles.primaryText}>Keep editing</Text></FeedbackPressable>
        <FeedbackPressable accessibilityRole="button" onPress={() => { const action = pending; setPending(null); action?.(); }} style={styles.button}><Text style={styles.body}>Leave anyway</Text></FeedbackPressable>
      </ScrollView></View>
    </SafeAreaView>
  </Modal>;
  return { requestLeave, dialog };
}
const useStyles = defineStyles(({ colors }) => ({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", padding: Space.md },
  sheet: { alignSelf: "center", width: "100%", maxWidth: Layout.contentWidth, maxHeight: "90%", borderRadius: Radius.sheet, backgroundColor: colors.surface },
  content: { padding: Space.lg, gap: Space.md },
  title: { color: colors.text, fontSize: FontSize.title, fontWeight: "500" },
  body: { color: colors.text, fontSize: FontSize.body },
  button: { minHeight: Layout.touchTarget, justifyContent: "center", alignItems: "center", borderRadius: Radius.control, backgroundColor: colors.surface2 },
  primary: { minHeight: Layout.touchTarget, justifyContent: "center", alignItems: "center", borderRadius: Radius.control, backgroundColor: colors.action },
  primaryText: { color: colors.inverseText, fontSize: FontSize.body, fontWeight: "500" },
}));
