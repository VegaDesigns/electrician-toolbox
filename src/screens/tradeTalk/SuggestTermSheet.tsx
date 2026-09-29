import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Share, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { useI18n } from "../../i18n";
import { defineStyles, useAppTheme } from "../../theme";
import { FontSize, Layout, Radius, Space } from "../../theme/tokens";
import { formatTermSuggestion, SUGGESTION_LIMITS, validateTermSuggestion } from "../../utils/tradeTalk/suggestion";

// Mount only while open so every new suggestion starts with a fresh, private draft.
export function SuggestTermSheet({ onClose }: { onClose: () => void }) {
  const s = useStyles();
  const { t, language } = useI18n();
  const { theme: { colors } } = useAppTheme();
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [region, setRegion] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const draft = { term, meaning, region };
  const dirty = !!(term || meaning || region);
  const report = reviewing ? formatTermSuggestion(draft, language) : "";

  function requestClose() {
    if (busy) return;
    Keyboard.dismiss();
    if (dirty) setDiscarding(true);
    else onClose();
  }
  function review() {
    const problem = validateTermSuggestion(draft);
    setError(problem ?? "");
    if (problem) return;
    Keyboard.dismiss(); setStatus(""); setReviewing(true);
  }
  async function share(copy: boolean) {
    setBusy(true); setError(""); setStatus("");
    try {
      if (copy) {
        await Clipboard.setStringAsync(report);
        setStatus("Copied. Send it to the person who invited you.");
      } else {
        const result = await Share.share({ title: t("Term suggestion"), message: report });
        setStatus(result.action === Share.sharedAction
          ? "Sharing finished. The app cannot confirm delivery."
          : "Sharing canceled. Nothing was submitted by the app.");
      }
    } catch { setError("Couldn't share the suggestion. Try copying it instead."); }
    finally { setBusy(false); }
  }

  return <Modal visible transparent animationType="slide" onRequestClose={requestClose}>
    <SafeAreaProvider><SafeAreaView edges={["top", "bottom"]} style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.keyboard}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
            {discarding ? <>
              <Text accessibilityRole="header" style={s.heading}>{t("Close this suggestion?")}</Text>
              <Text style={s.body}>{t("This draft is not saved in the app. Keep editing, or discard it and close.")}</Text>
              <Pressable accessibilityRole="button" onPress={() => setDiscarding(false)} style={s.primary}><Text style={s.primaryText}>{t("Keep editing")}</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={onClose} style={s.secondary}><Text style={s.danger}>{t("Discard and close")}</Text></Pressable>
            </> : <>
              <View style={s.header}><Text accessibilityRole="header" style={[s.heading, s.grow]}>{t(reviewing ? "Review suggestion" : "Suggest a term")}</Text>
                <Pressable accessibilityRole="button" disabled={busy} onPress={requestClose} style={s.close}><Text style={s.link}>{t("Close")}</Text></Pressable>
              </View>
              <Text style={s.body}>{t("Send this to the person who invited you to test the app. Suggestions are reviewed before being added; nothing is sent automatically.")}</Text>
              {reviewing ? <>
                <Text style={s.label}>{t("This is everything that will be shared")}</Text>
                <Text selectable style={s.preview}>{report}</Text>
                <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setReviewing(false); setStatus(""); }} style={s.secondary}><Text style={s.buttonText}>{t("Edit suggestion")}</Text></Pressable>
                <View style={s.actions}>
                  <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void share(true); }} style={[s.primary, s.grow, busy && s.disabled]}><Text style={s.primaryText}>{t("Copy suggestion")}</Text></Pressable>
                  {Platform.OS !== "web" ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void share(false); }} style={[s.secondary, s.grow, busy && s.disabled]}><Text style={s.buttonText}>{t("Share suggestion")}</Text></Pressable> : null}
                </View>
              </> : <>
                <Text style={s.label}>{t("Word or term")}</Text>
                <TextInput accessibilityLabel={t("Word or term")} maxLength={SUGGESTION_LIMITS.term} value={term} onChangeText={value => { setTerm(value); setError(""); }} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} placeholder={t("What does your crew call it?")} placeholderTextColor={colors.textMuted} style={s.input} />
                <Text style={s.label}>{t("Suggested meaning")}</Text>
                <TextInput accessibilityLabel={t("Suggested meaning")} maxLength={SUGGESTION_LIMITS.meaning} value={meaning} onChangeText={value => { setMeaning(value); setError(""); }} multiline textAlignVertical="top" placeholder={t("Describe what it means and when you hear it.")} placeholderTextColor={colors.textMuted} style={[s.input, s.meaning]} />
                <Text style={s.label}>{t("Country or region (optional)")}</Text>
                <TextInput accessibilityLabel={t("Country or region (optional)")} maxLength={SUGGESTION_LIMITS.region} value={region} onChangeText={setRegion} returnKeyType="done" onSubmitEditing={review} placeholder={t("Where is the term used?")} placeholderTextColor={colors.textMuted} style={s.input} />
                <Text style={s.body}>{t("Leave out customer names, private job details, and copyrighted definitions. Use your own words.")}</Text>
                <Pressable accessibilityRole="button" onPress={review} style={s.primary}><Text style={s.primaryText}>{t("Review suggestion")}</Text></Pressable>
                <Pressable accessibilityRole="button" onPress={requestClose} style={s.secondary}><Text style={s.buttonText}>{t("Cancel")}</Text></Pressable>
              </>}
              {error ? <Text accessibilityRole="alert" style={s.danger}>{t(error)}</Text> : null}
              {status ? <Text accessibilityLiveRegion="polite" style={s.body}>{t(status)}</Text> : null}
            </>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView></SafeAreaProvider>
  </Modal>;
}

