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
    gap: 10,
    maxWidth: 520,
    paddingBottom: 17,
    paddingHorizontal: 12,
    paddingTop: 10,
    width: "100%",
  },

  selectorRow: {
    flexDirection: "row",
    gap: 8,
  },

  selectorButton: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 51,
    paddingHorizontal: 12,
    ...Effects.controlRaised,
  },

  selectorCopy: {
    flex: 1,
    minWidth: 0,
  },

  selectorLabel: {
    color: Colors.textSubtle,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  selectorValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },

  selectorChevron: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 5,
    marginTop: -5,
  },

  resultCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 23,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 228,
    overflow: "hidden",
    paddingHorizontal: 17,
    paddingVertical: 15,
    ...Effects.surfaceRaised,
  },

  circuitLine: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },

  circuitLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  circuitNumber: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  phaseLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 5,
  },

  colorHero: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 7,
    minHeight: 61,
    paddingHorizontal: 23,
    width: "100%",
    ...Effects.controlRaised,
  },

  colorHeroText: {
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  resultMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  copyHint: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginTop: 6,
  },

  emptyResult: {
    alignItems: "center",
    marginTop: 13,
  },

  emptySwatch: {
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: 25,
    borderWidth: 1,
    height: 49,
    width: 49,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },

  emptyDescription: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },

  nearbySection: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 17,
    borderWidth: 1,
    minHeight: 103,
    padding: 10,
    ...Effects.surfaceRaised,
  },

  sectionLabel: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 7,
  },

  nearbyRow: {
    flexDirection: "row",
    gap: 5,
  },

  nearbyItem: {
    alignItems: "center",
    backgroundColor: Colors.key,
    borderColor: Colors.border,
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },

  nearbyItemSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },

  nearbyCircuit: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  nearbyCircuitSelected: {
    color: Colors.primary,
  },

  nearbyDot: {
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 5,
    borderWidth: 1,
    height: 9,
    marginTop: 3,
    width: 9,
  },

  nearbyColor: {
    color: Colors.textMuted,
    fontSize: 7,
    fontWeight: "900",
    marginTop: 3,
    maxWidth: "100%",
  },

  nearbyPhase: {
    color: Colors.textSubtle,
    fontSize: 7,
    fontWeight: "900",
    marginTop: 1,
  },

  nearbyPlaceholder: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 15,
    textAlign: "center",
  },

  keypad: {
    gap: 6,
  },

  keypadRow: {
    flexDirection: "row",
    gap: 7,
  },

  key: {
    alignItems: "center",
    backgroundColor: Colors.key,
    borderColor: Colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 47,
    ...Effects.controlRaised,
  },

  keyClear: {
    backgroundColor: Colors.errorSoft,
    borderColor: "#713932",
  },

  keyUtility: {
    backgroundColor: Colors.surface3,
  },

  keyText: {
    color: Colors.text,
    fontSize: 21,
    fontWeight: "900",
  },

  keyClearText: {
    color: "#E47669",
    fontSize: 13,
    letterSpacing: 0.2,
  },

  keyUtilityText: {
    color: "#B8C5D1",
  },

  keyPressed: {
    backgroundColor: Colors.surface3,
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
    ...Effects.pressed,
  },

  notice: {
    color: Colors.textSubtle,
    fontSize: 9,
    lineHeight: 13,
    paddingHorizontal: 4,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
    ...Effects.pressed,
  },

  modalBackdrop: {
    backgroundColor: "rgba(4, 7, 10, 0.78)",
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDismiss: {
    flex: 1,
  },

  selectionSheet: {
    alignSelf: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 1,
    maxWidth: 520,
    padding: 16,
    paddingBottom: 22,
    width: "100%",
    ...Effects.surfaceRaised,
  },

  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sheetEyebrow: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  sheetTitle: {
    color: Colors.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 2,
  },

  closeButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  closeButtonText: {
    color: Colors.textMuted,
    fontSize: 26,
    fontWeight: "500",
    lineHeight: 28,
  },

  optionList: {
    gap: 8,
  },

  option: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 62,
    padding: 11,
  },

  optionSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
  },

  optionSwatches: {
    flexDirection: "row",
  },

  optionSwatch: {
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 9,
    borderWidth: 1,
    height: 28,
    marginLeft: -5,
    width: 18,
  },

  optionCopy: {
    flex: 1,
  },

  optionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  optionDescription: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  optionCheck: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: "900",
  },

  customOptionIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderRadius: 12,
    height: 35,
    justifyContent: "center",
    width: 35,
  },

  customOptionIconText: {
    color: "#89A6C1",
    fontSize: 22,
    fontWeight: "900",
  },

  addPresetButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 11,
    minHeight: 52,
    ...Effects.primaryRaised,
  },

  addPresetButtonText: {
    color: Colors.inverseText,
    fontSize: 14,
    fontWeight: "900",
  },

  editorSafe: {
    backgroundColor: Colors.bg,
    flex: 1,
  },

  editorHeader: {
    alignItems: "center",
    alignSelf: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    maxWidth: 520,
    minHeight: 58,
    paddingHorizontal: 16,
    width: "100%",
  },

  cancelButton: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },

  editorHeaderCopy: {
    alignItems: "flex-end",
    flex: 1,
  },

  editorTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  editorContainer: {
    alignSelf: "center",
    gap: 12,
    maxWidth: 520,
    padding: 16,
    width: "100%",
  },

  editorIntro: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    ...Effects.surfaceRaised,
  },

  editorIntroTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  editorIntroText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  field: {
    gap: 5,
  },

  fieldLabel: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: 3,
  },

  fieldInput: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.65)",
    borderBottomColor: "rgba(255, 255, 255, 0.07)",
    boxShadow:
      "inset 0 2px 5px rgba(0, 0, 0, 0.34), inset 0 -1px 0 rgba(255, 255, 255, 0.035)",
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    minHeight: 50,
    paddingHorizontal: 14,
  },

  colorSectionLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginTop: 5,
  },

  colorFields: {
    gap: 10,
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 54,
    ...Effects.primaryRaised,
  },

  saveButtonDisabled: {
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    opacity: 0.55,
  },

  saveButtonText: {
    color: Colors.inverseText,
    fontSize: 15,
    fontWeight: "900",
  },
});
