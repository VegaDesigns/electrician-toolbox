import { Space, Layout , Radius, FontSize, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import { ReferenceColors } from "../../theme/color";

export const useStyles = defineStyles(({ colors: Colors }) => ({
  menu: { width: 48, height: 48, borderRadius: Radius.round, alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: Colors.surface2 },
  menuLine: { width: 20, height: 2, borderRadius: 1, backgroundColor: Colors.text },
  safe: {
    backgroundColor: Colors.bg,
    flex: 1,
  },

  container: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: Layout.contentWidth,
    paddingBottom: 22,
    paddingHorizontal: Space.md,
    paddingTop: Space.sm,
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: Space.sm,
    marginBottom: 28,
  },

  brandMark: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: Radius.card,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 50,

  },

  brandMarkText: {
    color: Colors.inverseText,
    fontSize: FontSize.heading,
    fontWeight: "500",
    lineHeight: 33,
  },

  headerCopy: {
    flex: 1,
    gap: 3,
  },

  brandName: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 1.1,
  },

  headline: { fontFamily: Fonts.heading,
    color: Colors.text,
    fontSize: FontSize.title,
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  sectionLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 1.25,
    marginBottom: 10,
    marginLeft: 2,
  },

  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Space.sm,
  },

  toolTile: {
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.large,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "48.5%",
    overflow: "hidden",
    padding: 15,

  },

toolTileBlue: {
    borderBottomColor: Colors.borderStrong,
  },

toolTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  toolIcon: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "center",
    width: 44,

  },

  toolIconBlue: {
    backgroundColor: Colors.surface3,
  },

  toolIconPhase: {
    backgroundColor: Colors.surface2,
    gap: 3,
    paddingHorizontal: 6,
    width: 53,
  },

  toolIconText: {
    color: Colors.primary,
    fontSize: FontSize.heading,
    fontWeight: "500",
    lineHeight: 30,
  },

  toolIconTextBlue: {
    color: Colors.primary,
  },

  phaseDot: {
    borderColor: Colors.border,
    borderRadius: Radius.small,
    borderWidth: 1,
    height: 13,
    width: 13,
  },

  phaseBlack: {
    backgroundColor: ReferenceColors.color14171A,
  },

  phaseRed: {
    backgroundColor: ReferenceColors.colorD94A43,
  },

  phaseBlue: {
    backgroundColor: ReferenceColors.color3277D5,
  },

  openArrow: {
    color: Colors.textSubtle,
    fontSize: FontSize.section,
    fontWeight: "500",
  },

  toolCopy: {
    gap: Space.xxs,
    marginTop: "auto",
  },

  statusText: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  toolTitle: { fontFamily: Fonts.heading,
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  toolSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    lineHeight: 15,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.975 }],

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
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.9,
  },
}));
