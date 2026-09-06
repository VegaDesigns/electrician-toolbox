import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  AMBIENT_OPTIONS,
  calculateAmpacity,
  CONDUCTOR_COUNT_OPTIONS,
  formatWireSize,
  getAmpacityRows,
  type AmbientBand,
  type ConductorCountBand,
  type ConductorMaterial,
  type LimitingReason,
  type LugRating,
  type WireSize,
} from "../../utils/wireGuide/ampacity";
import {
  loadWireGuidePreferences,
  saveWireGuidePreferences,
} from "../../utils/storage/wireGuidePreferences";
import { styles } from "./styles";

type SheetKind = "size" | "lug" | "ambient" | "conductors" | null;

const COMMON_COPPER: WireSize[] = ["14", "12", "10", "8", "6"];
const COMMON_ALUMINUM: WireSize[] = ["12", "10", "8", "6", "4"];

function pulse() {
  Haptics.selectionAsync().catch(() => {});
}

function percent(factor: number) {
  return `${Math.round(factor * 100)}%`;
}

function reasonLabel(reason: LimitingReason, effectiveLugRating: string): string {
  if (reason === "small-wire") return "Small-wire protection limit";
  if (reason === "termination") return `${effectiveLugRating}°C equipment connection limit`;
  if (reason === "ambient") return "Reduced for surrounding temperature";
  return "Reduced for grouped conductors";
}

