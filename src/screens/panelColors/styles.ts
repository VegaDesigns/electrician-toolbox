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

  panelChoiceRow: {
    flexDirection: "row",
    gap: 8,
  },

  paletteButton: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 12,
    ...Effects.controlRaised,
  },

  activePaletteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  activePaletteName: {
    color: Colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },

  paletteSwatches: {
    flexDirection: "row",
    paddingLeft: 4,
  },

  paletteSwatch: {
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 10,
    borderWidth: 1,
    height: 25,
    marginLeft: -4,
    width: 19,
  },

  advancedButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 11,
    ...Effects.controlRaised,
  },

  advancedIcon: {
    color: "#AFC0CF",
    fontSize: 17,
    fontWeight: "900",
  },

  advancedButtonText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
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

  nearbyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
    minHeight: 20,
  },

  sectionLabel: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  returnButton: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  returnButtonText: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  nearbyViewport: {
    overflow: "hidden",
    width: "100%",
  },

  nearbyRow: {
    flexDirection: "row",
    gap: 5,
    paddingRight: 1,
  },

  nearbyItem: {
    alignItems: "center",
    backgroundColor: Colors.key,
    borderColor: Colors.border,
    borderRadius: 11,
    borderWidth: 1,
    flexShrink: 0,
    minHeight: 65,
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

  keypadStatusRow: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 17,
  },

  keypadStatus: {
    color: Colors.textSubtle,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  keypadStatusActive: {
    color: Colors.primary,
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

  advancedSheet: {
    maxHeight: "84%",
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

  paletteOptionList: {
    gap: 9,
  },

  paletteOption: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    minHeight: 72,
    padding: 13,
    ...Effects.controlRaised,
  },

  paletteOptionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  savedLabel: {
    color: Colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 7,
    marginTop: 14,
  },

  savedHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  manageLink: {
    paddingHorizontal: 5,
    paddingVertical: 7,
  },

  manageLinkText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  differentColorsButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    marginTop: 10,
    minHeight: 58,
    padding: 11,
  },

  differentColorsIcon: {
    color: "#89A6C1",
    fontSize: 25,
    fontWeight: "900",
  },

  sheetNotice: {
    color: Colors.textSubtle,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 11,
    textAlign: "center",
  },

  detailsCard: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 17,
    borderWidth: 1,
    overflow: "hidden",
    ...Effects.recessed,
  },

  detailRow: {
    alignItems: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 43,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  detailLabel: {
    color: Colors.textSubtle,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    width: 58,
  },

  detailValue: {
    color: Colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
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

  managePresetButton: {
    alignItems: "center",
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 46,
  },

  managePresetButtonText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
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

  fieldLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 25,
  },

  fieldDoneButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 25,
    paddingHorizontal: 9,
  },

  fieldDoneText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
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

  choiceSection: {
    gap: 6,
  },

  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  choiceChip: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 43,
    paddingHorizontal: 12,
  },

  choiceChipSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },

  choiceChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  choiceChipTextSelected: {
    color: Colors.text,
  },

  choiceCheck: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  colorChoiceSection: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    overflow: "hidden",
    padding: 11,
  },

  colorChoiceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  colorChoiceValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  colorChipRow: {
    gap: 7,
    paddingRight: 2,
  },

  colorChip: {
    alignItems: "center",
    backgroundColor: Colors.key,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 39,
    paddingHorizontal: 9,
  },

  colorChipSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },

  colorChipDot: {
    borderColor: "rgba(255,255,255,0.30)",
    borderRadius: 8,
    borderWidth: 1,
    height: 15,
    width: 15,
  },

  colorChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },

  colorChipTextSelected: {
    color: Colors.text,
  },

  colorChipCheck: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  presetSummary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
    ...Effects.surfaceRaised,
  },

  presetSummaryLabel: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  presetSummaryName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  presetSummaryMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  presetSummaryColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 11,
  },

  presetSummaryColor: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  summaryDot: {
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 6,
    borderWidth: 1,
    height: 11,
    width: 11,
  },

  presetSummaryColorText: {
    color: Colors.text,
    fontSize: 9,
    fontWeight: "800",
  },

  presetSummarySupport: {
    color: Colors.textSubtle,
    fontSize: 9,
    marginTop: 9,
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

  manageContainer: {
    alignSelf: "center",
    gap: 10,
    maxWidth: 520,
    padding: 16,
    width: "100%",
  },

  manageIntro: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },

  managePresetCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 17,
    borderWidth: 1,
    gap: 11,
    padding: 13,
    ...Effects.surfaceRaised,
  },

  managePresetInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },

  manageActions: {
    flexDirection: "row",
    gap: 8,
  },

  editPresetButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },

  editPresetButtonText: {
    color: "#B7CADB",
    fontSize: 12,
    fontWeight: "900",
  },

  deletePresetButton: {
    alignItems: "center",
    backgroundColor: Colors.errorSoft,
    borderColor: "#713932",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },

  deletePresetButtonText: {
    color: "#E47669",
    fontSize: 12,
    fontWeight: "900",
  },

  confirmBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(4, 7, 10, 0.84)",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },

  confirmCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 390,
    padding: 18,
    width: "100%",
    ...Effects.surfaceRaised,
  },

  confirmEyebrow: {
    color: "#E47669",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  confirmTitle: {
    color: Colors.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  confirmText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  confirmActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 17,
  },

  confirmCancelButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },

  confirmCancelText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "900",
  },

  confirmDeleteButton: {
    alignItems: "center",
    backgroundColor: Colors.keyDanger,
    borderColor: "#D26457",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
