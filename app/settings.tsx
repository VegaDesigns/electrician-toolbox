import { useI18n } from "../src/i18n";
import { IconButton } from "../src/components/IconButton";
import { router } from "expo-router";
import { getAppReportInfo } from "../src/utils/support/appInfo";
import { returnHome } from "../src/utils/navigation";
import { FeedbackPressable as Pressable } from "../src/components/FeedbackPressable";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { defineStyles, Fonts, FontSize, Layout, Radius, Space, themeCatalog, themeDescriptions, themeNames, useAppTheme } from "../src/theme";
import { themeCollections, type AppearanceMode } from "../src/theme/preferences";

const modes: { id: AppearanceMode; label: string }[] = [
  { id: "system", label: "System" }, { id: "light", label: "Light" }, { id: "dark", label: "Dark" },
];

export default function SettingsScreen() {
  const { t, preference, setLanguage } = useI18n();
  const s = useStyles();
  const { preferences, theme, setAppearance, error, retrySave } = useAppTheme();
  const appInfo = getAppReportInfo();
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <Text accessibilityRole="header" style={s.title}>{t("Settings")}</Text>
        <IconButton icon="close" label={t("Close settings")} onPress={returnHome} />
      </View>
      <Text accessibilityRole="header" style={s.heading}>{t("Make it yours.")}</Text>
      <Text style={s.description}>{t("One look, across every tool. Your choice is saved on this device.")}</Text>
      <Text style={s.label}>{t("LANGUAGE")}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t("App language")} style={s.modes}>
        {([['system', t('Automatic')], ['en', 'English'], ['es', 'Español']] as const).map(([id, label]) => <Pressable key={id} accessibilityRole="radio" aria-checked={preference === id} accessibilityState={{ checked: preference === id }} onPress={() => setLanguage(id)} style={[s.mode, preference === id && s.selected]}><Text style={[s.body, s.centered, preference === id && s.selectedText]}>{label}</Text></Pressable>)}
      </View>
      <Text style={s.description}>{t("Follows your phone’s supported language. You can choose a different language here.")}</Text>
      <Text style={s.themeDescription}>{t("Language changes labels, not units, electrical rules, or your own notes.")}</Text>
      <Text style={s.label}>{t("APPEARANCE")}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t("Appearance mode")} style={s.modes}>
        {modes.map(mode => <Pressable key={mode.id} accessibilityRole="radio" aria-checked={preferences.mode === mode.id} accessibilityState={{ checked: preferences.mode === mode.id }} accessibilityLabel={t("{{mode}} appearance", { mode: t(mode.label) })} onPress={() => setAppearance({ mode: mode.id })} style={({ pressed }) => [s.mode, preferences.mode === mode.id && s.selected, pressed && s.pressed]}><Text style={[s.body, s.centered, preferences.mode === mode.id && s.selectedText]}>{t(mode.label)}</Text></Pressable>)}
      </View>
      <Text style={s.description}>{preferences.mode === "system" ? t("Follows your device’s light or dark appearance.") : t("{{mode}} appearance stays on until you change it.", { mode: t(preferences.mode === "dark" ? "Dark" : "Light").toLowerCase() })}</Text>
      <Text style={s.label}>{t("COLOR THEME")}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t("Color theme")} style={s.themes}>
        {themeCollections.map(collection => <View key={collection.name} style={s.collection}>
          <Text accessibilityRole="header" style={s.collectionTitle}>{t(collection.name)}</Text>
          {collection.themes.map(id => {
          const colors = themeCatalog[id][theme.mode];
          const selected = preferences.themeId === id;
          return <Pressable key={id} accessibilityRole="radio" accessibilityLabel={t("{{name}} theme", { name: t(themeNames[id]) })} aria-checked={selected} accessibilityState={{ checked: selected }} onPress={() => setAppearance({ themeId: id })} style={({ pressed }) => [s.theme, selected && s.selected, pressed && s.pressed]}>
            <View accessible={false} accessibilityElementsHidden style={s.swatches}>{[colors.bg, colors.surface2, colors.action].map((color, i) => <View key={i} style={[s.swatch, { backgroundColor: color, borderColor: colors.border }]} />)}</View>
            <View style={s.grow}><Text style={[s.body, selected && s.selectedText]}>{t(themeNames[id])}</Text><Text style={s.themeDescription}>{t(themeDescriptions[id])}</Text></View>
            <Text style={s.check}>{selected ? "✓" : ""}</Text>
          </Pressable>;
          })}
        </View>)}
      </View>
      {error ? <View accessibilityRole="alert" style={s.error}><Text style={s.errorText}>{t(error)}</Text><Pressable accessibilityRole="button" onPress={retrySave} style={s.retry}><Text style={s.errorText}>{t("Save again")}</Text></Pressable></View> : null}
      <Text style={s.label}>{t("SUPPORT & DATA")}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push("/backup")} style={s.destination}><View style={s.grow}><Text style={s.body}>{t("Backup & restore")}</Text><Text style={s.description}>{t("Keep a copy of saved work. Restore it when needed.")}</Text></View><Text style={s.check}>›</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.push("/help")} style={s.destination}><View style={s.grow}><Text style={s.body}>{t("Help & app information")}</Text><Text style={s.description}>{t("Getting started, privacy, and report a problem.")}</Text></View><Text style={s.check}>›</Text></Pressable>
      <View style={s.footer}><Text style={s.description}>{appInfo.appName}</Text><Text style={s.description}>{t("Version")} {appInfo.version}{appInfo.build ? ` · ${t("Build")} ${appInfo.build}` : ""}</Text><Text style={s.themeDescription}>{t(appInfo.environment)}</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const useStyles = defineStyles(({ colors: c }) => ({
  safe: { flex: 1, backgroundColor: c.bg },
  container: { width: "100%", maxWidth: Layout.contentWidth, alignSelf: "center", padding: Space.lg, gap: Space.sm, paddingBottom: Space.xl },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Space.sm },
  title: { color: c.text, fontFamily: Fonts.heading, fontSize: FontSize.title },
  heading: { color: c.text, fontFamily: Fonts.heading, fontSize: FontSize.screen },
  description: { color: c.textMuted, fontSize: FontSize.label, lineHeight: 21 },
  label: { color: c.textMuted, fontSize: FontSize.caption, letterSpacing: 1.4, marginTop: Space.md },
  body: { color: c.text, fontSize: FontSize.body },
  centered: { textAlign: "center", padding: Space.xs },
  close: { minWidth: Layout.touchTarget, minHeight: Layout.touchTarget, borderRadius: Radius.round, backgroundColor: c.surface2, justifyContent: "center", alignItems: "center" },
  closeText: { color: c.text, fontSize: FontSize.section },
  modes: { flexDirection: "row", gap: Space.xs },
  mode: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: Layout.touchTarget, backgroundColor: c.surface, borderRadius: Radius.control, borderWidth: 1, borderColor: c.border },
  selected: { borderColor: c.primary, backgroundColor: c.primarySoft },
  selectedText: { color: c.primary },
  themes: { gap: Space.xs },
  collection: { gap: Space.xs, marginBottom: Space.sm },
  collectionTitle: { color: c.text, fontFamily: Fonts.heading, fontSize: FontSize.section, marginBottom: Space.xxs },
  themeDescription: { color: c.textMuted, fontSize: FontSize.caption, lineHeight: 18, marginTop: Space.xxs },
  theme: { flexDirection: "row", alignItems: "center", gap: Space.md, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: Radius.card, padding: Space.sm, minHeight: 60 },
  swatches: { flexDirection: "row", gap: Space.xxs },
  swatch: { width: 22, height: 22, borderRadius: Radius.round, borderWidth: 1 },
  grow: { flex: 1 },
  check: { color: c.primary, width: 24, fontSize: FontSize.section },
  destination: { flexDirection: "row", alignItems: "center", gap: Space.sm, minHeight: Layout.touchTarget, padding: Space.md, backgroundColor: c.surface, borderRadius: Radius.card, borderColor: c.border, borderWidth: 1 },
  footer: { alignItems: "center", paddingTop: Space.lg, gap: Space.xxs },
  error: { padding: Space.md, backgroundColor: c.errorSoft, borderRadius: Radius.card },
  errorText: { color: c.error, fontSize: FontSize.label },
  retry: { minHeight: Layout.touchTarget, justifyContent: "center" },
  pressed: { opacity: 0.75 },
}));