export default function WireGuideScreen() {
  const [material, setMaterial] = useState<ConductorMaterial>("copper");
  const [size, setSize] = useState<WireSize>("12");
  const [lugRating, setLugRating] = useState<LugRating>("unknown");
  const [ambientBand, setAmbientBand] = useState<AmbientBand>("78-86");
  const [conductorCountBand, setConductorCountBand] = useState<ConductorCountBand>("1-3");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    loadWireGuidePreferences()
      .then((saved) => {
        setMaterial(saved.material);
        setSize(saved.size);
        setLugRating(saved.lugRating);
        setAmbientBand(saved.ambientBand);
        setConductorCountBand(saved.conductorCountBand);
      })
      .finally(() => setPreferencesLoaded(true));
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    saveWireGuidePreferences({
      ambientBand,
      conductorCountBand,
      lugRating,
      material,
      size,
    }).catch(() => {});
  }, [ambientBand, conductorCountBand, lugRating, material, preferencesLoaded, size]);

  const result = useMemo(
    () => calculateAmpacity(material, size, { ambientBand, conductorCountBand, lugRating }),
    [ambientBand, conductorCountBand, lugRating, material, size],
  );
  const commonSizes = material === "copper" ? COMMON_COPPER : COMMON_ALUMINUM;
  const selectedIsOther = !commonSizes.includes(size);
  const ambientLabel = AMBIENT_OPTIONS.find(({ id }) => id === ambientBand)?.label ?? "78–86°F";
  const conductorCountLabel = CONDUCTOR_COUNT_OPTIONS.find(({ id }) => id === conductorCountBand)?.label ?? "1–3";
  const conditionsChanged = ambientBand !== "78-86" || conductorCountBand !== "1-3";

  function chooseMaterial(nextMaterial: ConductorMaterial) {
    pulse();
    setMaterial(nextMaterial);
    if (!getAmpacityRows(nextMaterial).some((row) => row.size === size)) setSize("12");
  }

  function chooseSize(nextSize: WireSize) {
    pulse();
    setSize(nextSize);
    setSheet(null);
  }

  function resetConditions() {
    pulse();
    setAmbientBand("78-86");
    setConductorCountBand("1-3");
  }

  const primaryReason = result.limitingReasons[0];
  const resultNote = primaryReason
    ? reasonLabel(primaryReason, result.effectiveLugRating)
    : "No additional reduction applies";

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
          <Text style={styles.headerEyebrow}>WIRE GUIDE</Text>
          <Text style={styles.headerTitle}>Ampacity</Text>
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promptRow}>
          <View style={styles.wireGlyph}>
            <View style={styles.wireCore} />
          </View>
          <View style={styles.promptCopy}>
            <Text style={styles.promptTitle}>Check a wire</Text>
            <Text style={styles.promptHint}>Copper or aluminum THHN / THWN-2</Text>
          </View>
        </View>

        <View style={styles.segmented}>
          {(["copper", "aluminum"] as ConductorMaterial[]).map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: material === option }}
              key={option}
              onPress={() => chooseMaterial(option)}
              style={({ pressed }) => [
                styles.segment,
                material === option && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.materialDot, option === "aluminum" && styles.materialDotAluminum]} />
              <Text style={[styles.segmentText, material === option && styles.segmentTextSelected]}>
                {option === "copper" ? "Copper" : "Aluminum"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Wire size</Text>
          <Text style={styles.sectionHint}>Tap the marking on the conductor</Text>
        </View>
        <View style={styles.sizeRow}>
          {commonSizes.map((option) => (
            <Pressable
              accessibilityLabel={`Wire size ${formatWireSize(option)}`}
              accessibilityRole="button"
              accessibilityState={{ selected: size === option }}
              key={option}
              onPress={() => chooseSize(option)}
              style={({ pressed }) => [
                styles.sizeButton,
                size === option && styles.sizeButtonSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.sizeButtonText, size === option && styles.sizeButtonTextSelected]}>
                {formatWireSize(option)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityHint="Opens all supported wire sizes"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedIsOther }}
            onPress={() => {
              pulse();
              setSheet("size");
            }}
            style={({ pressed }) => [
              styles.sizeButton,
              styles.otherSizeButton,
              selectedIsOther && styles.sizeButtonSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.otherSizeText, selectedIsOther && styles.sizeButtonTextSelected]}>
              {selectedIsOther ? formatWireSize(size) : "Other"} ⌄
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityHint="Opens equipment connection rating choices"
          accessibilityRole="button"
          onPress={() => {
            pulse();
            setSheet("lug");
          }}
          style={({ pressed }) => [styles.connectionCard, pressed && styles.pressed]}
        >
          <View style={styles.connectionIcon}><Text style={styles.connectionIconText}>T°</Text></View>
          <View style={styles.connectionCopy}>
            <Text style={styles.connectionLabel}>EQUIPMENT CONNECTION</Text>
            <Text style={styles.connectionValue}>
              {lugRating === "unknown" ? "Not sure" : `${lugRating}°C marked`}
            </Text>
            <Text style={styles.connectionHint}>
              {lugRating === "unknown"
                ? `Using ${result.effectiveLugRating}°C until you check the lug`
                : "Using the temperature marked on the equipment"}
            </Text>
          </View>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>

        <View style={styles.resultCard}>
          <View style={styles.resultGlow} />
          <View style={styles.resultTopRow}>
            <View>
              <Text style={styles.resultEyebrow}>ALLOWABLE AMPACITY</Text>
              <View style={styles.ampRow}>
                <Text style={styles.ampValue}>{result.finalAmpacity}</Text>
                <Text style={styles.ampUnit}>A</Text>
              </View>
            </View>
            <View style={styles.resultWireBadge}>
              <Text style={styles.resultWireSize}>{formatWireSize(size)}</Text>
              <Text style={styles.resultWireMaterial}>{material === "copper" ? "CU" : "AL"}</Text>
            </View>
          </View>

          <View style={styles.limitStrip}>
            <View style={styles.limitDot} />
            <Text style={styles.limitText}>{resultNote}</Text>
          </View>

          <Text style={styles.resultContext}>
            {material === "copper" ? "Copper" : "Aluminum"} THHN / THWN-2  •  {ambientLabel}  •  {conductorCountLabel} current-carrying
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              pulse();
              setShowBreakdown((current) => !current);
            }}
            style={({ pressed }) => [styles.breakdownButton, pressed && styles.pressed]}
          >
            <Text style={styles.breakdownButtonText}>{showBreakdown ? "Hide calculation" : "Why this answer?"}</Text>
            <Text style={styles.chevron}>{showBreakdown ? "⌃" : "⌄"}</Text>
          </Pressable>

          {showBreakdown ? (
            <View style={styles.breakdown}>
              <BreakdownRow label="90°C conductor starting value" value={`${result.baseAmpacity} A`} />
              <BreakdownRow label={`Temperature factor (${ambientLabel})`} value={percent(result.ambientFactor)} />
              <BreakdownRow label={`Grouping factor (${conductorCountLabel} conductors)`} value={percent(result.conductorFactor)} />
              <BreakdownRow label="After heat and grouping" value={`${result.adjustedAmpacity.toFixed(1)} A`} />
              <BreakdownRow label={`${result.effectiveLugRating}°C equipment limit`} value={`${result.terminationLimit} A`} />
              {result.smallWireLimit !== null ? (
                <BreakdownRow label="Small-wire limit" value={`${result.smallWireLimit} A`} />
              ) : null}
              <View style={styles.breakdownRule} />
              <BreakdownRow emphasis label="Lowest applicable limit" value={`${result.finalAmpacity} A`} />
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            pulse();
            setShowAdvanced((current) => !current);
          }}
          style={({ pressed }) => [styles.advancedHeader, pressed && styles.pressed]}
        >
          <View style={styles.advancedHeaderCopy}>
            <Text style={styles.advancedEyebrow}>JOB CONDITIONS</Text>
            <Text style={styles.advancedTitle}>Advanced adjustments</Text>
          </View>
          {conditionsChanged ? <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ON</Text></View> : null}
          <Text style={styles.chevron}>{showAdvanced ? "⌃" : "⌄"}</Text>
        </Pressable>

        {showAdvanced ? (
          <View style={styles.advancedCard}>
            <SettingRow
              hint="Air around the conductor"
              label="Temperature"
              onPress={() => setSheet("ambient")}
              value={ambientLabel}
            />
            <View style={styles.settingRule} />
            <SettingRow
              hint="In this raceway or cable"
              label="Current-carrying wires"
              onPress={() => setSheet("conductors")}
              value={conductorCountLabel}
            />
            <Text style={styles.advancedHelp}>
              Equipment grounds do not count here. Neutrals can count in some systems—verify when unsure.
            </Text>
            {conditionsChanged ? (
              <Pressable
                accessibilityRole="button"
                onPress={resetConditions}
                style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
              >
                <Text style={styles.resetButtonText}>Reset job conditions</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.referenceNote}>
          <Text style={styles.referenceTitle}>FIELD REFERENCE</Text>
          <Text style={styles.referenceText}>
            This checks conductor ampacity—it does not automatically choose a breaker. Continuous loads, equipment rules, cable type, installation method, local requirements, and job specifications can change the final design. Verify labels and conditions before installation.
          </Text>
        </View>
      </ScrollView>

      <SelectionSheet
        kind={sheet}
        material={material}
        onClose={() => setSheet(null)}
        onSelectAmbient={(next) => {
          pulse();
          setAmbientBand(next);
          setSheet(null);
        }}
        onSelectConductors={(next) => {
          pulse();
          setConductorCountBand(next);
          setSheet(null);
        }}
        onSelectLug={(next) => {
          pulse();
          setLugRating(next);
          setSheet(null);
        }}
        onSelectSize={chooseSize}
        selectedAmbient={ambientBand}
        selectedConductors={conductorCountBand}
        selectedLug={lugRating}
        selectedSize={size}
      />
    </SafeAreaView>
  );
}

function SettingRow({ hint, label, onPress, value }: { hint: string; label: string; onPress: () => void; value: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        pulse();
        onPress();
      }}
      style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
    >
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingHint}>{hint}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function BreakdownRow({ emphasis = false, label, value }: { emphasis?: boolean; label: string; value: string }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, emphasis && styles.breakdownEmphasis]}>{label}</Text>
      <Text style={[styles.breakdownValue, emphasis && styles.breakdownValueEmphasis]}>{value}</Text>
    </View>
  );
}

