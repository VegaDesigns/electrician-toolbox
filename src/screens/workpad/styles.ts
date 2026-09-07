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
    gap: 8,
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
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...Effects.controlRaised,
  },

  homeButtonText: {
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: "900",
  },

  historyButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
    borderRadius: 13,
    backgroundColor: Colors.surface3,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Effects.controlRaised,
  },

  historyIcon: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 24,
  },

  historyClockFace: {
    borderColor: Colors.textMuted,
    borderRadius: 11,
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
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...Effects.controlRaised,
  },

  settingsButtonText: {
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
    ...Effects.pressed,
  },
});
