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
    marginBottom: 28,
  },

  brandMark: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 15,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 50,
    ...Effects.primaryRaised,
  },

  brandMarkText: {
    color: Colors.inverseText,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 33,
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
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0.1,
  },

  sectionLabel: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.25,
    marginBottom: 10,
    marginLeft: 2,
  },

  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  toolTile: {
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "48.5%",
    overflow: "hidden",
    padding: 15,
    ...Effects.surfaceRaised,
  },

  toolTileAmber: {
    borderBottomColor: Colors.primaryMuted,
  },

  toolTileBlue: {
    borderBottomColor: Colors.borderStrong,
  },

  toolTilePhase: {
    borderBottomColor: "#713932",
  },

  toolTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  toolIcon: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "center",
    width: 44,
    ...Effects.recessed,
  },

  toolIconBlue: {
    backgroundColor: Colors.surface3,
  },

  toolIconPhase: {
    backgroundColor: "#171D24",
    gap: 3,
    paddingHorizontal: 6,
    width: 53,
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

  phaseDot: {
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    height: 13,
    width: 13,
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

  openArrow: {
    color: Colors.textSubtle,
    fontSize: 20,
    fontWeight: "800",
  },

  toolCopy: {
    gap: 4,
    marginTop: "auto",
  },

  statusText: {
    color: "#89A6C1",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  toolTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.1,
  },

  toolSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.975 }],
    ...Effects.pressed,
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: "auto",
    paddingTop: 22,
  },

  offlineDot: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 6,
    width: 6,
  },

  footerText: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
});
