import { StyleSheet } from "react-native";
import { Colors, Effects } from "../../theme";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },

  containerCompact: {
    gap: 7,
    paddingTop: 4,
    paddingBottom: 6,
  },

  headerRow: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },

  title: {
    color: Colors.text,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  homeButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 13,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
    ...Effects.controlRaised,
  },

  homeButtonText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },

  historyButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: Colors.surface3,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Effects.controlRaised,
  },

  historyButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  interpretationBanner: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
    ...Effects.primaryRaised,
  },

  interpretationSparkle: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },

  interpretationText: {
    flex: 1,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  interpretationDismiss: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  interpretationDismissText: {
    color: Colors.primary,
    fontSize: 30,
    fontWeight: "500",
    lineHeight: 32,
  },

  settingsSummary: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    ...Effects.surfaceRaised,
  },

  settingsSummaryText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: "800",
  },

  settingsChevron: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: "700",
  },

  settingsPanel: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 2,
  },

  settingGroup: {
    flex: 1,
    gap: 5,
  },

  settingLabel: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  segmented: {
    minHeight: 36,
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 2,
    ...Effects.recessed,
  },

  segment: {
    flex: 1,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingHorizontal: 4,
  },

  segmentSelected: {
    backgroundColor: Colors.primarySoft,
    ...Effects.controlRaised,
  },

  segmentText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },

  segmentTextSelected: {
    color: Colors.primary,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
    ...Effects.pressed,
  },
});