type SelectionSheetProps = {
  kind: SheetKind;
  material: ConductorMaterial;
  onClose: () => void;
  onSelectAmbient: (value: AmbientBand) => void;
  onSelectConductors: (value: ConductorCountBand) => void;
  onSelectLug: (value: LugRating) => void;
  onSelectSize: (value: WireSize) => void;
  selectedAmbient: AmbientBand;
  selectedConductors: ConductorCountBand;
  selectedLug: LugRating;
  selectedSize: WireSize;
};

function SelectionSheet(props: SelectionSheetProps) {
  const titles: Record<Exclude<SheetKind, null>, { eyebrow: string; title: string }> = {
    ambient: { eyebrow: "SURROUNDING AIR", title: "Temperature" },
    conductors: { eyebrow: "RACEWAY OR CABLE", title: "Current-carrying wires" },
    lug: { eyebrow: "READ THE EQUIPMENT LABEL", title: "Connection rating" },
    size: { eyebrow: props.material === "copper" ? "COPPER" : "ALUMINUM", title: "Choose wire size" },
  };
  const heading = props.kind ? titles[props.kind] : titles.size;

  return (
    <Modal animationType="slide" onRequestClose={props.onClose} transparent visible={props.kind !== null}>
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
          <Pressable style={styles.modalScrim} onPress={props.onClose} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeadingCopy}>
                <Text style={styles.sheetEyebrow}>{heading.eyebrow}</Text>
                <Text style={styles.sheetTitle}>{heading.title}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>

            {props.kind === "size" ? (
              <ScrollView contentContainerStyle={styles.sizeGrid} showsVerticalScrollIndicator={false}>
                {getAmpacityRows(props.material).map(({ size: option }) => (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => props.onSelectSize(option)}
                    style={({ pressed }) => [
                      styles.sheetSizeOption,
                      props.selectedSize === option && styles.sheetOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.sheetSizeText, props.selectedSize === option && styles.sheetOptionTextSelected]}>
                      {formatWireSize(option)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {props.kind === "lug" ? (
              <View style={styles.optionList}>
                {([
                  { id: "unknown" as const, label: "Not sure", hint: "Uses a conservative default until you check" },
                  { id: "60" as const, label: "60°C marked", hint: "Equipment terminal or conductor limit" },
                  { id: "75" as const, label: "75°C marked", hint: "Common on listed equipment and larger conductors" },
                  { id: "90" as const, label: "90°C marked", hint: "Use only when the equipment connection is marked 90°C" },
                ]).map((option) => (
                  <SheetOption
                    hint={option.hint}
                    key={option.id}
                    label={option.label}
                    onPress={() => props.onSelectLug(option.id)}
                    selected={props.selectedLug === option.id}
                  />
                ))}
                <Text style={styles.sheetHelp}>Look for a temperature marking on the breaker, lug, or equipment instructions.</Text>
              </View>
            ) : null}

            {props.kind === "ambient" ? (
              <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false}>
                {AMBIENT_OPTIONS.map((option) => (
                  <SheetOption
                    hint={option.factor90 === 1 ? "Normal reference range" : `${percent(option.factor90)} adjustment factor`}
                    key={option.id}
                    label={option.label}
                    onPress={() => props.onSelectAmbient(option.id)}
                    selected={props.selectedAmbient === option.id}
                  />
                ))}
              </ScrollView>
            ) : null}

            {props.kind === "conductors" ? (
              <View style={styles.optionList}>
                {CONDUCTOR_COUNT_OPTIONS.map((option) => (
                  <SheetOption
                    hint={option.factor === 1 ? "No grouping reduction" : `${percent(option.factor)} adjustment factor`}
                    key={option.id}
                    label={`${option.label} conductors`}
                    onPress={() => props.onSelectConductors(option.id)}
                    selected={props.selectedConductors === option.id}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function SheetOption({ hint, label, onPress, selected }: { hint: string; label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.sheetOption, selected && styles.sheetOptionSelected, pressed && styles.pressed]}
    >
      <View style={styles.sheetOptionCopy}>
        <Text style={[styles.sheetOptionTitle, selected && styles.sheetOptionTextSelected]}>{label}</Text>
        <Text style={styles.sheetOptionHint}>{hint}</Text>
      </View>
      {selected ? <Text style={styles.sheetCheck}>✓</Text> : <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}
