import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { BackButton } from "../../components/BackButton";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { FormField } from "../../components/FormField";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getReleaseLinks } from "../../config/release";
import { useLeaveGuard } from "../../hooks/useLeaveGuard";
import { defineStyles, Fonts, FontSize, Layout, Radius, Space } from "../../theme";
import { returnHome } from "../../utils/navigation";
import { getAppReportInfo } from "../../utils/support/appInfo";
import { createProblemReport, type ReportDraft } from "../../utils/support/report";

type Section = "start" | "data" | "electrical" | "report";
const tools = ["General", "Workpad", "Panel Colors", "Jobsite Lists", "Fill Guide", "Wire Guide", "Trade Talk", "Bending"];

export default function HelpScreen() {
  const s = useStyles();
  const [section, setSection] = useState<Section | null>(null);
  const [draft, setDraft] = useState<ReportDraft>({ tool: "General", details: "", expected: "" });
  const [reviewing, setReviewing] = useState(false);
  const [handled, setHandled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const info = getAppReportInfo();
  const links = getReleaseLinks();
  const report = createProblemReport(draft, info);
  const guard = useLeaveGuard(Boolean(draft.details.trim() || draft.expected.trim()) && !handled);

  function edit(next: Partial<ReportDraft>) {
    setDraft(current => ({ ...current, ...next }));
    setHandled(false);
    setReviewing(false);
    setStatus(null);
  }
  function toggle(next: Section) { setSection(current => current === next ? null : next); }
  async function openLink(url: string) {
    try { await Linking.openURL(url); }
    catch { setStatus({ text: "Could not open that link. Check your connection or try again later.", error: true }); }
  }
  async function sendReport(copy: boolean) {
    if (busy || !draft.details.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      if (copy) {
        await Clipboard.setStringAsync(report);
        setHandled(true);
        setStatus({ text: "Report copied. Paste it into a message to your tester contact.", error: false });
      } else {
        const result = await Share.share({ title: `${info.appName} feedback`, message: report });
        if (result.action !== Share.dismissedAction) {
          setHandled(true);
          setStatus({ text: "Share sheet opened. Delivery is handled by the app you chose.", error: false });
        }
      }
    } catch {
      setStatus({ text: copy ? "Could not copy. Your report is still here; try again." : "Could not open sharing. Try Copy report instead.", error: true });
    } finally { setBusy(false); }
  }

  function sectionButton(id: Section, title: string, subtitle: string) {
    return <Pressable accessibilityRole="button" accessibilityState={{ expanded: section === id }} onPress={() => toggle(id)} style={s.sectionButton}>
      <View style={s.grow}><Text style={s.sectionTitle}>{title}</Text><Text style={s.muted}>{subtitle}</Text></View>
      <Text style={s.chevron}>{section === id ? "−" : "+"}</Text>
    </Pressable>;
  }

  return <SafeAreaView style={s.safe}>
    <ScreenHeader><BackButton onPress={() => guard.requestLeave(returnHome)} /><Text accessibilityRole="header" style={s.title}>Help & app information</Text></ScreenHeader>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={s.content}>
        <Text style={s.intro}>Quick answers. Your work stays in your hands.</Text>
        {sectionButton("start", "Getting started", "A few useful habits for the jobsite")}
        {section === "start" ? <View style={s.section}>
          <Text style={s.body}>Workpad · Enter an equation and press =. Tap inside it to correct a digit. Use the fraction key for tape-measure values and the settings control for precision.</Text>
          <Text style={s.body}>Panel Colors · Choose the scheme that matches the verified panel, enter a circuit, then press Enter. Nearby circuits use the same setup.</Text>
          <Text style={s.body}>Jobsite Lists · Start a fresh list for a job. Add materials with quantities and separate notes. Editing a quantity keeps the remaining material easy to track.</Text>
          <Text style={s.body}>Fill Guide and Wire Guide · Check every input and the tool’s limitations before using a result. Fill space and conductor ampacity are different checks.</Text>
          <Text style={s.body}>Bending · Confirm the conduit and your bender’s markings. Read the answer, then use the mark and finished views as an illustration—not a scale drawing.</Text>
          <Text style={s.body}>Trade Talk · Search a trade term or slang phrase. Regional wording can differ.</Text>
          <Text style={s.muted}>Use the top-left arrow to return home. Core tools work offline after the app is installed; opening external references needs a connection.</Text>
        </View> : null}
        {sectionButton("data", "Your data & privacy", "Local saves, manual backups, and sharing")}
        {section === "data" ? <View style={s.section}>
          <Text style={s.body}>Saved lists and notes, panel presets, calculator history, and tool preferences are stored on this device. There is no app account or automatic cross-device sync.</Text>
          <Text style={s.body}>Unfinished forms and fill calculations are session-only. Closing the app can clear them. They are not part of a backup.</Text>
          <Text style={s.body}>A manual backup contains saved work and preferences, including job names and notes. The exported file is not encrypted by this app. Save it somewhere you trust. Anyone with the file may be able to read it.</Text>
          <Text style={s.body}>Restoring a backup replaces saved app data after confirmation; it does not merge jobs. Export a current backup first. Device loss, clearing app storage, or deleting the app can remove local data.</Text>
          <Text style={s.body}>Copy and Share send only the content you choose to your clipboard or selected app. Feedback below does not automatically attach your lists, history, or presets. Avoid including customer details or access codes.</Text>
          <Text style={s.body}>This version has no advertising, account login, purchase system, or app-added analytics service. Update checks may contact Expo. Expo Go, TestFlight, your device, and apps you share to have their own data practices.</Text>
          <Text style={s.muted}>This is a description of the current test build, not a finalized privacy policy. Public policy and contact details must be approved before launch.</Text>
          <Pressable accessibilityRole="button" onPress={() => guard.requestLeave(() => router.push("/backup"))} style={s.secondary}><Text style={s.link}>Backup & restore</Text></Pressable>
        </View> : null}
        {sectionButton("electrical", "Using electrical results", "Confirm the installation, not just the number")}
        {section === "electrical" ? <View style={s.section}>
          <Text style={s.body}>These tools are calculation and reference aids. A result is not an inspection, code approval, or a complete installation design. Confirm the code edition adopted for the job, local amendments, equipment ratings, and manufacturer instructions.</Text>
          <Text style={s.body}>Panel colors show the selected convention—not proof of conductor identity or whether a circuit is safe. Verify the actual panel and circuit before work.</Text>
          <Text style={s.body}>For fill and ampacity, verify conductor type, insulation, terminal ratings, temperature, conductor count, and tool assumptions. Some installation conditions are outside the simplified tools.</Text>
          <Text style={s.body}>Bender deductions and markings depend on the tool and conduit. Check your tool rather than assuming a generic value applies.</Text>
          <View style={s.notice}><Text style={s.noticeText}>Pre-release verification is still in progress. Do not use this test build as the sole basis for electrical work. Have questionable results checked by a qualified electrician.</Text></View>
        </View> : null}
        {sectionButton("report", "Report a problem", "Review a report, then choose how to share it")}
        {section === "report" ? <View style={s.section}>
          <Text style={s.muted}>During testing, send feedback to the person who invited you. Nothing is sent automatically. Your draft is not saved if you close the app.</Text>
          <Text style={s.label}>Which tool?</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Tool for feedback" style={s.chips}>{tools.map(tool => <Pressable key={tool} accessibilityRole="radio" aria-checked={draft.tool === tool} accessibilityState={{ checked: draft.tool === tool }} onPress={() => edit({ tool })} style={[s.chip, draft.tool === tool && s.chipSelected]}><Text style={[s.chipText, draft.tool === tool && s.link]}>{draft.tool === tool ? "✓ " : ""}{tool}</Text></Pressable>)}</View>
          <Text style={s.label}>What happened?</Text>
          <FormField accessibilityLabel="What happened and steps to repeat" placeholder="What did you tap or type? What happened next?" multiline textAlignVertical="top" maxLength={3000} value={draft.details} onChangeText={details => edit({ details })} style={s.reportInput} />
          <Text style={s.label}>What did you expect? <Text style={s.muted}>(optional)</Text></Text>
          <FormField accessibilityLabel="Expected behavior, optional" placeholder="What should have happened?" multiline textAlignVertical="top" maxLength={1500} value={draft.expected} onChangeText={expected => edit({ expected })} style={s.expectedInput} />
          <Text style={s.muted}>The report includes your text plus app version, build when available, operating system, and preview type. No device identifier, job contents, or screenshot is attached.</Text>
          {!reviewing ? <Pressable accessibilityRole="button" disabled={!draft.details.trim()} onPress={() => { setReviewing(true); setStatus(null); }} style={[s.primary, !draft.details.trim() && s.disabled]}><Text style={s.primaryText}>Review report</Text></Pressable> : <>
            <Text style={s.label}>Exactly what will be shared</Text>
            <View style={s.preview}><Text selectable style={s.previewText}>{report}</Text></View>
            <View style={s.actions}>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void sendReport(false)} style={[s.primary, s.flex, busy && s.disabled]}><Text style={s.primaryText}>Share report</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => void sendReport(true)} style={[s.secondary, s.flex, busy && s.disabled]}><Text style={s.link}>Copy report</Text></Pressable>
            </View>
            {links.supportEmail ? <Pressable accessibilityRole="button" onPress={() => void openLink(`mailto:${links.supportEmail}?subject=${encodeURIComponent(`${info.appName} feedback`)}&body=${encodeURIComponent(report)}`)} style={s.secondary}><Text style={s.link}>Email support</Text></Pressable> : null}
          </>}
        </View> : null}
        {status ? <View accessibilityRole={status.error ? "alert" : undefined} accessibilityLiveRegion="polite" style={[s.notice, status.error && s.error]}><Text style={status.error ? s.errorText : s.noticeText}>{status.text}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dismiss feedback message" onPress={() => setStatus(null)} style={s.dismiss}><Text style={status.error ? s.errorText : s.link}>Dismiss</Text></Pressable></View> : null}
        {(links.supportUrl || links.privacyUrl || links.termsUrl) ? <View style={s.section}>
          {links.supportUrl ? <Pressable accessibilityRole="link" onPress={() => void openLink(links.supportUrl!)} style={s.secondary}><Text style={s.link}>Customer support</Text></Pressable> : null}
          {links.privacyUrl ? <Pressable accessibilityRole="link" onPress={() => void openLink(links.privacyUrl!)} style={s.secondary}><Text style={s.link}>Privacy policy</Text></Pressable> : null}
          {links.termsUrl ? <Pressable accessibilityRole="link" onPress={() => void openLink(links.termsUrl!)} style={s.secondary}><Text style={s.link}>Terms & license information</Text></Pressable> : null}
        </View> : null}
        <View style={s.footer}><Text style={s.muted}>{info.appName}</Text><Text selectable style={s.muted}>Version {info.version}{info.build ? ` · Build ${info.build}` : ""}</Text><Text style={s.small}>{info.environment}{info.osVersion ? ` · ${info.platform} ${info.osVersion}` : ""}</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
    {guard.dialog}
  </SafeAreaView>;
}

