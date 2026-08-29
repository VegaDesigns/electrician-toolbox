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
  getNearbyCircuits,
  getPhaseForCircuit,
  type PanelColorScheme,
  type Phase,
} from "../../utils/panelColors/phase";
import {
  createCustomPanelScheme,
  loadPanelColorPreferences,
  savePanelColorPreferences,
} from "../../utils/storage/panelColorPreferences";
import { styles } from "./styles";

type Selector = "scheme" | "system" | null;

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

export default function PanelColorsScreen() {
  const [circuitInput, setCircuitInput] = useState("");
  const [customSchemes, setCustomSchemes] = useState<PanelColorScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(
    BUILT_IN_PANEL_SCHEMES[0].id,
  );
  const [selector, setSelector] = useState<Selector>(null);
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
  const phase = circuit ? getPhaseForCircuit(circuit) : null;
  const phaseColor = phase ? selectedScheme.colors[phase] : null;
  const nearby =
    circuit && phase
      ? getNearbyCircuits(circuit, selectedScheme)
      : [];

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
    setSelector(null);
  }

  function chooseCustomSystem() {
    pulse();
    setSelector(null);
    if (customSchemes.length > 0) {
      persist(customSchemes[0].id);
      return;
    }
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
      `Circuit ${circuit} • Phase ${phase} • ${phaseColor.name}`,
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
        <View style={styles.selectorRow}>
          <SelectorButton
            label="VOLTAGE"
            onPress={() => setSelector("system")}
            value={selectedScheme.voltageSystem}
          />
          <SelectorButton
            label="COLOR SCHEME"
            onPress={() => setSelector("scheme")}
            value={selectedScheme.name}
          />
        </View>

        <Pressable
          accessibilityHint={circuit ? "Copies the circuit color result" : undefined}
          accessibilityLabel={
            circuit && phase && phaseColor
              ? `Circuit ${circuit}, Phase ${phase}, ${phaseColor.name}`
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
              <Text style={styles.phaseLabel}>PHASE {phase}</Text>
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
                {selectedScheme.voltageSystem} • {phase} Phase • {phaseColor.name}
              </Text>
              <Text style={styles.copyHint}>
                {copied ? "✓ COPIED" : "TAP RESULT TO COPY"}
              </Text>
            </>
          ) : (
            <View style={styles.emptyResult}>
              <View style={styles.emptySwatch} />
              <Text style={styles.emptyTitle}>Enter a circuit</Text>
              <Text style={styles.emptyDescription}>The phase and color appear instantly.</Text>
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
                    accessibilityLabel={`Circuit ${item.circuit}, Phase ${item.phase}, ${item.color.name}`}
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
                    <View
                      style={[
                        styles.nearbyDot,
                        { backgroundColor: item.color.hex },
                      ]}
                    />
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
          ⚠ Color conventions can vary by company, facility, jurisdiction, and job specification. Verify the project standard before installing conductors.
        </Text>
      </ScrollView>

      <SelectionModal
        customSchemes={customSchemes}
        onAddCustom={() => {
          setSelector(null);
          setDraft(EMPTY_DRAFT);
          setIsCustomEditorOpen(true);
        }}
        onChooseCustomSystem={chooseCustomSystem}
        onClose={() => setSelector(null)}
        onSelect={selectScheme}
        schemes={allSchemes}
        selectedSchemeId={selectedScheme.id}
        type={selector}
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

function SelectorButton({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="button"
      onPress={() => {
        pulse();
        onPress();
      }}
      style={({ pressed }) => [styles.selectorButton, pressed && styles.pressed]}
    >
      <View style={styles.selectorCopy}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.selectorValue}>{value}</Text>
      </View>
      <Text style={styles.selectorChevron}>⌄</Text>
    </Pressable>
  );
}

function SelectionModal({
  customSchemes,
  onAddCustom,
  onChooseCustomSystem,
  onClose,
  onSelect,
  schemes,
  selectedSchemeId,
  type,
}: {
  customSchemes: PanelColorScheme[];
  onAddCustom: () => void;
  onChooseCustomSystem: () => void;
  onClose: () => void;
  onSelect: (scheme: PanelColorScheme) => void;
  schemes: PanelColorScheme[];
  selectedSchemeId: string;
  type: Selector;
}) {
  if (!type) return null;

  const options =
    type === "system" ? BUILT_IN_PANEL_SCHEMES : schemes;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <View style={styles.modalBackdrop}>
        <Pressable accessibilityLabel="Close selector" onPress={onClose} style={styles.modalDismiss} />
        <View style={styles.selectionSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>{type === "system" ? "PANEL SYSTEM" : "JOB PRESET"}</Text>
              <Text style={styles.sheetTitle}>{type === "system" ? "Select voltage" : "Select color scheme"}</Text>
            </View>
            <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.optionList}>
            {options.map((scheme) => (
              <Pressable
                accessibilityRole="button"
                key={scheme.id}
                onPress={() => onSelect(scheme)}
                style={({ pressed }) => [
                  styles.option,
                  scheme.id === selectedSchemeId && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionSwatches}>
                  {(["A", "B", "C"] as Phase[]).map((phase) => (
                    <View
                      key={phase}
                      style={[styles.optionSwatch, { backgroundColor: scheme.colors[phase].hex }]}
                    />
                  ))}
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>
                    {type === "system" ? scheme.voltageSystem : scheme.name}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {type === "system"
                      ? "Standard colors"
                      : `${scheme.voltageSystem} • ${scheme.colors.A.name}, ${scheme.colors.B.name}, ${scheme.colors.C.name}`}
                  </Text>
                </View>
                {scheme.id === selectedSchemeId && <Text style={styles.optionCheck}>✓</Text>}
              </Pressable>
            ))}

            {type === "system" && (
              <Pressable
                accessibilityRole="button"
                onPress={onChooseCustomSystem}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <View style={styles.customOptionIcon}><Text style={styles.customOptionIconText}>＋</Text></View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>Custom</Text>
                  <Text style={styles.optionDescription}>
                    {customSchemes.length > 0
                      ? `${customSchemes.length} saved job ${customSchemes.length === 1 ? "preset" : "presets"}`
                      : "Create a job-specific color standard"}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {type === "scheme" && (
            <Pressable
              accessibilityRole="button"
              onPress={onAddCustom}
              style={({ pressed }) => [styles.addPresetButton, pressed && styles.pressed]}
            >
              <Text style={styles.addPresetButtonText}>＋ Save a job preset</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
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
            <Text style={styles.editorTitle}>Job preset</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.editorContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editorIntro}>
            <Text style={styles.editorIntroTitle}>Save the standard once.</Text>
            <Text style={styles.editorIntroText}>Use familiar color names such as Purple, Brown, Orange, or Blue. The checker will remember this preset.</Text>
          </View>

          <DraftField
            label="PRESET NAME"
            onChangeText={(value) => field("name", value)}
            placeholder="Plant Standard"
            value={draft.name}
          />
          <DraftField
            label="VOLTAGE / SYSTEM LABEL"
            onChangeText={(value) => field("voltageSystem", value)}
            placeholder="480V Plant"
            value={draft.voltageSystem}
          />

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
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
              pressed && canSave && styles.pressed,
            ]}
          >
            <Text style={styles.saveButtonText}>Save and use preset</Text>
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
