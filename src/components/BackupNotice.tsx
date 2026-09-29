import { useI18n } from "../i18n";
import { useState, useSyncExternalStore } from "react";
import { AccessibilityInfo, Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { defineStyles, Fonts, FontSize, Layout, Radius, Space, useAppTheme } from "../theme";
import { dismissBackupNotice, getBackupState, subscribeBackup } from "../utils/backup/service";
import { FeedbackPressable as Pressable } from "./FeedbackPressable";

/** Lives beside navigation so the restore acknowledgement survives any restored route. */
export function BackupNotice() {
  const { t } = useI18n();
  const state = useSyncExternalStore(subscribeBackup, getBackupState, getBackupState);
  const [lastNotice, setLastNotice] = useState({ title: state.noticeTitle, body: state.notice });
  if (state.notice && (state.notice !== lastNotice.body || state.noticeTitle !== lastNotice.title)) {
    setLastNotice({ title: state.noticeTitle, body: state.notice });
  }
  // Service acknowledgement clears immediately; keep its copy while the modal fades away.
  const notice = state.notice ? { title: state.noticeTitle, body: state.notice } : lastNotice;
  const { reduceMotion } = useAppTheme();
  const s = useStyles();
  return <Modal visible={state.status === "ready" && !!state.notice} transparent animationType={reduceMotion ? "none" : "fade"}
    onRequestClose={dismissBackupNotice}
    onShow={() => { AccessibilityInfo.announceForAccessibility(`${t(notice.title)}. ${t(notice.body)}`); }}>
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={s.overlay}>
      <View accessibilityViewIsModal style={s.card}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.eyebrow}>{t("YOUR SAVED WORK")}</Text>
          <Text accessibilityRole="header" style={s.title}>{t(notice.title)}</Text>
          <Text style={s.body}>{t(notice.body)}</Text>
          <Pressable accessibilityRole="button" onPress={dismissBackupNotice} style={s.continue}><Text style={s.continueText}>{t("Continue")}</Text></Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}
const useStyles = defineStyles(({ colors }) => ({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.overlay, padding: Space.lg },
  card: { width: "100%", maxWidth: Layout.contentWidth, maxHeight: "100%", borderRadius: Radius.large, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  content: { padding: Space.lg, gap: Space.md },
  eyebrow: { color: colors.primary, fontSize: FontSize.caption, fontWeight: "600", letterSpacing: 1 },
  title: { color: colors.text, fontFamily: Fonts.heading, fontSize: FontSize.heading },
  body: { color: colors.textMuted, fontSize: FontSize.body, lineHeight: 24 },
  continue: { minHeight: Layout.touchTarget, padding: Space.md, borderRadius: Radius.control, backgroundColor: colors.action, justifyContent: "center", alignItems: "center" },
  continueText: { color: colors.inverseText, fontSize: FontSize.body, fontWeight: "600" },
}));
