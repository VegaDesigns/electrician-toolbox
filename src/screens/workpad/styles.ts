import { StyleSheet } from "react-native";
import { Colors } from "../../theme";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: "flex-end",
    gap: 10,
  },

  containerCompact: {
    gap: 7,
    paddingTop: 4,
    paddingBottom: 6,
  },

  headerRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },

  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  subtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  smartInputButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },

  smartInputTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  smartInputTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  smartInputSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  smartInputArrow: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "500",
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
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
  },
});
