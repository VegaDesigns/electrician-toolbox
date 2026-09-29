import { useI18n } from "../../i18n";
import { panelColorLabel, panelSchemeLabel } from "../../i18n/electricalPresentation";
import { ScreenHeader } from "../../components/ScreenHeader";
import { returnHome } from "../../utils/navigation";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import { BackButton } from "../../components/BackButton";
import { useAppTheme } from "../../theme";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, Keyboard, Modal, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BUILT_IN_PANEL_SCHEMES,
  getColorForPhase,
  getNearbyCircuits,
  getPhaseDisplayName,
  getPhaseForCircuit,
  makeConductorColor,
  type PanelColorScheme,
} from "../../utils/panelColors/phase";
import {
  createCustomPanelScheme,
  loadPanelColorPreferences,
  savePanelColorPreferences,
} from "../../utils/storage/panelColorPreferences";
import { useStyles } from "./styles";

type OpenSheet = "advanced" | "palette" | null;
type PanelType = "single-phase" | "three-phase";

type CustomDraft = {
  ground: string;
  name: string;
  panelLabel: string;
  neutral: string;
  panelType: PanelType;
  phase1: string;
  phase2: string;
  phase3: string;
  voltageSystem: string;
};

const EMPTY_DRAFT: CustomDraft = {
  ground: "Green",
  name: "",
  panelLabel: "",
  neutral: "Gray",
  panelType: "three-phase",
  phase1: "Brown",
  phase2: "Orange",
  phase3: "Yellow",
  voltageSystem: "480Y/277V",
};

const PHASE_COLOR_OPTIONS = [
  "Black",
  "Red",
  "Blue",
  "Brown",
  "Orange",
  "Yellow",
  "Purple",
  "Pink",
];
const NEUTRAL_COLOR_OPTIONS = ["White", "Gray"];
const GROUND_COLOR_OPTIONS = ["Green", "Bare", "Green / Bare", "Green / Yellow"];
const VOLTAGE_OPTIONS: Record<PanelType, string[]> = {
  "three-phase": ["208Y/120V", "480Y/277V", "240V Δ", "480V Δ"],
  "single-phase": ["120/240V", "120/208V", "277/480V"],
};
const NEARBY_RADIUS = 25;
const NEARBY_GAP = 5;

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["Clear", "0", "⌫"],
];

function pulse() {
  Haptics.selectionAsync().catch(() => {});
}

function getPaletteCaption(scheme: PanelColorScheme) {
  if (scheme.id === "standard-120-208") return "Common commercial 120V panel";
  if (scheme.id === "standard-277-480") return "Common commercial 277V panel";
  if (scheme.id === "standard-120-240") return "Common residential panel";
  return scheme.voltageSystem;
}

// Only built-in names are translated. Job and panel names belong to the user.
function schemeName(scheme: PanelColorScheme, t: (source: string) => string) {
  return panelSchemeLabel(scheme, t);
}

