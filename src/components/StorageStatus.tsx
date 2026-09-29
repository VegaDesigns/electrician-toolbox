import { Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./FeedbackPressable";
import { defineStyles, Space, FontSize, Layout, Radius } from "../theme";
import { useI18n } from "../i18n";

export function StorageStatus({ state, onRetry, label = "Settings" }: {
  state: { ready: boolean; loading: boolean; saving: boolean; error: "load" | "save" | null };
  onRetry: () => unknown; label?: string;
}) {
  const s = useStyles();
  const { t } = useI18n();
  if (state.ready && !state.error && !state.saving) return null;
  return <View style={s.box}>
    <Text accessibilityRole={state.error ? "alert" : undefined} accessibilityLiveRegion="polite" style={[s.text, !!state.error && s.error]}>
      {state.error === "load" ? t("{{label}} couldn't be loaded. Your saved data is unchanged.", { label: t(label) })
        : state.error === "save" ? t("Changes aren't saved on this device. Retry saving.")
          : state.saving ? t("Saving…") : t("Loading {{label}}…", { label: t(label).toLowerCase() })}
    </Text>
    {state.error && <Pressable accessibilityRole="button" onPress={() => { void onRetry(); }} style={s.button}>
      <Text style={s.link}>{t(state.error === "load" ? "Retry loading" : "Retry saving")}</Text>
    </Pressable>}
  </View>;
}
const useStyles = defineStyles(({ colors: c }) => ({
  box: { padding: Space.sm, gap: Space.xs, width: "100%", maxWidth: Layout.contentWidth, alignSelf: "center" },
  text: { color: c.textMuted, fontSize: FontSize.label, lineHeight: 21 },
  error: { color: c.error },
  button: { minHeight: Layout.touchTarget, borderRadius: Radius.control, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center", paddingHorizontal: Space.md },
  link: { color: c.primary, fontSize: FontSize.body },
}));