const useStyles = defineStyles(({ colors }) => ({
  safe: { flex: 1, backgroundColor: colors.overlay },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: Radius.large, borderTopRightRadius: Radius.large, width: "100%", maxWidth: Layout.contentWidth, maxHeight: "95%", alignSelf: "center" },
  handle: { height: 4, width: 38, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginTop: Space.sm },
  content: { padding: Space.md, gap: Space.sm },
  header: { flexDirection: "row", gap: Space.sm, alignItems: "center" },
  heading: { color: colors.text, fontSize: FontSize.section, fontWeight: "600" },
  grow: { flex: 1, minWidth: 0 },
  body: { color: colors.textMuted, fontSize: FontSize.caption, lineHeight: 20 },
  label: { color: colors.text, fontSize: FontSize.label, fontWeight: "600" },
  input: { backgroundColor: colors.surface2, color: colors.text, minHeight: 52, borderRadius: Radius.control, borderWidth: 1, borderColor: colors.borderStrong, padding: Space.sm, fontSize: FontSize.body },
  meaning: { minHeight: 112 },
  preview: { color: colors.text, backgroundColor: colors.surface2, padding: Space.sm, fontSize: FontSize.body, lineHeight: 24, borderRadius: Radius.control },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Space.sm },
  primary: { minHeight: 48, paddingHorizontal: Space.sm, paddingVertical: Space.sm, backgroundColor: colors.action, alignItems: "center", justifyContent: "center", borderRadius: Radius.control },
  primaryText: { color: colors.inverseText, fontSize: FontSize.label, fontWeight: "600", textAlign: "center" },
  secondary: { minHeight: 48, paddingHorizontal: Space.sm, paddingVertical: Space.sm, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: Radius.control, justifyContent: "center", alignItems: "center" },
  buttonText: { color: colors.text, fontSize: FontSize.label, fontWeight: "600", textAlign: "center" },
  close: { minHeight: 48, minWidth: 48, paddingHorizontal: Space.xs, alignItems: "center", justifyContent: "center" },
  link: { color: colors.primary, fontSize: FontSize.label, fontWeight: "600" },
  danger: { color: colors.error, fontSize: FontSize.label, lineHeight: 21 },
  disabled: { opacity: 0.5 },
}));