export default function PanelColorsScreen() {
  const styles = useStyles();
  const { t } = useI18n();
  const { theme: { colors: Colors } } = useAppTheme();

  const { height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyHeight = Math.max(44, Math.min(68, (height - insets.top - insets.bottom - 480) / 5));
  const [circuitInput, setCircuitInput] = useState("");
  const [submittedCircuit, setSubmittedCircuit] = useState<number | null>(null);
  const [anchorCircuit, setAnchorCircuit] = useState<number | null>(null);
  const [customSchemes, setCustomSchemes] = useState<PanelColorScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(
    BUILT_IN_PANEL_SCHEMES[0].id,
  );
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PanelColorScheme | null>(null);
  const [draft, setDraft] = useState<CustomDraft>(EMPTY_DRAFT);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [storageBusy, setStorageBusy] = useState(false);
  const storageBusyRef = useRef(false);
  const [storageError, setStorageError] = useState("");
  const [storageInfo, setStorageInfo] = useState("");
  const retryActionRef = useRef<(() => void) | null>(null);
  const [deletedPreset, setDeletedPreset] = useState<PanelColorScheme | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nearbyWidth, setNearbyWidth] = useState(0);
  const nearbyScrollRef = useRef<ScrollView>(null);
  const circuitEntryActiveRef = useRef(false);

  const allSchemes = useMemo(
    () => [...BUILT_IN_PANEL_SCHEMES, ...customSchemes],
    [customSchemes],
  );
  const selectedScheme =
    allSchemes.find(({ id }) => id === selectedSchemeId) ?? allSchemes[0];

  const circuit = submittedCircuit;
  const phase = circuit ? getPhaseForCircuit(circuit, selectedScheme) : null;
  const phaseColor = phase ? getColorForPhase(selectedScheme, phase) : null;
  const nearby = anchorCircuit
    ? getNearbyCircuits(anchorCircuit, selectedScheme, NEARBY_RADIUS)
    : [];
  const isBrowsingNearby = !!circuit && !!anchorCircuit && circuit !== anchorCircuit;

  function reloadPreferences() {
    setStorageBusy(true);
    setStorageError("");
    loadPanelColorPreferences().then((preferences) => {
      setCustomSchemes(preferences.customSchemes);
      setSelectedSchemeId(preferences.selectedSchemeId);
      setPreferencesLoaded(true);
    }).catch(() => setStorageError("Saved panel setups couldn't be loaded. Retry to keep your existing presets safe."))
      .finally(() => setStorageBusy(false));
  }

  useEffect(() => {
    let active = true;
    loadPanelColorPreferences().then((preferences) => {
      if (!active) return;
      setCustomSchemes(preferences.customSchemes);
      setSelectedSchemeId(preferences.selectedSchemeId);
      setPreferencesLoaded(true);
    }).catch(() => {
      if (active) setStorageError("Saved panel setups couldn't be loaded. Retry to keep your existing presets safe.");
    });
    return () => { active = false; };
  }, []);

  function settleCircuitEntry() {
    circuitEntryActiveRef.current = false;
  }

  function keepCircuitEntryActive() {
    circuitEntryActiveRef.current = true;
  }

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  async function persist(nextSchemeId: string, nextCustomSchemes = customSchemes) {
    if (!preferencesLoaded || storageBusyRef.current) return false;
    storageBusyRef.current = true;
    setStorageBusy(true);
    setStorageError("");
    setStorageInfo("");
    try {
      await savePanelColorPreferences({ customSchemes: nextCustomSchemes, selectedSchemeId: nextSchemeId });
      setSelectedSchemeId(nextSchemeId);
      setCustomSchemes(nextCustomSchemes);
      retryActionRef.current = null;
      return true;
    } catch {
      setStorageError("Couldn't save on this device. Your previous setup is unchanged.");
      return false;
    } finally {
      storageBusyRef.current = false;
      setStorageBusy(false);
    }
  }

  async function selectScheme(scheme: PanelColorScheme) {
    pulse();
    setOpenSheet(null);
    retryActionRef.current = () => { void selectScheme(scheme); };
    if (!await persist(scheme.id)) return;
    setCopied(false);
    setCopyFailed(false);
  }

  function openCustomEditor() {
    pulse();
    setOpenSheet(null);
    setIsManagePresetsOpen(false);
    setEditingSchemeId(null);
    const single = selectedScheme.phaseOrder.includes("L1");
    setDraft({
      name: "", panelLabel: "",
      panelType: single ? "single-phase" : "three-phase",
      voltageSystem: selectedScheme.voltageSystem,
      phase1: getColorForPhase(selectedScheme, single ? "L1" : "A").name,
      phase2: getColorForPhase(selectedScheme, single ? "L2" : "B").name,
      phase3: single ? "Blue" : getColorForPhase(selectedScheme, "C").name,
      neutral: selectedScheme.colors.neutral.name,
      ground: selectedScheme.colors.ground.name,
    });
    setStorageInfo("");
    setIsCustomEditorOpen(true);
  }

  function editCustomScheme(scheme: PanelColorScheme) {
    pulse();
    const isSinglePhase = scheme.phaseOrder.includes("L1");
    setEditingSchemeId(scheme.id);
    setDraft({
      ground: scheme.colors.ground.name,
      name: scheme.name,
      panelLabel: scheme.panelLabel ?? "",
      neutral: scheme.colors.neutral.name,
      panelType: isSinglePhase ? "single-phase" : "three-phase",
      phase1: getColorForPhase(scheme, isSinglePhase ? "L1" : "A").name,
      phase2: getColorForPhase(scheme, isSinglePhase ? "L2" : "B").name,
      phase3: isSinglePhase ? "Blue" : getColorForPhase(scheme, "C").name,
      voltageSystem: scheme.voltageSystem,
    });
    setIsManagePresetsOpen(false);
    setIsCustomEditorOpen(true);
  }

  function handleKey(key: string) {
    pulse();
    setCopied(false);
    setCopyFailed(false);

    if (key === "Clear") {
      settleCircuitEntry();
      setCircuitInput("");
      setSubmittedCircuit(null);
      setAnchorCircuit(null);
      return;
    }
    if (key === "Enter") {
      submitCircuit();
      return;
    }
    if (key === "⌫") {
      setCircuitInput(circuitInput.slice(0, -1));
      setSubmittedCircuit(null);
      setAnchorCircuit(null);
      keepCircuitEntryActive();
      return;
    }

    const value = circuitEntryActiveRef.current ? circuitInput : "";
    if (value.length >= 4 || (!value && key === "0")) return;
    setCircuitInput(`${value}${key}`);
    setSubmittedCircuit(null);
    setAnchorCircuit(null);
    keepCircuitEntryActive();
  }

  function submitCircuit() {
    const nextCircuit = Number(circuitInput);
    if (!circuitInput || !Number.isInteger(nextCircuit) || nextCircuit < 1) return;
    setSubmittedCircuit(nextCircuit);
    setAnchorCircuit(nextCircuit);
    settleCircuitEntry();
    setCopied(false);
    pulse();
  }

  const scrollToAnchor = useCallback((animated: boolean) => {
    if (!anchorCircuit || !nearbyWidth) return;
    const itemWidth = (nearbyWidth - NEARBY_GAP * 4) / 5;
    const anchorIndex = anchorCircuit - Math.max(1, anchorCircuit - NEARBY_RADIUS);
    const x = Math.max(0, (anchorIndex - 2) * (itemWidth + NEARBY_GAP));
    nearbyScrollRef.current?.scrollTo({ animated, x });
  }, [anchorCircuit, nearbyWidth]);

  function returnToAnchor() {
    if (!anchorCircuit) return;
    pulse();
    settleCircuitEntry();
    setCircuitInput(String(anchorCircuit));
    setSubmittedCircuit(anchorCircuit);
    setCopied(false);
    scrollToAnchor(true);
  }

  function handleNearbyLayout(event: LayoutChangeEvent) {
    setNearbyWidth(Math.max(0, event.nativeEvent.layout.width - 18));
  }

  useEffect(() => {
    const timeout = setTimeout(() => scrollToAnchor(false), 0);
    return () => clearTimeout(timeout);
  }, [scrollToAnchor]);

  async function copyResult() {
    if (!circuit || !phase || !phaseColor) return;

    try {
      await Clipboard.setStringAsync(
        t("{{scheme}} • {{voltage}} • Circuit {{circuit}} • {{phase}} • Expected color: {{color}}", {
          scheme: `${schemeName(selectedScheme, t)}${selectedScheme.panelLabel ? ` • ${selectedScheme.panelLabel}` : ""}`,
          voltage: selectedScheme.voltageSystem, circuit, phase: t(getPhaseDisplayName(phase)), color: panelColorLabel(phaseColor.name, t),
        }),
      );
      setCopied(true);
      setCopyFailed(false);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      setCopyFailed(true);
    }
  }

  async function saveCustomScheme() {
    const scheme = createCustomPanelScheme({
      id: editingSchemeId ?? undefined,
      name: draft.name,
      panelLabel: draft.panelLabel,
      panelType: draft.panelType,
      voltageSystem: draft.voltageSystem,
      colors: {
        ground: draft.ground,
        neutral: draft.neutral,
        phase1: draft.phase1,
        phase2: draft.phase2,
        phase3: draft.phase3,
      },
    });
    const nextCustomSchemes = editingSchemeId
      ? customSchemes.map((item) => item.id === editingSchemeId ? scheme : item)
      : [...customSchemes, scheme];

    retryActionRef.current = () => { void saveCustomScheme(); };
    if (!await persist(scheme.id, nextCustomSchemes)) return;
    setStorageInfo("Preset saved on this device.");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setIsCustomEditorOpen(false);
    setEditingSchemeId(null);
  }

  async function deleteCustomScheme(scheme: PanelColorScheme) {
    const nextCustomSchemes = customSchemes.filter(({ id }) => id !== scheme.id);
    const nextSchemeId = selectedSchemeId === scheme.id
      ? BUILT_IN_PANEL_SCHEMES[0].id
      : selectedSchemeId;

    retryActionRef.current = () => { void deleteCustomScheme(scheme); };
    if (!await persist(nextSchemeId, nextCustomSchemes)) return;
    setDeletedPreset(scheme);
    setStorageInfo("Preset removed.");
    setDeleteCandidate(null);
    setIsManagePresetsOpen(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  async function undoDelete() {
    if (!deletedPreset) return;
    const restored = customSchemes.some((scheme) => scheme.id === deletedPreset.id)
      ? customSchemes : [...customSchemes, deletedPreset];
    retryActionRef.current = () => { void undoDelete(); };
    if (!await persist(selectedSchemeId, restored)) return;
    setDeletedPreset(null);
    setStorageInfo("Preset restored on this device.");
  }

  const storageStatus = (
    <StorageStatus busy={storageBusy} error={storageError} info={storageInfo}
      loading={!preferencesLoaded && !storageError}
      onRetry={() => preferencesLoaded ? retryActionRef.current?.() : reloadPreferences()}
      onUndo={deletedPreset && !deleteCandidate && !isCustomEditorOpen ? () => { void undoDelete(); } : undefined} />
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader>
        <BackButton accessibilityLabel={t("Return to toolbox home")}
          disabled={storageBusy}
          onPress={() => {
            pulse();
            returnHome();
          }} />

        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{t("Panel Colors")}</Text>
        </View>
      </ScreenHeader>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {storageStatus}
        <View pointerEvents={!preferencesLoaded || storageBusy ? "none" : "auto"} style={styles.contentStack}
          accessibilityElementsHidden={!preferencesLoaded} importantForAccessibility={!preferencesLoaded ? "no-hide-descendants" : "auto"}>
        <PanelChoiceBar
          onAdvanced={() => {
            pulse();
            setOpenSheet("advanced");
          }}
          onPalette={() => {
            pulse();
            setOpenSheet("palette");
          }}
          scheme={selectedScheme}
        />

        <View style={[styles.resultCard, fontScale > 1.2 && { height: 180 * fontScale }]}>
        <Pressable
          accessibilityHint={
            isBrowsingNearby
              ? t("Returns to circuit {{circuit}}", { circuit: anchorCircuit ?? "" })
              : undefined
          }
          accessibilityLabel={
            circuit && phase && phaseColor
              ? t("Circuit {{circuit}}, {{phase}}, {{color}}", { circuit, phase: t(getPhaseDisplayName(phase)), color: panelColorLabel(phaseColor.name, t) })
              : t("Enter a circuit number using the keypad")
          }
          accessibilityRole={isBrowsingNearby ? "button" : undefined}
          disabled={!isBrowsingNearby}
          onPress={returnToAnchor}
          style={({ pressed }) => [
            styles.resultBody,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.circuitLine}>
            <Text style={styles.circuitLabel}>{t("CIRCUIT")}</Text>
            <Text style={styles.circuitNumber}>{circuitInput || "—"}</Text>
          </View>

          {circuit && phase && phaseColor ? (
            <>
              <View
                style={[
                  styles.colorHero,
                  {
                    backgroundColor: phaseColor.hex,
                    borderColor:
                      phaseColor.name.toLowerCase() === "black"
                        ? Colors.textMuted
                        : phaseColor.hex,
                  },
                ]}
              >
                <Text style={[styles.colorHeroText, { color: phaseColor.textHex }]}>
                  {panelColorLabel(phaseColor.name, t).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.phaseLabel}>{t(getPhaseDisplayName(phase))}</Text>
            </>
          ) : circuitInput ? (
            <View style={styles.emptyResult}>
              <Text style={styles.emptyDescription}>{t("Ready when you are")}</Text>
            </View>
          ) : (
            <View style={styles.emptyResult}>
              <Text style={styles.emptyDescription}>{t("Your phase and color appear here")}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.resultActions}>
          {isBrowsingNearby ? <Pressable accessibilityRole="button" accessibilityLabel={t("Back to circuit {{circuit}}", { circuit: anchorCircuit ?? "" })}
            onPress={returnToAnchor} style={styles.resultAction}>
            <Text style={styles.copyActionText}>{t("Back to")} {anchorCircuit}</Text>
          </Pressable> : <View />}
          <Pressable accessibilityRole="button" accessibilityLabel={copyFailed ? t("Retry copying circuit result") : t("Copy circuit result")}
            disabled={!circuit} onPress={copyResult} style={[styles.copyAction, !circuit && styles.actionDisabled]}>
            <Text style={styles.copyActionText}>{copyFailed ? t("Retry copy") : copied ? t("✓ Copied") : t("Copy")}</Text>
          </Pressable>
        </View>
        </View>

        <View onLayout={handleNearbyLayout} style={[styles.nearbySection, fontScale > 1.2 && { height: 106 * fontScale }]}>
          <View style={styles.nearbyHeader}>
            <Text style={styles.sectionLabel}>{t("NEARBY")}</Text>
            <Text style={styles.swipeHint}>{nearby.length ? t("Swipe to browse ↔") : ""}</Text>
          </View>
          {nearby.length > 0 ? (
            <View style={styles.nearbyViewport}>
              <ScrollView
                contentContainerStyle={styles.nearbyRow}
                decelerationRate="fast"
                horizontal
                onContentSizeChange={() => scrollToAnchor(false)}
                onScrollBeginDrag={settleCircuitEntry}
                ref={nearbyScrollRef}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={nearbyWidth ? (nearbyWidth - NEARBY_GAP * 4) / 5 + NEARBY_GAP : undefined}
              >
                {nearby.map((item) => {
                  const isSelected = item.circuit === circuit;
                  const isAnchor = item.circuit === anchorCircuit;
                  return (
                    <Pressable
                      accessibilityLabel={t("Circuit {{circuit}}, {{phase}}, {{color}}", { circuit: item.circuit, phase: t(getPhaseDisplayName(item.phase)), color: panelColorLabel(item.color.name, t) }) + (isAnchor ? t(", original circuit") : "")}
                      accessibilityRole="button"
                      key={item.circuit}
                      onPress={() => {
                        pulse();
                        settleCircuitEntry();
                        setCircuitInput(String(item.circuit));
                        setSubmittedCircuit(item.circuit);
                        if (!anchorCircuit) setAnchorCircuit(item.circuit);
                        setCopied(false);
                      }}
                      style={({ pressed }) => [
                        styles.nearbyItem,
                        nearbyWidth > 0
                          ? { width: (nearbyWidth - NEARBY_GAP * 4) / 5 }
                          : undefined,
                        isSelected && styles.nearbyItemSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.nearbyCircuit, isSelected && styles.nearbyCircuitSelected]}>
                        {item.circuit}
                      </Text>
                      <View style={[styles.nearbyDot, { backgroundColor: item.color.hex }]} />
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.nearbyColor}>
                        {panelColorLabel(item.color.name, t).toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.nearbyRow} accessibilityLabel={t("Nearby circuits appear after Enter")}>
              {[0, 1, 2, 3, 4].map((slot) => <View key={slot} style={[styles.nearbyItem, styles.placeholderTile]}>
                <Text style={styles.placeholderNumber}>—</Text>
                <View style={styles.placeholderDot} />
              </View>)}
            </View>
          )}
        </View>

        <View accessibilityLabel={t("Circuit number keypad")} style={styles.keypad}>
          <View style={styles.keypadStatusRow}>
            <Text style={styles.keypadStatus}>
              {circuit ? t("Type to start a new circuit") : t("Type a circuit, then Enter")}
            </Text>
          </View>
          {KEYPAD_ROWS.map((row) => (
            <View key={row.join("-")} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  accessibilityLabel={key === "⌫" ? t("Backspace") : t(key)}
                  accessibilityRole="button"
                  key={key}
                  onPress={() => handleKey(key)}
                  style={({ pressed }) => [
                    styles.key,
                    { minHeight: keyHeight },
                    key === "Clear" && styles.keyClear,
                    key === "⌫" && styles.keyUtility,
                    pressed && styles.keyPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.keyText,
                      key === "Clear" && styles.keyClearText,
                      key === "⌫" && styles.keyUtilityText,
                    ]}
                  >
                    {t(key)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
          <Pressable
            accessibilityLabel={t("Enter circuit number")}
            accessibilityRole="button"
            disabled={!circuitInput || !!circuit || storageBusy}
            onPress={() => handleKey("Enter")}
            style={({ pressed }) => [
              styles.keyEnter,
              { minHeight: keyHeight },
              (!circuitInput || !!circuit || storageBusy) && styles.keyDisabled,
              pressed && styles.keyPressed,
            ]}
          >
            <Text style={styles.keyEnterText}>{t("Enter")}</Text>
          </Pressable>
        </View>

        <Text style={styles.notice}>
          {t("Match the panel schedule or job standard. This guide does not verify wiring or whether a circuit is energized.")}</Text>
        </View>
      </ScrollView>

      <PaletteModal
        customSchemes={customSchemes}
        isOpen={openSheet === "palette"}
        onAddCustom={openCustomEditor}
        onClose={() => setOpenSheet(null)}
        onManage={() => {
          setOpenSheet(null);
          setIsManagePresetsOpen(true);
        }}
        onSelect={selectScheme}
        selectedSchemeId={selectedScheme.id}
      />

      <AdvancedModal
        isOpen={openSheet === "advanced"}
        onAddCustom={openCustomEditor}
        onClose={() => setOpenSheet(null)}
        onManage={() => {
          setOpenSheet(null);
          setIsManagePresetsOpen(true);
        }}
        onSelect={selectScheme}
        schemes={allSchemes}
        selectedScheme={selectedScheme}
      />

      <CustomSchemeModal
        busy={storageBusy}
        status={storageStatus}
        draft={draft}
        isEditing={!!editingSchemeId}
        isOpen={isCustomEditorOpen}
        onChange={(next) => {
          if (storageBusyRef.current) return;
          setDraft(next);
          setStorageError("");
          retryActionRef.current = null;
        }}
        onClose={() => {
          if (storageBusyRef.current) return;
          setStorageError("");
          retryActionRef.current = null;
          setIsCustomEditorOpen(false);
          setEditingSchemeId(null);
        }}
        onSave={saveCustomScheme}
      />

      <ManagePresetsModal
        busy={storageBusy}
        status={storageStatus}
        isOpen={isManagePresetsOpen}
        onClose={() => {
          if (!storageBusyRef.current) setIsManagePresetsOpen(false);
        }}
        onDelete={(scheme) => {
          setIsManagePresetsOpen(false);
          setDeleteCandidate(scheme);
        }}
        onEdit={editCustomScheme}
        schemes={customSchemes}
      />

      {deleteCandidate && <DeletePresetModal
        busy={storageBusy}
        status={storageBusy || storageError ? storageStatus : null}
        onCancel={() => {
          if (storageBusyRef.current) return;
          setStorageError("");
          retryActionRef.current = null;
          setDeleteCandidate(null);
          setIsManagePresetsOpen(true);
        }}
        onConfirm={() => {
          if (deleteCandidate) deleteCustomScheme(deleteCandidate);
        }}
        scheme={deleteCandidate}
      />}
    </SafeAreaView>
  );
}

function StorageStatus({ busy, loading, error, info, onRetry, onUndo }: {
  busy: boolean; loading: boolean; error: string; info: string;
  onRetry: () => void; onUndo?: () => void;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  if (!busy && !loading && !error && !info && !onUndo) return null;
  return (
    <View style={styles.storageNotice}>
      <Text accessibilityLiveRegion="polite" accessibilityRole={error ? "alert" : undefined}
        style={[styles.storageText, !!error && styles.storageError]}>
        {busy ? t("Saving your setup…") : loading ? t("Loading saved setups…") : t(error || info || "Preset removed.")}
      </Text>
      {error && !busy ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.resultAction}>
        <Text style={styles.copyActionText}>{t("Retry")}</Text>
      </Pressable> : null}
      {onUndo && !error ? <Pressable accessibilityRole="button" disabled={busy} onPress={onUndo} style={styles.resultAction}>
        <Text style={styles.copyActionText}>{t("Undo")}</Text>
      </Pressable> : null}
    </View>
  );
}

function SupportedLayout({ scheme }: { scheme: PanelColorScheme }) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.layoutGuide}>
      <Text style={styles.optionTitle}>{t("Supported numbering")}</Text>
      <Text style={styles.optionDescription}>{t("Two circuits per row, starting at circuit 1.")}</Text>
      <View style={styles.layoutRows}>
        {scheme.phaseOrder.map((phase, index) => (
          <View key={phase} style={styles.layoutRow}>
            <Text style={styles.layoutNumbers}>{index * 2 + 1}     {index * 2 + 2}</Text>
            <Text style={styles.optionDescription}>{t(getPhaseDisplayName(phase))} • {panelColorLabel(getColorForPhase(scheme, phase).name, t)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.optionDescription}>{t("Rows repeat this pattern. The voltage label does not change numbering. Other layouts, tandem labels and high-leg arrangements are not verified here.")}</Text>
    </View>
  );
}

function PanelChoiceBar({
  onAdvanced,
  onPalette,
  scheme,
}: {
  onAdvanced: () => void;
  onPalette: () => void;
  scheme: PanelColorScheme;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.panelChoiceRow}>
      <Pressable
        accessibilityLabel={t("Panel colors: {{name}}", { name: schemeName(scheme, t) })}
        accessibilityRole="button"
        onPress={onPalette}
        style={({ pressed }) => [styles.paletteButton, pressed && styles.pressed]}
      >
        <View style={styles.selectorCopy}>
          <Text style={styles.selectorLabel}>{t("WHAT COLORS DO YOU SEE?")}</Text>
          <View style={styles.activePaletteRow}>
            <PhaseSwatches scheme={scheme} />
            <Text numberOfLines={1} style={styles.activePaletteName}>{schemeName(scheme, t)}</Text>
          </View>
          <Text numberOfLines={1} style={styles.paletteContext}>
            {scheme.panelLabel ? `${scheme.panelLabel} • ` : ""}{scheme.voltageSystem}
          </Text>
        </View>
        <Text style={styles.selectorChevron}>⌄</Text>
      </Pressable>

      <Pressable
        accessibilityLabel={t("Advanced panel settings")}
        accessibilityRole="button"
        onPress={onAdvanced}
        style={({ pressed }) => [styles.advancedButton, pressed && styles.pressed]}
      >
        <Text style={styles.advancedIcon}>⚙</Text>
        <Text style={styles.advancedButtonText}>{t("Advanced")}</Text>
      </Pressable>
    </View>
  );
}

function PhaseSwatches({ scheme }: { scheme: PanelColorScheme }) {
  const styles = useStyles();

  return (
    <View style={styles.paletteSwatches}>
      {scheme.phaseOrder.map((phase) => {
        const color = getColorForPhase(scheme, phase);
        return (
          <View
            key={phase}
            style={[styles.paletteSwatch, { backgroundColor: color.hex }]}
          />
        );
      })}
    </View>
  );
}

function PaletteModal({
  customSchemes,
  isOpen,
  onAddCustom,
  onClose,
  onManage,
  onSelect,
  selectedSchemeId,
}: {
  customSchemes: PanelColorScheme[];
  isOpen: boolean;
  onAddCustom: () => void;
  onClose: () => void;
  onManage: () => void;
  onSelect: (scheme: PanelColorScheme) => void;
  selectedSchemeId: string;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={isOpen}>
      <SafeAreaProvider><SafeAreaView edges={["top", "bottom"]} style={styles.modalBackdrop}>
        <Pressable accessibilityLabel={t("Close panel colors")} onPress={onClose} style={styles.modalDismiss} feedback="none" />
        <View style={styles.selectionSheet}>
          <SheetHeader eyebrow={t("QUICK SETUP")} onClose={onClose} title={t("What colors do you see?")} />
          <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.paletteOptionList}>
            {BUILT_IN_PANEL_SCHEMES.filter(({ isQuickChoice }) => isQuickChoice).map((scheme) => (
              <PaletteOption
                isSelected={scheme.id === selectedSchemeId}
                key={scheme.id}
                onPress={() => onSelect(scheme)}
                scheme={scheme}
              />
            ))}
          </View>

          {customSchemes.length > 0 && (
            <>
              <View style={styles.savedHeader}>
                <Text style={styles.savedLabel}>{t("SAVED JOB COLORS")}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onManage}
                  style={({ pressed }) => [styles.manageLink, pressed && styles.pressed]}
                >
                  <Text style={styles.manageLinkText}>{t("MANAGE")}</Text>
                </Pressable>
              </View>
              <View style={styles.optionList}>
                {customSchemes.map((scheme) => (
                  <PaletteOption
                    isSelected={scheme.id === selectedSchemeId}
                    key={scheme.id}
                    onPress={() => onSelect(scheme)}
                    scheme={scheme}
                  />
                ))}
              </View>
            </>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={onAddCustom}
            style={({ pressed }) => [styles.differentColorsButton, pressed && styles.pressed]}
          >
            <Text style={styles.differentColorsIcon}>＋</Text>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{t("Save a job preset")}</Text>
              <Text style={styles.optionDescription}>{t("Save the colors used on this job")}</Text>
            </View>
          </Pressable>
          <Text style={styles.deviceNote}>{t("Saved on this device. Not synced or backed up to an account.")}</Text>
          </ScrollView>
          <Text style={styles.sheetNotice}>{t("Confirm the choice against the panel schedule or job standard.")}</Text>
        </View>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

function PaletteOption({
  isSelected,
  onPress,
  scheme,
}: {
  isSelected: boolean;
  onPress: () => void;
  scheme: PanelColorScheme;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityLabel={`${schemeName(scheme, t)}, ${t(getPaletteCaption(scheme))}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.paletteOption,
        isSelected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
    >
      <PhaseSwatches scheme={scheme} />
      <View style={styles.optionCopy}>
        <Text style={styles.paletteOptionTitle}>{schemeName(scheme, t)}</Text>
        <Text style={styles.optionDescription}>{t(getPaletteCaption(scheme))}</Text>
      </View>
      {isSelected && <Text style={styles.optionCheck}>✓</Text>}
    </Pressable>
  );
}

function AdvancedModal({
  isOpen,
  onAddCustom,
  onClose,
  onManage,
  onSelect,
  schemes,
  selectedScheme,
}: {
  isOpen: boolean;
  onAddCustom: () => void;
  onClose: () => void;
  onManage: () => void;
  onSelect: (scheme: PanelColorScheme) => void;
  schemes: PanelColorScheme[];
  selectedScheme: PanelColorScheme;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={isOpen}>
      <SafeAreaProvider><SafeAreaView edges={["top", "bottom"]} style={styles.modalBackdrop}>
        <Pressable accessibilityLabel={t("Close advanced settings")} onPress={onClose} style={styles.modalDismiss} feedback="none" />
        <View style={[styles.selectionSheet, styles.advancedSheet]}>
          <SheetHeader eyebrow={t("ADVANCED")} onClose={onClose} title={t("Panel details")} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailsCard}>
              <DetailRow label={t("SYSTEM")} value={selectedScheme.voltageSystem} />
              <DetailRow label={t("LAYOUT")} value={t(selectedScheme.configurationLabel)} />
              <DetailRow label={t("PATTERN")} value={selectedScheme.phaseOrder.join(" → ")} />
              <DetailRow label={t("NEUTRAL")} value={panelColorLabel(selectedScheme.colors.neutral.name, t)} />
              <DetailRow label={t("GROUND")} value={panelColorLabel(selectedScheme.colors.ground.name, t)} />
            </View>
            <SupportedLayout scheme={selectedScheme} />

            <Text style={styles.savedLabel}>{t("TECHNICAL PRESETS")}</Text>
            <View style={styles.optionList}>
              {schemes.map((scheme) => (
                <Pressable
                  accessibilityRole="button"
                  key={scheme.id}
                  onPress={() => onSelect(scheme)}
                  style={({ pressed }) => [
                    styles.option,
                    scheme.id === selectedScheme.id && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <PhaseSwatches scheme={scheme} />
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{scheme.voltageSystem}</Text>
                    <Text style={styles.optionDescription}>{t(scheme.configurationLabel)}</Text>
                  </View>
                  {scheme.id === selectedScheme.id && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onAddCustom}
              style={({ pressed }) => [styles.addPresetButton, pressed && styles.pressed]}
            >
              <Text style={styles.addPresetButtonText}>{t("＋ Save a job preset")}</Text>
            </Pressable>

            {schemes.some(({ isBuiltIn }) => !isBuiltIn) && (
              <Pressable
                accessibilityRole="button"
                onPress={onManage}
                style={({ pressed }) => [styles.managePresetButton, pressed && styles.pressed]}
              >
                <Text style={styles.managePresetButtonText}>{t("Manage saved presets")}</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

function SheetHeader({
  eyebrow,
  onClose,
  title,
}: {
  eyebrow: string;
  onClose: () => void;
  title: string;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.sheetHeader}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.sheetEyebrow}>{eyebrow}</Text>
        <Text style={styles.sheetTitle}>{title}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t("Close panel settings")} onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>{t("Done")}</Text>
      </Pressable>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function CustomSchemeModal({
  busy, status,
  draft,
  isEditing,
  isOpen,
  onChange,
  onClose,
  onSave,
}: {
  busy: boolean;
  status: React.ReactNode;
  draft: CustomDraft;
  isEditing: boolean;
  isOpen: boolean;
  onChange: (draft: CustomDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  function field<K extends keyof CustomDraft>(key: K, value: CustomDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  function setPanelType(panelType: PanelType) {
    onChange({
      ...draft,
      panelType,
      voltageSystem: VOLTAGE_OPTIONS[panelType][0],
    });
  }

  const phaseLabels = draft.panelType === "single-phase"
    ? ["LEG L1", "LEG L2"]
    : ["PHASE A", "PHASE B", "PHASE C"];
  const selectedPhaseColors = draft.panelType === "single-phase"
    ? [draft.phase1, draft.phase2]
    : [draft.phase1, draft.phase2, draft.phase3];
  const normalizedPhaseColors = selectedPhaseColors.map((color) => color.trim().toLowerCase());
  const hasDuplicatePhaseColors = new Set(normalizedPhaseColors).size !== normalizedPhaseColors.length;
  const canSave = !!draft.name.trim() && !hasDuplicatePhaseColors && !busy;

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={isOpen}>
      <SafeAreaProvider style={styles.editorSafe}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.editorSafe}>
        <View style={styles.editorHeader}>
          <Pressable disabled={busy} accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
          </Pressable>
          <View style={styles.editorHeaderCopy}>
            <Text style={styles.headerEyebrow}>{isEditing ? t("EDIT PRESET") : t("NEW PRESET")}</Text>
            <Text style={styles.editorTitle}>{t("Panel setup")}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.editorContainer}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {status}
          <View pointerEvents={busy ? "none" : "auto"} style={styles.editorFields}>
          <View style={styles.editorIntro}>
            <Text style={styles.editorIntroTitle}>{t("Match the panel in front of you.")}</Text>
            <Text style={styles.editorIntroText}>{t("Choose from known conductor colors, then confirm everything against the panel schedule or job standard.")}</Text>
          </View>

          <DraftField
            label={t("JOB / PRESET NAME")}
            onChangeText={(value) => field("name", value)}
            placeholder={t("Hospital Project")}
            showDone
            value={draft.name}
          />
          <DraftField label={t("PANEL ID (OPTIONAL)")} onChangeText={(value) => field("panelLabel", value)}
            placeholder={t("Panel L2 • Second floor")} showDone value={draft.panelLabel} />

          <ChoiceSection
            label={t("PANEL TYPE")}
            onSelect={(value) => setPanelType(value as PanelType)}
            options={[
              { label: "Three-phase", value: "three-phase" },
              { label: "Single-phase", value: "single-phase" },
            ]}
            value={draft.panelType}
          />

          <ChoiceSection
            label={t("VOLTAGE SYSTEM")}
            onSelect={(value) => field("voltageSystem", value)}
            options={VOLTAGE_OPTIONS[draft.panelType].map((value) => ({ label: value, value }))}
            value={draft.voltageSystem}
          />

          <Text style={styles.colorSectionLabel}>{t("CONDUCTOR COLORS")}</Text>
          <Text style={styles.colorSectionHelp}>
            {t("Use the visible phase identifiers for this job. Each phase or leg needs a different selection.")}</Text>
          <View style={styles.colorFields}>
            <ColorChoiceRow label={phaseLabels[0]} onSelect={(value) => field("phase1", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={selectedPhaseColors.slice(1)} value={draft.phase1} />
            <ColorChoiceRow label={phaseLabels[1]} onSelect={(value) => field("phase2", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={[draft.phase1, ...(draft.panelType === "three-phase" ? [draft.phase3] : [])]} value={draft.phase2} />
            {draft.panelType === "three-phase" && (
              <ColorChoiceRow label={phaseLabels[2]} onSelect={(value) => field("phase3", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={[draft.phase1, draft.phase2]} value={draft.phase3} />
            )}
            <ColorChoiceRow label={t("NEUTRAL")} onSelect={(value) => field("neutral", value)} options={NEUTRAL_COLOR_OPTIONS} value={draft.neutral} />
            <ColorChoiceRow label={t("GROUND")} onSelect={(value) => field("ground", value)} options={GROUND_COLOR_OPTIONS} value={draft.ground} />
          </View>

          {hasDuplicatePhaseColors && (
            <Text accessibilityRole="alert" style={styles.colorValidationError}>
              {t("Choose a different identifier for each phase or leg before saving.")}</Text>
          )}

          <View style={styles.presetSummary}>
            <Text style={styles.presetSummaryLabel}>{t("PRESET SUMMARY")}</Text>
            <Text style={styles.presetSummaryName}>{draft.name.trim() || t("Unnamed preset")}</Text>
            {draft.panelLabel.trim() ? <Text style={styles.presetSummaryMeta}>{draft.panelLabel.trim()}</Text> : null}
            <Text style={styles.presetSummaryMeta}>{draft.voltageSystem} • {draft.panelType === "three-phase" ? t("Three-phase") : t("Single-phase")}</Text>
            <View style={styles.presetSummaryColors}>
              {selectedPhaseColors.map((color, index) => (
                <View key={`${color}-${index}`} style={styles.presetSummaryColor}>
                  <View style={[styles.summaryDot, { backgroundColor: makeConductorColor(color).hex }]} />
                  <Text style={styles.presetSummaryColorText}>{t(phaseLabels[index])} {panelColorLabel(color, t)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.presetSummarySupport}>{t("Neutral")} {panelColorLabel(draft.neutral, t)} {t("• Ground")} {panelColorLabel(draft.ground, t)}</Text>
            <Text style={styles.presetSummarySupport}>{t("Standard paired rows: 1/2, 3/4, 5/6. Voltage is a label, not a different numbering layout.")}</Text>
          </View>
          <Text style={styles.deviceNote}>{t("For standard paired-row panels only. Other numbering, tandem labels, and high-leg arrangements are not verified by this tool. Saved on this device only.")}</Text>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [styles.saveButton, !canSave && styles.saveButtonDisabled, pressed && canSave && styles.pressed]}
          >
            <Text style={styles.saveButtonText}>{busy ? t("Saving…") : isEditing ? t("Save changes") : t("Save and use preset")}</Text>
          </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function ChoiceSection({ label, onSelect, options, value }: {
  label: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.choiceSection}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceGrid}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={`${label}: ${t(option.label)}`}
              accessibilityRole="button"
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [styles.choiceChip, isSelected && styles.choiceChipSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.choiceChipText, isSelected && styles.choiceChipTextSelected]}>{t(option.label)}</Text>
              {isSelected && <Text style={styles.choiceCheck}>✓</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ColorChoiceRow({ label, onSelect, options, unavailableOptions = [], value }: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  unavailableOptions?: string[];
  value: string;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.colorChoiceSection}>
      <View style={styles.colorChoiceHeader}>
        <Text style={styles.fieldLabel}>{t(label)}</Text>
        <Text style={styles.colorChoiceValue}>{panelColorLabel(value, t)}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.colorChipRow} horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const color = makeConductorColor(option);
          const isSelected = option === value;
          const isUnavailable = !isSelected && unavailableOptions.includes(option);
          return (
            <Pressable
              accessibilityLabel={`${t(label)}: ${t(option)}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isUnavailable, selected: isSelected }}
              disabled={isUnavailable}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [styles.colorChip, isSelected && styles.colorChipSelected, isUnavailable && styles.colorChipUnavailable, pressed && styles.pressed]}
            >
              <View style={[styles.colorChipDot, { backgroundColor: color.hex }]} />
              <Text style={[styles.colorChipText, isSelected && styles.colorChipTextSelected, isUnavailable && styles.colorChipTextUnavailable]}>{t(option)}</Text>
              {isSelected && <Text style={styles.colorChipCheck}>✓</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ManagePresetsModal({ busy, status, isOpen, onClose, onDelete, onEdit, schemes }: {
  busy: boolean;
  status: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (scheme: PanelColorScheme) => void;
  onEdit: (scheme: PanelColorScheme) => void;
  schemes: PanelColorScheme[];
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={isOpen}>
      <SafeAreaProvider style={styles.editorSafe}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.editorSafe}>
        <View style={styles.editorHeader}>
          <Pressable disabled={busy} accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>{t("Done")}</Text>
          </Pressable>
          <View style={styles.editorHeaderCopy}>
            <Text style={styles.headerEyebrow}>{t("SAVED")}</Text>
            <Text style={styles.editorTitle}>{t("Manage presets")}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.manageContainer} showsVerticalScrollIndicator={false}>
          {status}
          <Text style={styles.manageIntro}>{t("Saved on this device only. Edit a panel setup or remove one you no longer need.")}</Text>
          {schemes.length === 0 ? <Text style={styles.manageIntro}>{t("No saved presets. Your common color options are always available.")}</Text> : null}
          {schemes.map((scheme) => (
            <View key={scheme.id} style={styles.managePresetCard}>
              <View style={styles.managePresetInfo}>
                <PhaseSwatches scheme={scheme} />
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{scheme.name}</Text>
                  {scheme.panelLabel ? <Text style={styles.optionDescription}>{scheme.panelLabel}</Text> : null}
                  <Text style={styles.optionDescription}>{scheme.voltageSystem} • {t(scheme.configurationLabel)}</Text>
                </View>
              </View>
              <View style={styles.manageActions}>
                <Pressable disabled={busy} accessibilityLabel={t("Edit {{name}}", { name: scheme.name })} accessibilityRole="button" onPress={() => onEdit(scheme)} style={({ pressed }) => [styles.editPresetButton, pressed && styles.pressed]}>
                  <Text style={styles.editPresetButtonText}>{t("Edit")}</Text>
                </Pressable>
                <Pressable disabled={busy} accessibilityLabel={t("Delete {{name}}", { name: scheme.name })} accessibilityRole="button" onPress={() => onDelete(scheme)} style={({ pressed }) => [styles.deletePresetButton, pressed && styles.pressed]}>
                  <Text style={styles.deletePresetButtonText}>{t("Delete")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function DeletePresetModal({ busy, status, onCancel, onConfirm, scheme }: {
  busy: boolean;
  status: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  scheme: PanelColorScheme | null;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={!!scheme}>
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmEyebrow}>{t("DELETE PRESET")}</Text>
          <Text style={styles.confirmTitle}>{t("Delete “{{name}}”?", { name: scheme?.name ?? "" })}</Text>
          <Text style={styles.confirmText}>{t("This removes the saved setup from this device. Undo will be available until the next deletion or until you leave Panel Colors.")}</Text>
          {status}
          <View style={styles.confirmActions}>
            <Pressable disabled={busy} accessibilityRole="button" onPress={onCancel} style={styles.confirmCancelButton}>
              <Text style={styles.confirmCancelText}>{t("Keep it")}</Text>
            </Pressable>
            <Pressable disabled={busy} accessibilityRole="button" onPress={onConfirm} style={styles.confirmDeleteButton}>
              <Text style={styles.confirmDeleteText}>{busy ? t("Removing…") : t("Delete")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DraftField({
  label,
  onChangeText,
  placeholder,
  showDone = false,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  showDone?: boolean;
  value: string;
}) {
  const styles = useStyles();
  const { t } = useI18n();
  const { theme: { colors: Colors } } = useAppTheme();

  const hasValue = !!value.trim();

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {showDone && hasValue && (
          <Pressable
            accessibilityLabel={t("Finish entering preset name")}
            accessibilityRole="button"
            onPress={() => Keyboard.dismiss()}
            style={({ pressed }) => [styles.fieldDoneButton, pressed && styles.pressed]}
          >
            <Text style={styles.fieldDoneText}>{t("✓ DONE")}</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="words"
        onChangeText={onChangeText}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        returnKeyType="done"
        selectionColor={Colors.primary}
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}
