import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BUILT_IN_PANEL_SCHEMES,
  getColorForPhase,
  getNearbyCircuits,
  getPhaseDisplayName,
  getPhaseForCircuit,
  type PanelColorScheme,
} from "../../utils/panelColors/phase";
import {
  createCustomPanelScheme,
  loadPanelColorPreferences,
  savePanelColorPreferences,
} from "../../utils/storage/panelColorPreferences";
import { styles } from "./styles";

type OpenSheet = "advanced" | "palette" | null;

type CustomDraft = {
  A: string;
  B: string;
  C: string;
  ground: string;
  name: string;
  neutral: string;
  voltageSystem: string;
};

const EMPTY_DRAFT: CustomDraft = {
  A: "Brown",
  B: "Purple",
  C: "Yellow",
  ground: "Green / Bare",
  name: "",
  neutral: "Gray",
  voltageSystem: "Custom",
};

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
  const [customSchemes, setCustomSchemes] = useState<PanelColorScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(
    BUILT_IN_PANEL_SCHEMES[0].id,
  );
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const [draft, setDraft] = useState<CustomDraft>(EMPTY_DRAFT);
  const [copied, setCopied] = useState(false);

  const allSchemes = useMemo(
    () => [...BUILT_IN_PANEL_SCHEMES, ...customSchemes],
    [customSchemes],
  );
  const selectedScheme =
    allSchemes.find(({ id }) => id === selectedSchemeId) ?? allSchemes[0];

  const circuit = circuitInput ? Number(circuitInput) : null;
  const phase = circuit ? getPhaseForCircuit(circuit, selectedScheme) : null;
  const phaseColor = phase ? getColorForPhase(selectedScheme, phase) : null;
  const nearby = circuit ? getNearbyCircuits(circuit, selectedScheme) : [];

  useEffect(() => {
    loadPanelColorPreferences().then((preferences) => {
      setCustomSchemes(preferences.customSchemes);
      setSelectedSchemeId(preferences.selectedSchemeId);
    });
  }, []);

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
    setDraft(EMPTY_DRAFT);
    setIsCustomEditorOpen(true);
  }

  function handleKey(key: string) {
    pulse();
    setCopied(false);

    if (key === "Clear") {
      setCircuitInput("");
      return;
    }
    if (key === "⌫") {
      setCircuitInput((value) => value.slice(0, -1));
      return;
    }

    setCircuitInput((value) => {
      if (value.length >= 4) return value;
      if (!value && key === "0") return value;
      return `${value}${key}`;
    });
  }

  async function copyResult() {
    if (!circuit || !phase || !phaseColor) return;

    await Clipboard.setStringAsync(
      `Circuit ${circuit} • ${getPhaseDisplayName(phase)} • ${phaseColor.name}`,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setCopied(true);
  }

  function saveCustomScheme() {
    if (!draft.name.trim() || !draft.A.trim() || !draft.B.trim() || !draft.C.trim()) {
      return;
    }

    const scheme = createCustomPanelScheme({
      name: draft.name,
      voltageSystem: draft.voltageSystem,
      colors: {
        A: draft.A,
        B: draft.B,
        C: draft.C,
        neutral: draft.neutral,
        ground: draft.ground,
      },
    });
    const nextCustomSchemes = [...customSchemes, scheme];

    persist(scheme.id, nextCustomSchemes);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setIsCustomEditorOpen(false);
    setDraft(EMPTY_DRAFT);
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
          accessibilityHint={circuit ? "Copies the circuit color result" : undefined}
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
                {copied ? "✓ COPIED" : "TAP RESULT TO COPY"}
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
          <Text style={styles.sectionLabel}>NEARBY</Text>
          {nearby.length > 0 ? (
            <View style={styles.nearbyRow}>
              {nearby.map((item) => {
                const isSelected = item.circuit === circuit;
                return (
                  <Pressable
                    accessibilityLabel={`Circuit ${item.circuit}, ${getPhaseDisplayName(item.phase)}, ${item.color.name}`}
                    accessibilityRole="button"
                    key={item.circuit}
                    onPress={() => {
                      pulse();
                      setCircuitInput(String(item.circuit));
                      setCopied(false);
                    }}
                    style={({ pressed }) => [
                      styles.nearbyItem,
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
            </View>
          ) : (
            <Text style={styles.nearbyPlaceholder}>Nearby circuits will line up here.</Text>
          )}
        </View>

        <View accessibilityLabel="Circuit number keypad" style={styles.keypad}>
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
        onSelect={selectScheme}
        selectedSchemeId={selectedScheme.id}
      />

      <AdvancedModal
        isOpen={openSheet === "advanced"}
        onAddCustom={openCustomEditor}
        onClose={() => setOpenSheet(null)}
        onSelect={selectScheme}
        schemes={allSchemes}
        selectedScheme={selectedScheme}
      />

      <CustomSchemeModal
        draft={draft}
        isOpen={isCustomEditorOpen}
        onChange={setDraft}
        onClose={() => setIsCustomEditorOpen(false)}
        onSave={saveCustomScheme}
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
  onSelect,
  selectedSchemeId,
}: {
  customSchemes: PanelColorScheme[];
  isOpen: boolean;
  onAddCustom: () => void;
  onClose: () => void;
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
              <Text style={styles.savedLabel}>SAVED JOB COLORS</Text>
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
  onSelect,
  schemes,
  selectedScheme,
}: {
  isOpen: boolean;
  onAddCustom: () => void;
  onClose: () => void;
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
  isOpen,
  onChange,
  onClose,
  onSave,
}: {
  draft: CustomDraft;
  isOpen: boolean;
  onChange: (draft: CustomDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const canSave = !!draft.name.trim() && !!draft.A.trim() && !!draft.B.trim() && !!draft.C.trim();

  function field<K extends keyof CustomDraft>(key: K, value: CustomDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={isOpen}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.editorSafe}>
        <View style={styles.editorHeader}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <View style={styles.editorHeaderCopy}>
            <Text style={styles.headerEyebrow}>CUSTOM</Text>
            <Text style={styles.editorTitle}>Job colors</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.editorContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editorIntro}>
            <Text style={styles.editorIntroTitle}>Save the colors once.</Text>
            <Text style={styles.editorIntroText}>Use familiar color names such as Purple, Brown, Orange, or Blue. The checker will remember this job.</Text>
          </View>

          <DraftField label="JOB / PRESET NAME" onChangeText={(value) => field("name", value)} placeholder="Plant Standard" value={draft.name} />
          <DraftField label="SYSTEM LABEL" onChangeText={(value) => field("voltageSystem", value)} placeholder="480V Plant" value={draft.voltageSystem} />

          <Text style={styles.colorSectionLabel}>CONDUCTOR COLORS</Text>
          <View style={styles.colorFields}>
            <DraftField label="PHASE A" onChangeText={(value) => field("A", value)} value={draft.A} />
            <DraftField label="PHASE B" onChangeText={(value) => field("B", value)} value={draft.B} />
            <DraftField label="PHASE C" onChangeText={(value) => field("C", value)} value={draft.C} />
            <DraftField label="NEUTRAL" onChangeText={(value) => field("neutral", value)} value={draft.neutral} />
            <DraftField label="GROUND" onChangeText={(value) => field("ground", value)} value={draft.ground} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={onSave}
            style={({ pressed }) => [styles.saveButton, !canSave && styles.saveButtonDisabled, pressed && canSave && styles.pressed]}
          >
            <Text style={styles.saveButtonText}>Save and use colors</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DraftField({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="words"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#707B87"
        selectionColor="#E0A526"
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}
