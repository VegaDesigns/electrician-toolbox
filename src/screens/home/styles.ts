import { StyleSheet } from "react-native";
import { Colors, Effects } from "../../theme";

export const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.bg,
    flex: 1,
  },

  container: {
    alignSelf: "center",
    flexGrow: 1,
    gap: 14,
    maxWidth: 520,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  brandMark: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
    ...Effects.primaryRaised,
  },

  brandMarkText: {
    color: Colors.inverseText,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 34,
  },

  headerCopy: {
    flex: 1,
    gap: 3,
  },

  brandName: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  headline: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.1,
  },

  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 3,
  },

  toolStack: {
    gap: 14,
  },

  toolCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 23,
    borderWidth: 1,
    minHeight: 214,
    overflow: "hidden",
    padding: 17,
    ...Effects.surfaceRaised,
  },

  toolCardAmber: {
    borderBottomColor: Colors.primaryMuted,
  },

  toolCardBlue: {
    borderBottomColor: Colors.borderStrong,
  },

  toolCardPhase: {
    borderBottomColor: "#713932",
  },

  toolTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 19,
  },

  toolIcon: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  toolIconBlue: {
    backgroundColor: Colors.surface3,
  },

  toolIconPhase: {
    backgroundColor: "#302229",
  },

  toolIconText: {
    color: Colors.primary,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 30,
  },

  toolIconTextBlue: {
    color: "#89A6C1",
  },

  toolIconTextPhase: {
    color: "#D94A43",
  },

  openArrow: {
    color: Colors.textMuted,
    fontSize: 25,
    fontWeight: "700",
  },

  toolEyebrow: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 3,
  },

  toolTitle: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0.1,
  },

  toolDescription: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 360,
  },

  workpadPreview: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
  },

  workpadPreviewValue: {
    color: Colors.primary,
    fontSize: 21,
    fontWeight: "900",
  },

  workpadPreviewLabel: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    paddingBottom: 3,
  },

  pipePreview: {
    height: 38,
    marginTop: 18,
    position: "relative",
  },

  pipeSegment: {
    backgroundColor: "#6F8DA8",
    borderRadius: 3,
    height: 5,
    position: "absolute",
  },

  pipeSegmentStart: {
    bottom: 4,
    left: 0,
    width: "29%",
  },

  pipeSegmentRise: {
    bottom: 12,
    left: "27%",
    transform: [{ rotate: "-25deg" }],
    width: "23%",
  },

  pipeSegmentEnd: {
    bottom: 19,
    left: "47%",
    width: "29%",
  },

  pipeDefault: {
    bottom: 13,
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    position: "absolute",
    right: 0,
  },

  phasePreview: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 21,
  },

  phaseSwatch: {
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    width: 18,
  },

  phaseBlack: {
    backgroundColor: "#14171A",
  },

  phaseRed: {
    backgroundColor: "#D94A43",
  },

  phaseBlue: {
    backgroundColor: "#3277D5",
  },

  phasePreviewText: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginLeft: 4,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
    ...Effects.pressed,
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 10,
  },

  footerText: {
    color: Colors.textSubtle,
    fontSize: 11,
    fontWeight: "700",
  },

  footerDot: {
    backgroundColor: Colors.borderStrong,
    borderRadius: 2,
    height: 3,
    width: 3,
  },
});
