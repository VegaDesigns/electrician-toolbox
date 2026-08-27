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
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    maxWidth: 520,
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

  headerTitle: {
    color: Colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
  },

  container: {
    alignSelf: "center",
    flexGrow: 1,
    gap: 14,
    maxWidth: 520,
    padding: 16,
    width: "100%",
  },

  hero: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 330,
    overflow: "hidden",
    padding: 18,
    ...Effects.surfaceRaised,
  },

  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    width: 50,
  },

  heroIconText: {
    color: "#89A6C1",
    fontSize: 29,
    fontWeight: "900",
  },

  defaultBadge: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  defaultBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  eyebrow: {
    color: Colors.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    color: Colors.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 5,
  },

  description: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 7,
    maxWidth: 370,
  },

  pipeDiagram: {
    height: 82,
    marginTop: 28,
    position: "relative",
  },

  pipeSegment: {
    backgroundColor: "#6F8DA8",
    borderRadius: 4,
    height: 8,
    position: "absolute",
  },

  pipeStart: {
    bottom: 12,
    left: 0,
    width: "34%",
  },

  pipeRise: {
    bottom: 32,
    left: "31%",
    transform: [{ rotate: "-28deg" }],
    width: "30%",
  },

  pipeEnd: {
    bottom: 51,
    left: "58%",
    width: "38%",
  },

  mark: {
    backgroundColor: Colors.primary,
    borderRadius: 2,
    height: 17,
    position: "absolute",
    width: 3,
  },

  markOne: {
    bottom: 7,
    left: "30%",
  },

  markTwo: {
    bottom: 46,
    left: "59%",
  },

  nextCard: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
    padding: 17,
    ...Effects.surfaceRaised,
  },

  nextLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  nextTitle: {
    color: Colors.text,
    fontSize: 21,
    fontWeight: "900",
  },

  nextDescription: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  toolTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  toolTag: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  toolTagActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  toolTagText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },

  toolTagActiveText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
    ...Effects.pressed,
  },
});
