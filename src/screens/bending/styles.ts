import { StyleSheet } from "react-native";

import { Colors, Effects } from "../../theme";

export const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.bg,
    flex: 1,
  },

  header: {
    alignItems: "center",
    alignSelf: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    maxWidth: 520,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
  },

  homeButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
    ...Effects.controlRaised,
  },

  homeButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  headerCopy: {
    alignItems: "flex-end",
    flex: 1,
  },

  headerEyebrow: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 1,
  },

  container: {
    alignSelf: "center",
    flexGrow: 1,
    gap: 13,
    justifyContent: "center",
    maxWidth: 520,
    padding: 16,
    width: "100%",
  },

  hero: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 25,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 21,
    paddingHorizontal: 19,
    paddingTop: 15,
    ...Effects.surfaceRaised,
  },

  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusDot: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 6,
    width: 6,
  },

  statusBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  illustration: {
    height: 250,
    marginBottom: -8,
    marginTop: -13,
    width: "100%",
  },

  eyebrow: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  title: {
    color: Colors.text,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 6,
    textAlign: "center",
  },

  description: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 410,
    textAlign: "center",
  },

  buildCard: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13,
    ...Effects.surfaceRaised,
  },

  buildIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  buildIconText: {
    color: "#89A6C1",
    fontSize: 22,
    fontWeight: "900",
  },

  buildCopy: {
    flex: 1,
  },

  buildLabel: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  buildTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  buildDescription: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 17,
    ...Effects.primaryRaised,
  },

  primaryButtonText: {
    color: Colors.inverseText,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  primaryButtonArrow: {
    color: Colors.inverseText,
    fontSize: 20,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
    ...Effects.pressed,
  },
});
