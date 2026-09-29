import { useI18n } from "../i18n";
import { Fragment, useEffect, useSyncExternalStore, type PropsWithChildren } from "react";
// Recovery must work before ThemeProvider can safely read saved appearance.
// eslint-disable-next-line no-restricted-imports
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from "react-native";
import { themeCatalog } from "../theme/color";
import { Fonts, FontSize, Layout, Radius, Space } from "../theme/tokens";
import { getBackupState, initializeBackupRecovery, subscribeBackup } from "../utils/backup/service";

/** Must wrap ThemeProvider and navigation: restore clears every cached screen and appearance value. */
export function BackupBoundary({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const state = useSyncExternalStore(subscribeBackup, getBackupState, getBackupState);
  const system = useColorScheme();
  const colors = themeCatalog.forest[system === "dark" ? "dark" : "light"];
  useEffect(() => { void initializeBackupRecovery(); }, []);
  if (state.status === "ready") return <Fragment key={state.epoch}>{children}</Fragment>;
  // This recovery view is deliberately independent of saved appearance or any tool's storage.
  return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: Space.lg }}>
    <View style={{ maxWidth: Layout.contentWidth, width: "100%", gap: Space.md }}>
      <Text accessibilityRole="header" style={{ color: colors.text, fontFamily: Fonts.heading, fontSize: FontSize.title }}>{t(state.status === "blocked" ? "Protecting your saved work" : "Checking saved work")}</Text>
      {state.status === "blocked" ? <>
        <Text accessibilityRole="alert" style={{ color: colors.textMuted, fontSize: FontSize.body, lineHeight: 24 }}>{t(state.error)}</Text>
        <Pressable accessibilityRole="button" onPress={() => { void initializeBackupRecovery(); }} style={({ pressed }) => ({ minHeight: Layout.touchTarget, justifyContent: "center", alignItems: "center", borderRadius: Radius.control, padding: Space.md, backgroundColor: pressed ? colors.primarySoft : colors.surface2, borderWidth: 1, borderColor: colors.primary })}>
          <Text style={{ color: colors.primary, fontSize: FontSize.body, fontWeight: "600" }}>{t("Retry recovery")}</Text>
        </Pressable>
      </> : <ActivityIndicator accessibilityLabel={t("Checking saved work")} color={colors.primary} />}
    </View>
  </View>;
}
