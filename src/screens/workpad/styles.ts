import { Space, Layout , FontSize, Radius, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import { StyleSheet } from "react-native";

export const useStyles = defineStyles(({ colors: Colors }) => ({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: Layout.contentWidth,
    alignSelf: "center",
    paddingHorizontal: Space.md,
    paddingTop: 10,
    paddingBottom: Space.sm,
    gap: 10,
  },

  containerCompact: {
    gap: 7,
    paddingTop: Space.xxs,
    paddingBottom: 6,
  },

  headerRow: {
    width: "100%",
    maxWidth: Layout.contentWidth,
    alignSelf: "center",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: Space.xs,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },

  title: { fontFamily: Fonts.heading,
    color: Colors.text,
    flex: 1,
    fontSize: FontSize.section,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  historyButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
    borderRadius: Radius.control,
    backgroundColor: Colors.surface3,
    borderWidth: 1,
    borderColor: Colors.border,

  },

  historyIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },

  historyClockFace: {
    borderColor: Colors.textMuted,
    borderRadius: Radius.control,
    borderWidth: 1.6,
    height: 22,
    position: "relative",
    width: 22,
  },

  historyClockHour: {
    backgroundColor: Colors.text,
    borderRadius: 1,
    height: 5,
    left: 9,
    position: "absolute",
    top: 5,
    width: 1.5,
  },

  historyClockMinute: {
    backgroundColor: Colors.text,
    borderRadius: 1,
    height: 1.5,
    left: 10,
    position: "absolute",
    top: 9.5,
    transform: [{ rotate: "28deg" }],
    transformOrigin: "left center",
    width: 5,
  },

  historyClockCenter: {
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
    height: 3,
    left: 8.7,
    position: "absolute",
    top: 8.7,
    width: 3,
  },

  settingsButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,

  },

  settingsButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.section,
    fontWeight: "500",
    lineHeight: 24,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],

  },
}));
