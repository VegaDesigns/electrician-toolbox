import { Space, Layout , FontSize, Radius, Fonts } from "../../theme/tokens";
import { defineStyles } from "../../theme";
import { StyleSheet } from "react-native";

export const useStyles = defineStyles(({ colors: Colors }) => ({
  contentStack: { gap: Space.xs },
  swipeHint: { color: Colors.textMuted, fontSize: FontSize.caption },
  placeholderTile: { flex: 1, justifyContent: "center", opacity: 0.45 },
  placeholderNumber: { color: Colors.textMuted, fontSize: FontSize.subtitle },
  placeholderDot: { backgroundColor: Colors.borderStrong, width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  editorFields: { gap: Space.md },
  resultBody: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: 26 },
  resultActions: { position: "absolute", bottom: 0, left: 8, right: 8, height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultAction: { minWidth: 60, minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 },
  resultActionText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500" },
  copyAction: { minHeight: 44, minWidth: 64, justifyContent: "center", alignItems: "center", borderRadius: Radius.control, paddingHorizontal: Space.sm },
  copyActionText: { color: Colors.textMuted, fontSize: FontSize.caption, fontWeight: "500" },
  actionDisabled: { opacity: 0.35 },
  expectedLabel: { color: Colors.textMuted, fontSize: FontSize.caption, letterSpacing: 1, marginTop: 5 },
  paletteContext: { color: Colors.textMuted, fontSize: FontSize.caption, marginTop: Space.xxs, marginBottom: 6 },
  storageNotice: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface2, borderRadius: Radius.control, padding: 10, gap: 6 },
  storageText: { flex: 1, color: Colors.textMuted, fontSize: FontSize.caption, lineHeight: 19 },
  storageError: { color: Colors.error },
  deviceNote: { color: Colors.textMuted, fontSize: FontSize.caption, lineHeight: 18, marginTop: Space.sm, marginBottom: Space.xs },
  layoutGuide: { borderColor: Colors.border, borderWidth: 1, padding: 14, borderRadius: Radius.card, gap: Space.xs, marginVertical: 14 },
  layoutRows: { gap: Space.xs },
  layoutRow: { flexDirection: "row", gap: Space.md, alignItems: "center" },
  layoutNumbers: { color: Colors.text, fontSize: FontSize.body, fontWeight: "500", minWidth: 60 },
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
    gap: Space.sm,
    maxWidth: Layout.contentWidth,
    minHeight: 58,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    width: "100%",
  },

  homeButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    width: 44,
    paddingHorizontal: Space.sm,

  },

  homeButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.section,
    fontWeight: "500",
  },

  headerCopy: {
    alignItems: "flex-start",
    flex: 1,
  },

  headerEyebrow: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 1,
  },

  headerTitle: { fontFamily: Fonts.heading,
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
    marginTop: 1,
  },

  container: {
    alignSelf: "center",
    gap: 10,
    maxWidth: Layout.contentWidth,
    paddingBottom: Space.xs,
    paddingHorizontal: Space.sm,
    paddingTop: 6,
    width: "100%",
  },

  panelChoiceRow: {
    flexDirection: "row",
    gap: Space.xs,
  },

  paletteButton: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: Space.sm,

  },

  activePaletteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Space.xs,
    marginTop: Space.xxs,
  },

  activePaletteName: {
    color: Colors.text,
    flex: 1,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  paletteSwatches: {
    flexDirection: "row",
    paddingLeft: Space.xxs,
  },

  paletteSwatch: {
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: 25,
    marginLeft: -4,
    width: 19,
  },

  advancedButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.card,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 11,

  },

  advancedIcon: {
    color: Colors.textMuted,
    fontSize: FontSize.body,
    fontWeight: "500",
  },

  advancedButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    marginTop: 2,
  },

  selectorRow: {
    flexDirection: "row",
    gap: Space.xs,
  },

  selectorButton: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 51,
    paddingHorizontal: Space.sm,

  },

  selectorCopy: {
    flex: 1,
    minWidth: 0,
  },

  selectorLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  selectorValue: {
    color: Colors.text,
    fontSize: FontSize.label,
    fontWeight: "500",
    marginTop: 2,
  },

  selectorChevron: {
    color: Colors.primary,
    fontSize: FontSize.section,
    fontWeight: "500",
    marginLeft: 5,
    marginTop: -5,
  },

  resultCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    height: 148,
    overflow: "hidden",
    paddingHorizontal: 17,
    paddingVertical: 10,

  },

  circuitLine: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: Space.xs,
    justifyContent: "center",
  },

  circuitLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 1.2,
  },

  circuitNumber: {
    color: Colors.text,
    fontSize: FontSize.heading,
    fontWeight: "600",
    letterSpacing: -0.5,
  },

  phaseLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.label,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 5,
  },

  colorHero: {
    alignItems: "center",
    borderRadius: Radius.card,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 7,
    minHeight: 40,
    paddingHorizontal: 23,
    width: "100%",

  },

  colorHeroText: {
    fontSize: FontSize.heading,
    fontWeight: "500",
    letterSpacing: 1.5,
  },

  resultMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    marginTop: Space.xs,
  },

  copyHint: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
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
    borderRadius: Radius.pill,
    borderWidth: 1,
    height: 49,
    width: 49,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
    marginTop: Space.xs,
  },

  emptyDescription: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    marginTop: 3,
  },

  nearbySection: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    height: 106,
    padding: Space.xs,

  },

  nearbyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    height: 20,
  },

  sectionLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.9,
  },

  returnButton: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingHorizontal: Space.xs,
    paddingVertical: Space.xxs,
  },

  returnButtonText: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
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
    borderRadius: Radius.control,
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
    fontSize: FontSize.label,
    fontWeight: "500",
  },

  nearbyCircuitSelected: {
    color: Colors.primary,
  },

  nearbyDot: {
    borderColor: Colors.border,
    borderRadius: 5,
    borderWidth: 1,
    height: 9,
    marginTop: 3,
    width: 9,
  },

  nearbyColor: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    marginTop: 3,
    maxWidth: "100%",
  },

  nearbyPhase: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    marginTop: 1,
  },

  nearbyPlaceholder: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    marginTop: 21,
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
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "600",
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
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 47,

  },

  keyClear: {
    backgroundColor: Colors.keyUtility,
    borderColor: Colors.border,
  },

  keyUtility: {
    backgroundColor: Colors.surface3,
  },

  keyText: {
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
  },

  keyClearText: {
    color: Colors.text,
    fontSize: FontSize.caption,
    letterSpacing: 0.2,
  },

  keyUtilityText: {
    color: Colors.textMuted,
  },

  keyEnter: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: Space.xs,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: Space.md,

  },

  keyEnterText: {
    color: Colors.inverseText,
    fontSize: FontSize.body,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  keyEnterHint: {
    color: Colors.inverseText,
    fontSize: FontSize.caption,
    fontWeight: "500",
    opacity: 0.8,
  },

  keyDisabled: {
    opacity: 0.38,
  },

  keyPressed: {
    backgroundColor: Colors.surface3,
    opacity: 0.78,
    transform: [{ scale: 0.985 }],

  },

  notice: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    lineHeight: 13,
    paddingHorizontal: Space.xxs,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],

  },

  modalBackdrop: {
    backgroundColor: Colors.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },

  modalDismiss: {
    flex: 1,
  },

  selectionSheet: {
    maxHeight: "88%",
    alignSelf: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: 1,
    maxWidth: Layout.contentWidth,
    padding: Space.md,
    paddingBottom: 22,
    width: "100%",

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
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.9,
  },

  sheetTitle: { fontFamily: Fonts.heading,
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
    marginTop: 2,
  },

  closeButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: 10,
  },

  closeButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  optionList: {
    gap: Space.xs,
  },

  paletteOptionList: {
    gap: 9,
  },

  paletteOption: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    minHeight: 72,
    padding: 13,

  },

  paletteOptionTitle: {
    color: Colors.text,
    fontSize: FontSize.body,
    fontWeight: "500",
  },

  savedLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
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
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.7,
  },

  differentColorsButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    marginTop: 10,
    minHeight: 58,
    padding: 11,
  },

  differentColorsIcon: {
    color: Colors.primary,
    fontSize: FontSize.title,
    fontWeight: "500",
  },

  sheetNotice: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    lineHeight: 13,
    marginTop: 11,
    textAlign: "center",
  },

  detailsCard: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    overflow: "hidden",

  },

  detailRow: {
    alignItems: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: Space.sm,
    minHeight: 43,
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs,
  },

  detailLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
    width: 58,
  },

  detailValue: {
    color: Colors.text,
    flex: 1,
    fontSize: FontSize.caption,
    fontWeight: "500",
    textAlign: "right",
  },

  option: {
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
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
    borderColor: Colors.border,
    borderRadius: Radius.small,
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
    fontSize: FontSize.label,
    fontWeight: "500",
  },

  optionDescription: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    marginTop: 3,
  },

  optionCheck: {
    color: Colors.primary,
    fontSize: FontSize.subtitle,
    fontWeight: "500",
  },

  customOptionIcon: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderRadius: Radius.control,
    height: 35,
    justifyContent: "center",
    width: 35,
  },

  customOptionIconText: {
    color: Colors.primary,
    fontSize: FontSize.section,
    fontWeight: "500",
  },

  addPresetButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: Radius.card,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 11,
    minHeight: 52,

  },

  addPresetButtonText: {
    color: Colors.inverseText,
    fontSize: FontSize.label,
    fontWeight: "500",
  },

  managePresetButton: {
    alignItems: "center",
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: Space.xs,
    minHeight: 46,
  },

  managePresetButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
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
    maxWidth: Layout.contentWidth,
    minHeight: 58,
    paddingHorizontal: Space.md,
    width: "100%",
  },

  cancelButton: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingHorizontal: Space.sm,
    paddingVertical: 10,
  },

  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  editorHeaderCopy: {
    alignItems: "flex-end",
    flex: 1,
  },

  editorTitle: {
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
  },

  editorContainer: {
    alignSelf: "center",
    gap: Space.sm,
    maxWidth: Layout.contentWidth,
    padding: Space.md,
    width: "100%",
  },

  editorIntro: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: 15,

  },

  editorIntroTitle: {
    color: Colors.text,
    fontSize: FontSize.subtitle,
    fontWeight: "500",
  },

  editorIntroText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
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
    borderRadius: Radius.control,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 25,
    paddingHorizontal: 9,
  },

  fieldDoneText: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.6,
  },

  fieldLabel: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
    marginLeft: 3,
  },

  fieldInput: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,

    color: Colors.text,
    fontSize: FontSize.body,
    fontWeight: "500",
    minHeight: 50,
    paddingHorizontal: 14,
  },

  colorSectionLabel: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.9,
    marginTop: 5,
  },

  colorSectionHelp: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    lineHeight: 16,
    marginTop: -6,
  },

  colorValidationError: {
    backgroundColor: Colors.errorSoft,
    borderColor: Colors.error,
    borderRadius: Radius.control,
    borderWidth: 1,
    color: Colors.error,
    fontSize: FontSize.caption,
    fontWeight: "500",
    lineHeight: 16,
    paddingHorizontal: 11,
    paddingVertical: 9,
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
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 43,
    paddingHorizontal: Space.sm,
  },

  choiceChipSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },

  choiceChipText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  choiceChipTextSelected: {
    color: Colors.text,
  },

  choiceCheck: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  colorChoiceSection: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    gap: Space.xs,
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
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  colorChipRow: {
    gap: 7,
    paddingRight: 2,
  },

  colorChip: {
    alignItems: "center",
    backgroundColor: Colors.key,
    borderColor: Colors.border,
    borderRadius: Radius.control,
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

  colorChipUnavailable: {
    opacity: 0.28,
  },

  colorChipDot: {
    borderColor: Colors.border,
    borderRadius: Radius.small,
    borderWidth: 1,
    height: 15,
    width: 15,
  },

  colorChipText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  colorChipTextSelected: {
    color: Colors.text,
  },

  colorChipTextUnavailable: {
    textDecorationLine: "line-through",
  },

  colorChipCheck: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  presetSummary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 14,

  },

  presetSummaryLabel: {
    color: Colors.primary,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  presetSummaryName: {
    color: Colors.text,
    fontSize: FontSize.subtitle,
    fontWeight: "500",
    marginTop: Space.xxs,
  },

  presetSummaryMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
    marginTop: 2,
  },

  presetSummaryColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Space.xs,
    marginTop: 11,
  },

  presetSummaryColor: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  summaryDot: {
    borderColor: Colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 11,
    width: 11,
  },

  presetSummaryColorText: {
    color: Colors.text,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  presetSummarySupport: {
    color: Colors.textSubtle,
    fontSize: FontSize.caption,
    marginTop: 9,
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: Radius.card,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: Space.xxs,
    minHeight: 54,

  },

  saveButtonDisabled: {
    backgroundColor: Colors.surface3,
    borderColor: Colors.border,
    opacity: 0.55,
  },

  saveButtonText: {
    color: Colors.inverseText,
    fontSize: FontSize.label,
    fontWeight: "500",
  },

  manageContainer: {
    alignSelf: "center",
    gap: 10,
    maxWidth: Layout.contentWidth,
    padding: Space.md,
    width: "100%",
  },

  manageIntro: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    lineHeight: 18,
    marginBottom: 2,
  },

  managePresetCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    gap: 11,
    padding: 13,

  },

  managePresetInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },

  manageActions: {
    flexDirection: "row",
    gap: Space.xs,
  },

  editPresetButton: {
    alignItems: "center",
    backgroundColor: Colors.surface3,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },

  editPresetButtonText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  deletePresetButton: {
    alignItems: "center",
    backgroundColor: Colors.errorSoft,
    borderColor: Colors.error,
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },

  deletePresetButtonText: {
    color: Colors.error,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  confirmBackdrop: {
    alignItems: "center",
    backgroundColor: Colors.overlay,
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },

  confirmCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.large,
    borderWidth: 1,
    maxWidth: 390,
    padding: 18,
    width: "100%",

  },

  confirmEyebrow: {
    color: Colors.error,
    fontSize: FontSize.caption,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  confirmTitle: {
    color: Colors.text,
    fontSize: FontSize.section,
    fontWeight: "500",
    marginTop: 5,
  },

  confirmText: {
    color: Colors.textMuted,
    fontSize: FontSize.caption,
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
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },

  confirmCancelText: {
    color: Colors.text,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },

  confirmDeleteButton: {
    alignItems: "center",
    backgroundColor: Colors.keyDanger,
    borderColor: Colors.error,
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },

  confirmDeleteText: {
    color: Colors.error,
    fontSize: FontSize.caption,
    fontWeight: "500",
  },
}));
