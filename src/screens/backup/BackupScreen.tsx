import { useI18n } from "../../i18n";
import { localizeBackupError } from "../../i18n/backupErrors";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/BackButton";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { ScreenHeader } from "../../components/ScreenHeader";
import { defineStyles, Fonts, FontSize, Layout, Radius, Space, useAppTheme } from "../../theme";
import { chooseBackupText, saveBackupFile } from "../../utils/backup/files";
import { backupSummary, parseBackup, type ToolboxBackup } from "../../utils/backup/schema";
import { captureUserBackup, replaceFromUserBackup } from "../../utils/backup/service";

export default function BackupScreen() {
  const { t, language, locale } = useI18n();
  const s = useStyles();
  const { theme: { colors } } = useAppTheme();
  const [candidate, setCandidate] = useState<ToolboxBackup | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const summary = useMemo(() => candidate ? backupSummary(candidate) : null, [candidate]);
  async function run(operation: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(""); setStatus("");
    try { await operation(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The backup operation could not finish. Try again."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  const exportBackup = () => run(async () => {
    const backup = await captureUserBackup(Constants.expoConfig?.version ?? "unknown");
    const filename = `electrician-toolbox-${backup.createdAt.replace(/[:.]/g, "-")}.json`;
    const destination = await saveBackupFile(JSON.stringify(backup), filename, language);
    setStatus(destination === "download" ? "Backup download started. Check your downloads to confirm the file was saved." : "Share sheet closed. Your backup is saved only if you chose Save to Files or another destination.");
  });
  const importBackup = () => run(async () => {
    const text = await chooseBackupText();
    if (text === null) { setStatus("No backup selected. Your saved work is unchanged."); return; }
    const parsed = parseBackup(text);
    setCandidate(parsed); setConfirmed(false);
  });
  const restore = () => run(async () => {
    if (!candidate || !confirmed) return;
    await replaceFromUserBackup(candidate);
    // The root boundary now remounts every screen and reloads saved data.
  });
  function closeReview() { setCandidate(null); setConfirmed(false); setError(""); setStatus("Restore canceled. Your saved work is unchanged."); }

  return <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
    <ScreenHeader>
      <BackButton disabled={busy} accessibilityLabel={candidate ? "Cancel backup review" : "Back to settings"} onPress={() => candidate ? closeReview() : router.canGoBack() ? router.back() : router.replace("/settings")} />
      <Text accessibilityRole="header" style={s.title}>{t(candidate ? "Review backup" : "Backup & restore")}</Text>
    </ScreenHeader>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.intro}>{t(candidate ? "Nothing changes until you confirm below." : "Your work stays on this device. Save a backup you can restore if you change phones or reinstall the app.")}</Text>
      {error ? <View style={s.errorBox}><Text accessibilityRole="alert" style={s.errorText}>{localizeBackupError(error, language)}</Text></View> : null}
      {status ? <View style={s.notice}><Text accessibilityLiveRegion="polite" style={s.body}>{t(status)}</Text></View> : null}
      {busy ? <View style={s.busy}><ActivityIndicator color={colors.primary} /><Text accessibilityLiveRegion="polite" style={s.body}>{t("Please wait…")}</Text></View> : null}
      {candidate && summary ? <>
        <View style={s.card}>
          <Text style={s.eyebrow}>{t("BACKUP CONTENTS")}</Text>
          <Text style={s.heading}>{new Date(candidate.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</Text>
          <Text style={s.muted}>{t("Created in app version")}{" "}{candidate.appVersion}</Text>
          <View style={s.rows}>
            {[["Jobsite lists", summary.lists], ["Materials and notes", summary.items], ["Custom panel presets", summary.panelPresets], ["Saved calculations", summary.calculations], ["Favorite dictionary terms", summary.favoriteTerms]].map(([label, count]) =>
              <View key={label} style={s.row}><Text style={s.rowLabel}>{t(String(label))}</Text><Text style={s.count}>{count}</Text></View>)}
          </View>
          <Text style={s.muted}>{t("Also restores Workpad preferences, bending setup and measurements, Wire Guide settings, dictionary recents, and appearance.")}</Text>
          {summary.includesLegacy ? <Text style={s.muted}>{t("Retained previous Job Board:")}{" "}{summary.legacyItems} {t("items. These stay in the previous board, separate from Jobsite Lists.")}</Text> : null}
        </View>
        <View style={s.warning}>
          <Text style={s.warningTitle}>{t("Replace, not merge")}</Text>
          <Text style={s.warningText}>{t("This replaces all saved work and settings on this device, including sections that are empty in the backup. Unfinished entry drafts and current unsaved calculations are cleared. Export your current work first if you want to keep it.")}</Text>
        </View>
        <Pressable accessibilityRole="checkbox" aria-checked={confirmed} accessibilityState={{ checked: confirmed, disabled: busy }} disabled={busy} onPress={() => setConfirmed(value => !value)} style={[s.confirm, confirmed && s.confirmSelected]}>
          <Text style={s.check}>{confirmed ? "✓" : "□"}</Text><Text style={s.rowLabel}>{t("I understand this replaces my current saved work and clears unfinished drafts.")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={busy || !confirmed} accessibilityState={{ disabled: busy || !confirmed }} onPress={restore} style={[s.destructive, (busy || !confirmed) && s.disabled]}><Text style={s.destructiveText}>{t("Restore and replace")}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={exportBackup} style={s.secondary}><Text style={s.secondaryText}>{t("Back up current work first")}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={closeReview} style={s.secondary}><Text style={s.secondaryText}>{t("Cancel restore")}</Text></Pressable>
      </> : <>
        <View style={s.card}>
          <Text style={s.heading}>{t("Keep a copy")}</Text>
          <Text style={s.body}>{t("Includes your lists, notes, custom panel setups, saved calculations, favorites, bending measurements, and tool settings.")}</Text>
          <Pressable accessibilityRole="button" disabled={busy} onPress={exportBackup} style={[s.primary, busy && s.disabled]}><Text style={s.primaryText}>{t("Export backup")}</Text></Pressable>
        </View>
        <View style={s.card}>
          <Text style={s.heading}>{t("Bring your work back")}</Text>
          <Text style={s.body}>{t("Choose a Toolbox backup file. Review its contents before replacing anything.")}</Text>
          <Pressable accessibilityRole="button" disabled={busy} onPress={importBackup} style={[s.secondary, busy && s.disabled]}><Text style={s.secondaryText}>{t("Choose backup file")}</Text></Pressable>
        </View>
        <View style={s.details}>
          <Text style={s.eyebrow}>{t("GOOD TO KNOW")}</Text>
          <Text style={s.muted}>{t("Backups are not automatic and do not sync between devices. Save the file somewhere outside this app, such as Files or a storage service you choose.")}</Text>
          <Text style={s.muted}>{t("The file is not encrypted. It can contain job names and notes, so only share it with people you trust.")}</Text>
          <Text style={s.muted}>{t("Unfinished entry drafts and unsaved calculations are not backed up. Retained previous Job Board data is included when present. Maximum file size: 5 MB.")}</Text>
        </View>
      </>}
    </ScrollView>
  </SafeAreaView>;
}
const useStyles = defineStyles(({ colors }) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { flex: 1, fontFamily: Fonts.heading, fontSize: FontSize.title, color: colors.text },
  content: { padding: Space.md, paddingBottom: Space.xl, gap: Space.md, width: "100%", maxWidth: Layout.contentWidth, alignSelf: "center" },
  intro: { fontSize: FontSize.body, lineHeight: 24, color: colors.textMuted },
  card: { padding: Space.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: Radius.card, gap: Space.md },
  heading: { fontFamily: Fonts.heading, fontSize: FontSize.title, color: colors.text },
  body: { color: colors.text, fontSize: FontSize.body, lineHeight: 24 },
  muted: { color: colors.textMuted, fontSize: FontSize.label, lineHeight: 21 },
  eyebrow: { color: colors.textMuted, fontSize: FontSize.caption, fontWeight: "600", letterSpacing: 1 },
  primary: { minHeight: Layout.touchTarget, borderRadius: Radius.control, padding: Space.md, backgroundColor: colors.action, alignItems: "center", justifyContent: "center" },
  primaryText: { color: colors.inverseText, fontSize: FontSize.body, fontWeight: "600", textAlign: "center" },
  secondary: { minHeight: Layout.touchTarget, borderRadius: Radius.control, padding: Space.md, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.text, fontSize: FontSize.body, fontWeight: "500", textAlign: "center" },
  destructive: { minHeight: Layout.touchTarget, borderRadius: Radius.control, padding: Space.md, backgroundColor: colors.errorSoft, borderWidth: 1, borderColor: colors.error, alignItems: "center", justifyContent: "center" },
  destructiveText: { color: colors.error, fontSize: FontSize.body, fontWeight: "600", textAlign: "center" },
  details: { padding: Space.xs, gap: Space.sm },
  rows: { gap: Space.sm },
  row: { flexDirection: "row", alignItems: "center", gap: Space.md },
  rowLabel: { flex: 1, color: colors.text, fontSize: FontSize.body, lineHeight: 23 },
  count: { color: colors.text, fontSize: FontSize.body, fontWeight: "600", fontVariant: ["tabular-nums"] },
  confirm: { flexDirection: "row", alignItems: "center", gap: Space.sm, padding: Space.md, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: Radius.control, minHeight: Layout.touchTarget },
  confirmSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  check: { fontSize: FontSize.title, color: colors.primary },
  warning: { borderRadius: Radius.card, backgroundColor: colors.warningSoft, padding: Space.md, gap: Space.xs },
  warningTitle: { color: colors.warning, fontSize: FontSize.subtitle, fontWeight: "600" },
  warningText: { color: colors.warning, fontSize: FontSize.body, lineHeight: 24 },
  errorBox: { borderRadius: Radius.card, backgroundColor: colors.errorSoft, padding: Space.md },
  errorText: { color: colors.error, fontSize: FontSize.body, lineHeight: 24 },
  notice: { borderRadius: Radius.card, backgroundColor: colors.surface2, padding: Space.md },
  busy: { flexDirection: "row", gap: Space.sm, alignItems: "center", padding: Space.sm },
  disabled: { opacity: 0.5 },
}));