const useStyles = defineStyles(({ colors: c }) => ({
  safe: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  grow: { flex: 1, gap: Space.xxs },
  title: { flex: 1, color: c.text, fontFamily: Fonts.heading, fontSize: FontSize.title },
  content: { width: "100%", maxWidth: Layout.contentWidth, alignSelf: "center", paddingHorizontal: Space.md, paddingTop: Space.sm, paddingBottom: Space.xl, gap: Space.sm },
  intro: { color: c.textMuted, fontSize: FontSize.body, lineHeight: 24, marginBottom: Space.xs },
  sectionButton: { flexDirection: "row", alignItems: "center", gap: Space.sm, minHeight: Layout.touchTarget, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: Radius.card, padding: Space.md },
  sectionTitle: { color: c.text, fontFamily: Fonts.heading, fontSize: FontSize.section },
  chevron: { color: c.primary, fontSize: FontSize.title, width: 24, textAlign: "center" },
  section: { gap: Space.md, padding: Space.md, backgroundColor: c.surface, borderRadius: Radius.card, borderWidth: 1, borderColor: c.border },
  body: { color: c.text, fontSize: FontSize.body, lineHeight: 24 },
  muted: { color: c.textMuted, fontSize: FontSize.label, lineHeight: 21 },
  small: { color: c.textMuted, fontSize: FontSize.caption, lineHeight: 18 },
  label: { color: c.text, fontSize: FontSize.body, fontWeight: "500" },
  secondary: { minHeight: Layout.touchTarget, borderRadius: Radius.control, justifyContent: "center", alignItems: "center", padding: Space.sm, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border },
  primary: { minHeight: Layout.touchTarget, borderRadius: Radius.control, justifyContent: "center", alignItems: "center", padding: Space.sm, backgroundColor: c.action },
  primaryText: { color: c.inverseText, fontSize: FontSize.body, fontWeight: "500", textAlign: "center" },
  link: { color: c.primary, fontSize: FontSize.label, fontWeight: "500", textAlign: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Space.xs },
  chip: { minHeight: Layout.touchTarget, paddingHorizontal: Space.sm, paddingVertical: Space.xs, borderRadius: Radius.control, borderWidth: 1, borderColor: c.border, justifyContent: "center", backgroundColor: c.surface2 },
  chipSelected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  chipText: { color: c.text, fontSize: FontSize.label },
  reportInput: { minHeight: 120 },
  expectedInput: { minHeight: 88 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Space.xs },
  disabled: { opacity: 0.5 },
  preview: { backgroundColor: c.surface2, padding: Space.md, borderRadius: Radius.control },
  previewText: { color: c.text, fontSize: FontSize.label, lineHeight: 21 },
  notice: { backgroundColor: c.primarySoft, padding: Space.md, borderRadius: Radius.control, gap: Space.xs },
  noticeText: { color: c.text, fontSize: FontSize.label, lineHeight: 21 },
  error: { backgroundColor: c.errorSoft },
  errorText: { color: c.error, fontSize: FontSize.label, lineHeight: 21 },
  dismiss: { minHeight: Layout.touchTarget, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: Space.sm },
  footer: { paddingVertical: Space.md, alignItems: "center", gap: Space.xxs },
}));
