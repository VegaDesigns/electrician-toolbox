import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { FillModeSwitch } from "../../components/fillGuide/FillModeSwitch";
import {
  calculateConduitFill,
  CONDUIT_LABELS,
  CONDUIT_SIZES,
  type ConduitSize,
  type ConduitType,
  findMinimumConduitSize,
  getMaxAdditionalConductors,
  WIRE_SIZES,
  type WireSize,
} from "../../utils/conduitFill/conduitFill";
import { styles } from "./styles";

type WireRow = {
  id: number;
  quantity: number;
  size: WireSize;
};

const QUICK_CONDUITS: ConduitType[] = ["emt", "pvc40", "rmc"];
const OTHER_CONDUITS: ConduitType[] = ["imc", "pvc80"];
const QUICK_SIZES: ConduitSize[] = ["1/2", "3/4", "1"];

function pulse() {
  Haptics.selectionAsync().catch(() => {});
}

function displayWireSize(size: WireSize) {
  return Number(size) >= 250 ? `${size} kcmil` : `#${size}`;
}

export default function ConduitFillScreen() {
  const [conduitType, setConduitType] = useState<ConduitType>("emt");
  const [conduitSize, setConduitSize] = useState<ConduitSize>("3/4");
  const [showOtherConduits, setShowOtherConduits] = useState(false);
  const [showOtherSizes, setShowOtherSizes] = useState(false);
  const [sizePickerRowId, setSizePickerRowId] = useState<number | null>(null);
  const [nextRowId, setNextRowId] = useState(2);
  const [wires, setWires] = useState<WireRow[]>([
    { id: 1, quantity: 3, size: "12" },
  ]);

  const entries = wires.map(({ quantity, size }) => ({ quantity, size }));
  const result = useMemo(
    () => calculateConduitFill(conduitType, conduitSize, entries),
    // The values are primitive even though the mapped array is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conduitSize, conduitType, wires],
  );
  const minimumSize = useMemo(
    () => findMinimumConduitSize(conduitType, entries),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conduitType, wires],
  );
  const lastWire = wires[wires.length - 1];
  const maxAdditional = lastWire
    ? getMaxAdditionalConductors(
        conduitType,
        conduitSize,
        entries,
        lastWire.size,
      )
    : 0;

  function chooseConduit(nextType: ConduitType) {
    pulse();
    setConduitType(nextType);
  }

  function chooseSize(nextSize: ConduitSize) {
    pulse();
    setConduitSize(nextSize);
  }

  function changeQuantity(id: number, change: number) {
    pulse();
    setWires((current) =>
      current.map((wire) =>
        wire.id === id
          ? { ...wire, quantity: Math.max(1, Math.min(999, wire.quantity + change)) }
          : wire,
      ),
    );
  }

  function addWire() {
    pulse();
    setWires((current) => [
      ...current,
      { id: nextRowId, quantity: 1, size: current.at(-1)?.size ?? "12" },
    ]);
    setNextRowId((current) => current + 1);
  }

  function removeWire(id: number) {
    pulse();
    setWires((current) => current.filter((wire) => wire.id !== id));
  }

  function chooseWireSize(size: WireSize) {
    if (sizePickerRowId === null) return;
    pulse();
    setWires((current) =>
      current.map((wire) =>
        wire.id === sizePickerRowId ? { ...wire, size } : wire,
      ),
    );
    setSizePickerRowId(null);
  }

  const selectedSizeIsOther = !QUICK_SIZES.includes(conduitSize);
  const selectedConduitIsOther = OTHER_CONDUITS.includes(conduitType);

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
          <Text style={styles.headerEyebrow}>FILL GUIDE</Text>
          <Text style={styles.headerTitle}>Conduit Fill</Text>
        </View>
      </View>

      <View style={styles.modeSwitchWrap}>
        <FillModeSwitch mode="conduit" />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Choose conduit</Text>
            <Text style={styles.sectionHint}>Tap what is printed on the raceway.</Text>
          </View>
        </View>

        <View style={styles.choiceRow}>
          {QUICK_CONDUITS.map((type) => (
            <Pressable
              accessibilityRole="button"
              key={type}
              onPress={() => chooseConduit(type)}
              style={({ pressed }) => [
                styles.choice,
                conduitType === type && styles.choiceSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[
                styles.choiceText,
                conduitType === type && styles.choiceTextSelected,
              ]}>{CONDUIT_LABELS[type]}</Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              pulse();
              setShowOtherConduits((current) => !current);
            }}
            style={({ pressed }) => [
              styles.choice,
              selectedConduitIsOther && styles.choiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[
              styles.choiceText,
              selectedConduitIsOther && styles.choiceTextSelected,
            ]}>Other {showOtherConduits ? "⌃" : "⌄"}</Text>
          </Pressable>
        </View>

        {showOtherConduits ? (
          <View style={styles.expandedChoices}>
            {OTHER_CONDUITS.map((type) => (
              <Pressable
                accessibilityRole="button"
                key={type}
                onPress={() => chooseConduit(type)}
                style={({ pressed }) => [
                  styles.expandedChoice,
                  conduitType === type && styles.expandedChoiceSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.expandedChoiceText}>{CONDUIT_LABELS[type]}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Choose size</Text>
            <Text style={styles.sectionHint}>Trade size in inches.</Text>
          </View>
        </View>

        <View style={styles.choiceRow}>
          {QUICK_SIZES.map((size) => (
            <Pressable
              accessibilityRole="button"
              key={size}
              onPress={() => chooseSize(size)}
              style={({ pressed }) => [
                styles.sizeChoice,
                conduitSize === size && styles.choiceSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[
                styles.sizeChoiceText,
                conduitSize === size && styles.choiceTextSelected,
              ]}>{size}″</Text>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              pulse();
              setShowOtherSizes((current) => !current);
            }}
            style={({ pressed }) => [
              styles.sizeChoice,
              selectedSizeIsOther && styles.choiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[
              styles.sizeChoiceText,
              selectedSizeIsOther && styles.choiceTextSelected,
            ]}>Other {showOtherSizes ? "⌃" : "⌄"}</Text>
          </Pressable>
        </View>

        {showOtherSizes ? (
          <View style={styles.expandedChoices}>
            {CONDUIT_SIZES.filter((size) => !QUICK_SIZES.includes(size)).map((size) => (
              <Pressable
                accessibilityRole="button"
                key={size}
                onPress={() => chooseSize(size)}
                style={({ pressed }) => [
                  styles.smallExpandedChoice,
                  conduitSize === size && styles.expandedChoiceSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.expandedChoiceText}>{size}″</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Add wires</Text>
            <Text style={styles.sectionHint}>Copper THHN / THWN-2</Text>
          </View>
        </View>

        <View style={styles.wireList}>
          {wires.map((wire) => (
            <View key={wire.id} style={styles.wireRow}>
              <View style={styles.quantityControl}>
                <Pressable
                  accessibilityLabel={`Remove one ${displayWireSize(wire.size)} wire`}
                  accessibilityRole="button"
                  onPress={() => changeQuantity(wire.id, -1)}
                  style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </Pressable>
                <View style={styles.quantityValue}>
                  <Text style={styles.quantityNumber}>{wire.quantity}</Text>
                  <Text style={styles.quantityLabel}>QTY</Text>
                </View>
                <Pressable
                  accessibilityLabel={`Add one ${displayWireSize(wire.size)} wire`}
                  accessibilityRole="button"
                  onPress={() => changeQuantity(wire.id, 1)}
                  style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}
                >
                  <Text style={styles.quantityButtonText}>＋</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityHint="Opens the wire size list"
                accessibilityLabel={`Wire size ${displayWireSize(wire.size)}`}
                accessibilityRole="button"
                onPress={() => {
                  pulse();
                  setSizePickerRowId(wire.id);
                }}
                style={({ pressed }) => [styles.wireSizeButton, pressed && styles.pressed]}
              >
                <View>
                  <Text style={styles.wireSizeLabel}>WIRE SIZE</Text>
                  <Text style={styles.wireSizeValue}>{displayWireSize(wire.size)}</Text>
                </View>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>

              {wires.length > 1 ? (
                <Pressable
                  accessibilityLabel="Remove this wire row"
                  accessibilityRole="button"
                  onPress={() => removeWire(wire.id)}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={addWire}
          style={({ pressed }) => [styles.addWireButton, pressed && styles.pressed]}
        >
          <Text style={styles.addWireIcon}>＋</Text>
          <Text style={styles.addWireText}>Add another wire size</Text>
        </Pressable>

        <View style={[styles.resultCard, !result.fits && styles.resultCardFail]}>
          <View style={styles.resultTopRow}>
            <View>
              <Text style={styles.resultEyebrow}>RESULT</Text>
              <Text style={[styles.resultStatus, !result.fits && styles.resultStatusFail]}>
                {result.fits ? "FITS" : "TOO FULL"}
              </Text>
            </View>
            <View style={[styles.fillBadge, !result.fits && styles.fillBadgeFail]}>
              <Text style={styles.fillBadgeValue}>{result.fillPercent.toFixed(1)}%</Text>
              <Text style={styles.fillBadgeLabel}>USED</Text>
            </View>
          </View>

          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterLimit,
                { left: `${result.fillLimitPercent}%` },
              ]}
            />
            <View
              style={[
                styles.meterFill,
                !result.fits && styles.meterFillFail,
                { width: `${Math.min(100, result.fillPercent)}%` },
              ]}
            />
          </View>
          <View style={styles.meterLabels}>
            <Text style={styles.meterLabel}>{result.conductorCount} conductors</Text>
            <Text style={styles.meterLabel}>{result.fillLimitPercent}% allowed</Text>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>SELECTED</Text>
              <Text style={styles.detailValue}>{conduitSize}″ {CONDUIT_LABELS[conduitType]}</Text>
            </View>
            <View style={styles.detailRule} />
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{result.fits ? "ROOM FOR" : "USE AT LEAST"}</Text>
              <Text style={styles.detailValue}>
                {result.fits && lastWire
                  ? `${maxAdditional} more ${displayWireSize(lastWire.size)}`
                  : minimumSize
                    ? `${minimumSize}″ ${CONDUIT_LABELS[conduitType]}`
                    : "Larger raceway"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.codeNote}>
          <Text style={styles.codeNoteTitle}>NEC 2020 / 2023 · Chapter 9</Text>
          <Text style={styles.codeNoteText}>
            Physical fill only. Equipment grounds count. Ampacity adjustment,
            job specifications, and local requirements may also apply.
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setSizePickerRowId(null)}
        transparent
        visible={sizePickerRowId !== null}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
            <Pressable style={styles.modalScrim} onPress={() => setSizePickerRowId(null)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>COPPER THHN / THWN-2</Text>
                  <Text style={styles.sheetTitle}>Choose wire size</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSizePickerRowId(null)}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.wireSizeGrid}>
                {WIRE_SIZES.map((size) => {
                  const selected = wires.find(({ id }) => id === sizePickerRowId)?.size === size;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={size}
                      onPress={() => chooseWireSize(size)}
                      style={({ pressed }) => [
                        styles.wireSizeOption,
                        selected && styles.wireSizeOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[
                        styles.wireSizeOptionText,
                        selected && styles.wireSizeOptionTextSelected,
                      ]}>{displayWireSize(size)}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}
