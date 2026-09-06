import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
import { styles } from "./styles";

type OpenSheet = "advanced" | "palette" | null;
type PanelType = "single-phase" | "three-phase";

type CustomDraft = {
  ground: string;
  name: string;
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
const GROUND_COLOR_OPTIONS = ["Green", "Bare", "Green / Yellow"];
const VOLTAGE_OPTIONS: Record<PanelType, string[]> = {
  "three-phase": ["208Y/120V", "480Y/277V", "240V Δ", "480V Δ"],
  "single-phase": ["120/240V", "120/208V", "277/480V"],
};
const NEARBY_RADIUS = 25;
const NEARBY_GAP = 5;
const CIRCUIT_ENTRY_SETTLE_MS = 2000;

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

export default function PanelColorsScreen() {
  const [circuitInput, setCircuitInput] = useState("");
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
  const [isCircuitEntryActive, setIsCircuitEntryActive] = useState(false);
  const [nearbyWidth, setNearbyWidth] = useState(0);
  const nearbyScrollRef = useRef<ScrollView>(null);
  const circuitEntryActiveRef = useRef(false);
  const circuitEntryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allSchemes = useMemo(
    () => [...BUILT_IN_PANEL_SCHEMES, ...customSchemes],
    [customSchemes],
  );
  const selectedScheme =
    allSchemes.find(({ id }) => id === selectedSchemeId) ?? allSchemes[0];

  const circuit = circuitInput ? Number(circuitInput) : null;
  const phase = circuit ? getPhaseForCircuit(circuit, selectedScheme) : null;
  const phaseColor = phase ? getColorForPhase(selectedScheme, phase) : null;
  const nearby = anchorCircuit
    ? getNearbyCircuits(anchorCircuit, selectedScheme, NEARBY_RADIUS)
    : [];
  const isBrowsingNearby = !!circuit && !!anchorCircuit && circuit !== anchorCircuit;

  useEffect(() => {
    loadPanelColorPreferences().then((preferences) => {
      setCustomSchemes(preferences.customSchemes);
      setSelectedSchemeId(preferences.selectedSchemeId);
    });
  }, []);

  function clearCircuitEntryTimer() {
    if (circuitEntryTimerRef.current) {
      clearTimeout(circuitEntryTimerRef.current);
      circuitEntryTimerRef.current = null;
    }
  }

  function settleCircuitEntry() {
    clearCircuitEntryTimer();
    circuitEntryActiveRef.current = false;
    setIsCircuitEntryActive(false);
  }

  function keepCircuitEntryActive() {
    clearCircuitEntryTimer();
    circuitEntryActiveRef.current = true;
    setIsCircuitEntryActive(true);
    circuitEntryTimerRef.current = setTimeout(() => {
      circuitEntryActiveRef.current = false;
      setIsCircuitEntryActive(false);
      circuitEntryTimerRef.current = null;
    }, CIRCUIT_ENTRY_SETTLE_MS);
  }

  useEffect(() => () => clearCircuitEntryTimer(), []);

  function persist(nextSchemeId: string, nextCustomSchemes = customSchemes) {
    setSelectedSchemeId(nextSchemeId);
    setCustomSchemes(nextCustomSchemes);
    savePanelColorPreferences({
      customSchemes: nextCustomSchemes,
      selectedSchemeId: nextSchemeId,
    }).catch(() => {});
  }

  function selectScheme(scheme: PanelColorScheme) {
    pulse();
    persist(scheme.id);
    setOpenSheet(null);
    setCopied(false);
  }

  function openCustomEditor() {
    pulse();
    setOpenSheet(null);
    setIsManagePresetsOpen(false);
    setEditingSchemeId(null);
    setDraft(EMPTY_DRAFT);
    setIsCustomEditorOpen(true);
  }

  function editCustomScheme(scheme: PanelColorScheme) {
    pulse();
    const isSinglePhase = scheme.phaseOrder.includes("L1");
    setEditingSchemeId(scheme.id);
    setDraft({
      ground: scheme.colors.ground.name,
      name: scheme.name,
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

    if (key === "Clear") {
      settleCircuitEntry();
      setCircuitInput("");
      setAnchorCircuit(null);
      return;
    }
    if (key === "⌫") {
      setCircuitInput((value) => {
        const nextValue = value.slice(0, -1);
        setAnchorCircuit(nextValue ? Number(nextValue) : null);
        if (nextValue) keepCircuitEntryActive();
        else settleCircuitEntry();
        return nextValue;
      });
      return;
    }

    setCircuitInput((value) => {
      const shouldAppend = circuitEntryActiveRef.current;
      if (shouldAppend && value.length >= 4) return value;
      if (!shouldAppend && key === "0") return value;
      const nextValue = shouldAppend ? `${value}${key}` : key;
      setAnchorCircuit(Number(nextValue));
      keepCircuitEntryActive();
      return nextValue;
    });
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
    setCopied(false);
    scrollToAnchor(true);
  }

  function handleNearbyLayout(event: LayoutChangeEvent) {
    setNearbyWidth(event.nativeEvent.layout.width);
  }

  useEffect(() => {
    const timeout = setTimeout(() => scrollToAnchor(false), 0);
    return () => clearTimeout(timeout);
  }, [scrollToAnchor]);

  async function copyResult() {
    if (!circuit || !phase || !phaseColor) return;

    if (isBrowsingNearby) {
      returnToAnchor();
      return;
    }

    await Clipboard.setStringAsync(
      `Circuit ${circuit} • ${getPhaseDisplayName(phase)} • ${phaseColor.name}`,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setCopied(true);
  }

  function saveCustomScheme() {
    const scheme = createCustomPanelScheme({
      id: editingSchemeId ?? undefined,
      name: draft.name,
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

    persist(scheme.id, nextCustomSchemes);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setIsCustomEditorOpen(false);
    setEditingSchemeId(null);
    setDraft(EMPTY_DRAFT);
  }

  function deleteCustomScheme(scheme: PanelColorScheme) {
    const nextCustomSchemes = customSchemes.filter(({ id }) => id !== scheme.id);
    const nextSchemeId = selectedSchemeId === scheme.id
      ? BUILT_IN_PANEL_SCHEMES[0].id
      : selectedSchemeId;

    persist(nextSchemeId, nextCustomSchemes);
    setDeleteCandidate(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to toolbox home"
          accessibilityRole="button"
          onPress={() => {
            pulse();
            router.replace("/");
          }}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        >
          <Text style={styles.homeButtonText}>← Home</Text>
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>PANELS</Text>
          <Text style={styles.headerTitle}>Circuit Colors</Text>
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        <Pressable
          accessibilityHint={
            isBrowsingNearby
              ? `Returns to circuit ${anchorCircuit}`
              : circuit
                ? "Copies the circuit color result"
                : undefined
          }
          accessibilityLabel={
            circuit && phase && phaseColor
              ? `Circuit ${circuit}, ${getPhaseDisplayName(phase)}, ${phaseColor.name}`
              : "Enter a circuit number using the keypad"
          }
          accessibilityRole={circuit ? "button" : undefined}
          disabled={!circuit}
          onPress={copyResult}
          style={({ pressed }) => [
            styles.resultCard,
            phaseColor && { borderColor: phaseColor.hex },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.circuitLine}>
            <Text style={styles.circuitLabel}>CIRCUIT</Text>
            <Text style={styles.circuitNumber}>{circuitInput || "—"}</Text>
          </View>

          {circuit && phase && phaseColor ? (
            <>
              <Text style={styles.phaseLabel}>
                {getPhaseDisplayName(phase).toUpperCase()}
              </Text>
              <View
                style={[
                  styles.colorHero,
                  {
                    backgroundColor: phaseColor.hex,
                    borderColor:
                      phaseColor.name.toLowerCase() === "black"
                        ? "#6B747E"
                        : phaseColor.hex,
                  },
                ]}
              >
                <Text style={[styles.colorHeroText, { color: phaseColor.textHex }]}>
                  {phaseColor.name.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.resultMeta}>
                Use the {phaseColor.name.toLowerCase()} conductor • {getPhaseDisplayName(phase)}
              </Text>
              <Text style={styles.copyHint}>
                {isBrowsingNearby
                  ? `↩ TAP TO RETURN TO CIRCUIT ${anchorCircuit}`
                  : copied
                    ? "✓ COPIED"
                    : "TAP RESULT TO COPY"}
              </Text>
            </>
          ) : (
            <View style={styles.emptyResult}>
              <View style={styles.emptySwatch} />
              <Text style={styles.emptyTitle}>Enter a circuit</Text>
              <Text style={styles.emptyDescription}>The wire color appears instantly.</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.nearbySection}>
          <View style={styles.nearbyHeader}>
            <Text style={styles.sectionLabel}>NEARBY</Text>
            {isBrowsingNearby && (
              <Pressable
                accessibilityLabel={`Back to circuit ${anchorCircuit}`}
                accessibilityRole="button"
                onPress={returnToAnchor}
                style={({ pressed }) => [styles.returnButton, pressed && styles.pressed]}
              >
                <Text style={styles.returnButtonText}>↩ BACK TO {anchorCircuit}</Text>
              </Pressable>
            )}
          </View>
          {nearby.length > 0 ? (
            <View onLayout={handleNearbyLayout} style={styles.nearbyViewport}>
              <ScrollView
                contentContainerStyle={styles.nearbyRow}
                decelerationRate="fast"
                horizontal
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
                      accessibilityLabel={`Circuit ${item.circuit}, ${getPhaseDisplayName(item.phase)}, ${item.color.name}${isAnchor ? ", original circuit" : ""}`}
                      accessibilityRole="button"
                      key={item.circuit}
                      onPress={() => {
                        pulse();
                        settleCircuitEntry();
                        setCircuitInput(String(item.circuit));
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
                      <Text numberOfLines={1} style={styles.nearbyColor}>
                        {item.color.name.toUpperCase()}
                      </Text>
                      <Text style={styles.nearbyPhase}>{item.phase}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.nearbyPlaceholder}>Nearby circuits will line up here.</Text>
          )}
        </View>

        <View accessibilityLabel="Circuit number keypad" style={styles.keypad}>
          <View style={styles.keypadStatusRow}>
            <Text style={[styles.keypadStatus, isCircuitEntryActive && styles.keypadStatusActive]}>
              {isCircuitEntryActive
                ? "ENTERING CIRCUIT…"
                : circuit
                  ? "TYPE TO START A NEW CIRCUIT"
                  : "ENTER A CIRCUIT NUMBER"}
            </Text>
          </View>
          {KEYPAD_ROWS.map((row) => (
            <View key={row.join("-")} style={styles.keypadRow}>
              {row.map((key) => (
                <Pressable
                  accessibilityLabel={key === "⌫" ? "Backspace" : key}
                  accessibilityRole="button"
                  key={key}
                  onPress={() => handleKey(key)}
                  style={({ pressed }) => [
                    styles.key,
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
                    {key}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.notice}>
          ⚠ Match these colors to the panel schedule or job standard before use.
        </Text>
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
        draft={draft}
        isEditing={!!editingSchemeId}
        isOpen={isCustomEditorOpen}
        onChange={setDraft}
        onClose={() => {
          setIsCustomEditorOpen(false);
          setEditingSchemeId(null);
        }}
        onSave={saveCustomScheme}
      />

      <ManagePresetsModal
        isOpen={isManagePresetsOpen}
        onClose={() => setIsManagePresetsOpen(false)}
        onDelete={(scheme) => {
          setIsManagePresetsOpen(false);
          setDeleteCandidate(scheme);
        }}
        onEdit={editCustomScheme}
        schemes={customSchemes}
      />

      <DeletePresetModal
        onCancel={() => {
          setDeleteCandidate(null);
          setIsManagePresetsOpen(true);
        }}
        onConfirm={() => {
          if (deleteCandidate) deleteCustomScheme(deleteCandidate);
          setIsManagePresetsOpen(true);
        }}
        scheme={deleteCandidate}
      />
    </SafeAreaView>
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
  return (
    <View style={styles.panelChoiceRow}>
      <Pressable
        accessibilityLabel={`Panel colors: ${scheme.name}`}
        accessibilityRole="button"
        onPress={onPalette}
        style={({ pressed }) => [styles.paletteButton, pressed && styles.pressed]}
      >
        <View style={styles.selectorCopy}>
          <Text style={styles.selectorLabel}>WHAT COLORS DO YOU SEE?</Text>
          <View style={styles.activePaletteRow}>
            <PhaseSwatches scheme={scheme} />
            <Text numberOfLines={1} style={styles.activePaletteName}>{scheme.name}</Text>
          </View>
        </View>
        <Text style={styles.selectorChevron}>⌄</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Advanced panel settings"
        accessibilityRole="button"
        onPress={onAdvanced}
        style={({ pressed }) => [styles.advancedButton, pressed && styles.pressed]}
      >
        <Text style={styles.advancedIcon}>⚙</Text>
        <Text style={styles.advancedButtonText}>Advanced</Text>
      </Pressable>
    </View>
  );
}

function PhaseSwatches({ scheme }: { scheme: PanelColorScheme }) {
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
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={isOpen}>
      <View style={styles.modalBackdrop}>
        <Pressable accessibilityLabel="Close panel colors" onPress={onClose} style={styles.modalDismiss} />
        <View style={styles.selectionSheet}>
          <SheetHeader eyebrow="QUICK SETUP" onClose={onClose} title="What colors do you see?" />

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
                <Text style={styles.savedLabel}>SAVED JOB COLORS</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onManage}
                  style={({ pressed }) => [styles.manageLink, pressed && styles.pressed]}
                >
                  <Text style={styles.manageLinkText}>MANAGE</Text>
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
              <Text style={styles.optionTitle}>Different colors</Text>
              <Text style={styles.optionDescription}>Save the colors used on this job</Text>
            </View>
          </Pressable>

          <Text style={styles.sheetNotice}>Confirm the choice against the panel schedule or job standard.</Text>
        </View>
      </View>
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
  return (
    <Pressable
      accessibilityLabel={`${scheme.name}, ${getPaletteCaption(scheme)}`}
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
        <Text style={styles.paletteOptionTitle}>{scheme.name}</Text>
        <Text style={styles.optionDescription}>{getPaletteCaption(scheme)}</Text>
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
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={isOpen}>
      <View style={styles.modalBackdrop}>
        <Pressable accessibilityLabel="Close advanced settings" onPress={onClose} style={styles.modalDismiss} />
        <View style={[styles.selectionSheet, styles.advancedSheet]}>
          <SheetHeader eyebrow="ADVANCED" onClose={onClose} title="Panel details" />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailsCard}>
              <DetailRow label="SYSTEM" value={selectedScheme.voltageSystem} />
              <DetailRow label="LAYOUT" value={selectedScheme.configurationLabel} />
              <DetailRow label="PATTERN" value={selectedScheme.phaseOrder.join(" → ")} />
              <DetailRow label="NEUTRAL" value={selectedScheme.colors.neutral.name} />
              <DetailRow label="GROUND" value={selectedScheme.colors.ground.name} />
            </View>

            <Text style={styles.savedLabel}>TECHNICAL PRESETS</Text>
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
                    <Text style={styles.optionDescription}>{scheme.configurationLabel}</Text>
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
              <Text style={styles.addPresetButtonText}>＋ Save a job preset</Text>
            </Pressable>

            {schemes.some(({ isBuiltIn }) => !isBuiltIn) && (
              <Pressable
                accessibilityRole="button"
                onPress={onManage}
                style={({ pressed }) => [styles.managePresetButton, pressed && styles.pressed]}
              >
                <Text style={styles.managePresetButtonText}>Manage saved presets</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
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
  return (
    <View style={styles.sheetHeader}>
      <View>
        <Text style={styles.sheetEyebrow}>{eyebrow}</Text>
        <Text style={styles.sheetTitle}>{title}</Text>
      </View>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </Pressable>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function CustomSchemeModal({
  draft,
  isEditing,
  isOpen,
  onChange,
  onClose,
  onSave,
}: {
  draft: CustomDraft;
  isEditing: boolean;
  isOpen: boolean;
  onChange: (draft: CustomDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
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
  const canSave = !!draft.name.trim() && !hasDuplicatePhaseColors;

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={isOpen}>
      <SafeAreaProvider style={styles.editorSafe}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.editorSafe}>
        <View style={styles.editorHeader}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <View style={styles.editorHeaderCopy}>
            <Text style={styles.headerEyebrow}>{isEditing ? "EDIT PRESET" : "NEW PRESET"}</Text>
            <Text style={styles.editorTitle}>Panel setup</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.editorContainer}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editorIntro}>
            <Text style={styles.editorIntroTitle}>Match the panel in front of you.</Text>
            <Text style={styles.editorIntroText}>Choose from known conductor colors, then confirm everything against the panel schedule or job standard.</Text>
          </View>

          <DraftField
            label="JOB / PRESET NAME"
            onChangeText={(value) => field("name", value)}
            placeholder="Hospital Project"
            showDone
            value={draft.name}
          />

          <ChoiceSection
            label="PANEL TYPE"
            onSelect={(value) => setPanelType(value as PanelType)}
            options={[
              { label: "Three-phase", value: "three-phase" },
              { label: "Single-phase", value: "single-phase" },
            ]}
            value={draft.panelType}
          />

          <ChoiceSection
            label="VOLTAGE SYSTEM"
            onSelect={(value) => field("voltageSystem", value)}
            options={VOLTAGE_OPTIONS[draft.panelType].map((value) => ({ label: value, value }))}
            value={draft.voltageSystem}
          />

          <Text style={styles.colorSectionLabel}>CONDUCTOR COLORS</Text>
          <Text style={styles.colorSectionHelp}>
            Use the visible phase identifiers for this job. Each phase or leg needs a different selection.
          </Text>
          <View style={styles.colorFields}>
            <ColorChoiceRow label={phaseLabels[0]} onSelect={(value) => field("phase1", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={selectedPhaseColors.slice(1)} value={draft.phase1} />
            <ColorChoiceRow label={phaseLabels[1]} onSelect={(value) => field("phase2", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={[draft.phase1, ...(draft.panelType === "three-phase" ? [draft.phase3] : [])]} value={draft.phase2} />
            {draft.panelType === "three-phase" && (
              <ColorChoiceRow label={phaseLabels[2]} onSelect={(value) => field("phase3", value)} options={PHASE_COLOR_OPTIONS} unavailableOptions={[draft.phase1, draft.phase2]} value={draft.phase3} />
            )}
            <ColorChoiceRow label="NEUTRAL" onSelect={(value) => field("neutral", value)} options={NEUTRAL_COLOR_OPTIONS} value={draft.neutral} />
            <ColorChoiceRow label="GROUND" onSelect={(value) => field("ground", value)} options={GROUND_COLOR_OPTIONS} value={draft.ground} />
          </View>

          {hasDuplicatePhaseColors && (
            <Text accessibilityRole="alert" style={styles.colorValidationError}>
              Choose a different identifier for each phase or leg before saving.
            </Text>
          )}

          <View style={styles.presetSummary}>
            <Text style={styles.presetSummaryLabel}>PRESET SUMMARY</Text>
            <Text style={styles.presetSummaryName}>{draft.name.trim() || "Unnamed preset"}</Text>
            <Text style={styles.presetSummaryMeta}>{draft.voltageSystem} • {draft.panelType === "three-phase" ? "Three-phase" : "Single-phase"}</Text>
            <View style={styles.presetSummaryColors}>
              {selectedPhaseColors.map((color, index) => (
                <View key={`${color}-${index}`} style={styles.presetSummaryColor}>
                  <View style={[styles.summaryDot, { backgroundColor: makeConductorColor(color).hex }]} />
                  <Text style={styles.presetSummaryColorText}>{phaseLabels[index]} {color}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.presetSummarySupport}>Neutral {draft.neutral} • Ground {draft.ground}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [styles.saveButton, !canSave && styles.saveButtonDisabled, pressed && canSave && styles.pressed]}
          >
            <Text style={styles.saveButtonText}>{isEditing ? "Save changes" : "Save and use preset"}</Text>
          </Pressable>
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
  return (
    <View style={styles.choiceSection}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceGrid}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={`${label}: ${option.label}`}
              accessibilityRole="button"
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [styles.choiceChip, isSelected && styles.choiceChipSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.choiceChipText, isSelected && styles.choiceChipTextSelected]}>{option.label}</Text>
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
  return (
    <View style={styles.colorChoiceSection}>
      <View style={styles.colorChoiceHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.colorChoiceValue}>{value}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.colorChipRow} horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const color = makeConductorColor(option);
          const isSelected = option === value;
          const isUnavailable = !isSelected && unavailableOptions.includes(option);
          return (
            <Pressable
              accessibilityLabel={`${label}: ${option}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isUnavailable, selected: isSelected }}
              disabled={isUnavailable}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [styles.colorChip, isSelected && styles.colorChipSelected, isUnavailable && styles.colorChipUnavailable, pressed && styles.pressed]}
            >
              <View style={[styles.colorChipDot, { backgroundColor: color.hex }]} />
              <Text style={[styles.colorChipText, isSelected && styles.colorChipTextSelected, isUnavailable && styles.colorChipTextUnavailable]}>{option}</Text>
              {isSelected && <Text style={styles.colorChipCheck}>✓</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ManagePresetsModal({ isOpen, onClose, onDelete, onEdit, schemes }: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (scheme: PanelColorScheme) => void;
  onEdit: (scheme: PanelColorScheme) => void;
  schemes: PanelColorScheme[];
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen" visible={isOpen}>
      <SafeAreaProvider style={styles.editorSafe}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.editorSafe}>
        <View style={styles.editorHeader}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Done</Text>
          </Pressable>
          <View style={styles.editorHeaderCopy}>
            <Text style={styles.headerEyebrow}>SAVED</Text>
            <Text style={styles.editorTitle}>Manage presets</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.manageContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.manageIntro}>Edit a job setup or remove one you no longer need.</Text>
          {schemes.map((scheme) => (
            <View key={scheme.id} style={styles.managePresetCard}>
              <View style={styles.managePresetInfo}>
                <PhaseSwatches scheme={scheme} />
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{scheme.name}</Text>
                  <Text style={styles.optionDescription}>{scheme.voltageSystem} • {scheme.configurationLabel}</Text>
                </View>
              </View>
              <View style={styles.manageActions}>
                <Pressable accessibilityLabel={`Edit ${scheme.name}`} accessibilityRole="button" onPress={() => onEdit(scheme)} style={({ pressed }) => [styles.editPresetButton, pressed && styles.pressed]}>
                  <Text style={styles.editPresetButtonText}>Edit</Text>
                </Pressable>
                <Pressable accessibilityLabel={`Delete ${scheme.name}`} accessibilityRole="button" onPress={() => onDelete(scheme)} style={({ pressed }) => [styles.deletePresetButton, pressed && styles.pressed]}>
                  <Text style={styles.deletePresetButtonText}>Delete</Text>
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

function DeletePresetModal({ onCancel, onConfirm, scheme }: {
  onCancel: () => void;
  onConfirm: () => void;
  scheme: PanelColorScheme | null;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={!!scheme}>
      <View style={styles.confirmBackdrop}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmEyebrow}>DELETE PRESET</Text>
          <Text style={styles.confirmTitle}>Delete “{scheme?.name}”?</Text>
          <Text style={styles.confirmText}>This removes the saved panel setup from this device. This cannot be undone.</Text>
          <View style={styles.confirmActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.confirmCancelButton}>
              <Text style={styles.confirmCancelText}>Keep it</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.confirmDeleteButton}>
              <Text style={styles.confirmDeleteText}>Delete</Text>
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
  const hasValue = !!value.trim();

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {showDone && hasValue && (
          <Pressable
            accessibilityLabel="Finish entering preset name"
            accessibilityRole="button"
            onPress={() => Keyboard.dismiss()}
            style={({ pressed }) => [styles.fieldDoneButton, pressed && styles.pressed]}
          >
            <Text style={styles.fieldDoneText}>✓ DONE</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="words"
        onChangeText={onChangeText}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder={placeholder}
        placeholderTextColor="#707B87"
        returnKeyType="done"
        selectionColor="#E0A526"
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}
