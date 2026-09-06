import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { FillModeSwitch } from "../../components/fillGuide/FillModeSwitch";
import { FillQuantityControl } from "../../components/fillGuide/FillQuantityControl";
import {
  BOX_WIRE_SIZES,
  calculateBoxFill,
  type BoxFamily,
  type BoxWireRole,
  type BoxWireSize,
  getNextStandardBox,
  STANDARD_BOXES,
} from "../../utils/boxFill/boxFill";
import { styles } from "./styles";

type WireRow = {
  id: number;
  quantity: number;
  role: BoxWireRole;
  size: BoxWireSize;
};

type Picker =
  | { kind: "device-size" }
  | { kind: "role"; rowId: number }
  | { kind: "wire-size"; rowId: number }
  | null;

type BoxBuilderPicker = "size" | "depth" | "shape" | "add-on" | null;
type BoxAddOn = "none" | "mud-ring" | "extension";
type BoxShape = "square" | "octagon" | "device";

function pulse() {
  Haptics.selectionAsync().catch(() => {});
}

function displayWireSize(size: BoxWireSize) {
  return `#${size}`;
}

function roleLabel(role: BoxWireRole) {
  return role === "ground" ? "Equipment ground" : "Insulated conductor";
}

function boxFaceLabel(family: Exclude<BoxFamily, "marked">) {
  if (family === "four-eleven") return "4-11/16″";
  if (family === "three-two-device") return "3″ × 2″";
  return "4″";
}

function boxShapeLabel(family: Exclude<BoxFamily, "marked">) {
  if (family === "four-octagon") return "Octagon";
  if (family === "three-two-device") return "Device box";
  return "Square";
}

function boxShape(family: BoxFamily): BoxShape {
  if (family === "four-octagon") return "octagon";
  if (family === "three-two-device") return "device";
  return "square";
}

function standardBoxDescription(
  family: Exclude<BoxFamily, "marked">,
  depth: string,
) {
  return `${boxFaceLabel(family)} × ${depth}″ deep · ${boxShapeLabel(family)}`;
}

function addOnLabel(addOn: BoxAddOn) {
  if (addOn === "mud-ring") return "Mud ring / raised cover";
  if (addOn === "extension") return "Extension ring";
  return "No add-on";
}

export default function BoxFillScreen() {
  const [boxFamily, setBoxFamily] = useState<BoxFamily>("four-square");
  const [depth, setDepth] = useState("2-1/8");
  const [markedVolume, setMarkedVolume] = useState("");
  const [boxBuilderPicker, setBoxBuilderPicker] = useState<BoxBuilderPicker>(null);
  const [addOn, setAddOn] = useState<BoxAddOn>("none");
  const [addOnVolume, setAddOnVolume] = useState("");
  const [wires, setWires] = useState<WireRow[]>([
    { id: 1, quantity: 3, role: "insulated", size: "12" },
  ]);
  const [nextRowId, setNextRowId] = useState(2);
  const [deviceCount, setDeviceCount] = useState(0);
  const [deviceWireSize, setDeviceWireSize] = useState<BoxWireSize>("12");
  const [hasInternalClamp, setHasInternalClamp] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showBoxHelp, setShowBoxHelp] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [resultLayout, setResultLayout] = useState({ height: 0, y: 0 });
  const scrollRef = useRef<ScrollView>(null);

  const standardOptions = boxFamily === "marked" ? [] : STANDARD_BOXES[boxFamily];
  const selectedStandardBox = standardOptions.find((option) => option.depth === depth)
    ?? standardOptions.at(-1);
  const baseVolume = selectedStandardBox?.volume ?? 0;
  const extraVolume = addOn === "none" ? 0 : Number(addOnVolume) || 0;
  const availableVolume = boxFamily === "marked"
    ? Number(markedVolume) || 0
    : baseVolume + extraVolume;
  const entries = wires.map(({ quantity, role, size }) => ({ quantity, role, size }));
  const result = useMemo(
    () => calculateBoxFill({
      availableVolume,
      deviceCount,
      deviceWireSize,
      hasInternalClamp,
      wires: entries,
    }),
    // All entry values are represented by wires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableVolume, deviceCount, deviceWireSize, hasInternalClamp, wires],
  );
  const nextBox = boxFamily === "marked"
    ? null
    : getNextStandardBox(result.requiredVolume, boxFamily)
      ?? getNextStandardBox(result.requiredVolume);
  const needsAddOnVolume = boxFamily !== "marked" && addOn !== "none" && extraVolume <= 0;
  const isReady = availableVolume > 0 && !needsAddOnVolume;
  const usedPercent = isReady ? (result.requiredVolume / availableVolume) * 100 : 0;
  const resultIsVisible = resultLayout.height > 0
    && resultLayout.y < scrollY + viewportHeight - 12
    && resultLayout.y + resultLayout.height > scrollY + 12;
  const amountShort = Math.max(0, result.requiredVolume - availableVolume);
  const liveResultText = !isReady
    ? needsAddOnVolume ? "ENTER ADD-ON VOLUME" : "ENTER BOX VOLUME"
    : result.fits
      ? `FITS • ${result.remainingVolume.toFixed(1)} in³ remaining`
      : `TOO FULL • Need ${amountShort.toFixed(1)} in³ more`;

  function chooseFamily(nextFamily: BoxFamily) {
    pulse();
    Keyboard.dismiss();
    setBoxFamily(nextFamily);
    if (nextFamily === "four-square") setDepth("2-1/8");
    if (nextFamily === "four-eleven") setDepth("2-1/8");
    if (nextFamily === "four-octagon") setDepth("2-1/8");
    if (nextFamily === "three-two-device") setDepth("2-1/4");
    if (nextFamily === "marked") {
      setAddOn("none");
      setAddOnVolume("");
    }
    setBoxBuilderPicker(null);
  }

  function chooseDepth(nextDepth: string) {
    pulse();
    setDepth(nextDepth);
    setBoxBuilderPicker(null);
  }

  function chooseShape(nextShape: BoxShape) {
    if (nextShape === "octagon") chooseFamily("four-octagon");
    else if (nextShape === "device") chooseFamily("three-two-device");
    else if (boxFamily !== "four-square" && boxFamily !== "four-eleven") chooseFamily("four-square");
    else setBoxBuilderPicker(null);
  }

  function chooseAddOn(nextAddOn: BoxAddOn) {
    pulse();
    setAddOn(nextAddOn);
    if (nextAddOn === "none") setAddOnVolume("");
    setBoxBuilderPicker(null);
  }

  function setQuantity(id: number, quantity: number) {
    setWires((current) => current.map((wire) =>
      wire.id === id
        ? { ...wire, quantity: Math.max(1, Math.min(999, quantity)) }
        : wire,
    ));
  }

  function addWire() {
    pulse();
    setWires((current) => [
      ...current,
      {
        id: nextRowId,
        quantity: 1,
        role: "insulated",
        size: current.at(-1)?.size ?? "12",
      },
    ]);
    setNextRowId((current) => current + 1);
  }

  function removeWire(id: number) {
    pulse();
    setWires((current) => current.filter((wire) => wire.id !== id));
  }

  function selectWireSize(size: BoxWireSize) {
    pulse();
    if (picker?.kind === "device-size") {
      setDeviceWireSize(size);
    } else if (picker?.kind === "wire-size") {
      setWires((current) => current.map((wire) =>
        wire.id === picker.rowId ? { ...wire, size } : wire,
      ));
    }
    setPicker(null);
  }

  function selectRole(role: BoxWireRole) {
    if (picker?.kind !== "role") return;
    pulse();
    setWires((current) => current.map((wire) =>
      wire.id === picker.rowId ? { ...wire, role } : wire,
    ));
    setPicker(null);
  }

  function changeDeviceCount(change: number) {
    pulse();
    setDeviceCount((current) => Math.max(0, Math.min(20, current + change)));
  }

  const boxTitle = boxFamily === "marked"
    ? "Marked box"
    : standardBoxDescription(boxFamily, selectedStandardBox?.depth ?? depth);
  const boxSummary = boxFamily === "marked"
    ? "Stamped volume"
    : `${boxTitle}${extraVolume > 0
      ? ` + ${extraVolume.toFixed(1)} in³ add-on`
      : needsAddOnVolume
        ? " + add-on volume needed"
        : ""} • ${availableVolume.toFixed(1)} in³`;

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
          <Text style={styles.headerTitle}>Box Fill</Text>
        </View>
      </View>

      <View style={styles.modeSwitchWrap}>
        <FillModeSwitch mode="box" />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        ref={scrollRef}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Choose the box</Text>
            <Text style={styles.sectionHint}>Use the shape you see—or its stamped volume.</Text>
          </View>
        </View>

        <Text style={styles.depthLabel}>HOW DO YOU WANT TO CHOOSE THE BOX?</Text>
        <View style={styles.boxModeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: boxFamily !== "marked" }}
            onPress={() => chooseFamily(boxFamily === "marked" ? "four-square" : boxFamily)}
            style={({ pressed }) => [
              styles.boxModeChoice,
              boxFamily !== "marked" && styles.boxModeChoiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[
              styles.boxModeText,
              boxFamily !== "marked" && styles.boxModeTextSelected,
            ]}>Common box</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: boxFamily === "marked" }}
            onPress={() => chooseFamily("marked")}
            style={({ pressed }) => [
              styles.boxModeChoice,
              boxFamily === "marked" && styles.boxModeChoiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[
              styles.boxModeText,
              boxFamily === "marked" && styles.boxModeTextSelected,
            ]}>Use stamped volume</Text>
          </Pressable>
        </View>

        {boxFamily === "marked" ? (
          <>
            <View style={styles.markedCard}>
              <View style={styles.markedCopy}>
                <Text style={styles.markedLabel}>VOLUME STAMPED INSIDE BOX</Text>
                <TextInput
                  accessibilityLabel="Box volume in cubic inches"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => {
                    if (/^\d*\.?\d{0,2}$/.test(value)) setMarkedVolume(value);
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  placeholder="30.3"
                  placeholderTextColor={styles.markedPlaceholder.color}
                  returnKeyType="done"
                  style={styles.markedInput}
                  value={markedVolume}
                />
                <Text style={styles.markedUnit}>Look inside for a number ending in in³.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => Keyboard.dismiss()}
                style={({ pressed }) => [styles.doneKeyboardButton, pressed && styles.pressed]}
              >
                <Text style={styles.doneKeyboardButtonText}>Done</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.depthLabel}>BUILD YOUR BOX</Text>
            <View style={styles.builderPanel}>
              <View style={styles.boxBuilderRow}>
                <Pressable
                  accessibilityLabel={`Box size ${boxFaceLabel(boxFamily)}`}
                  accessibilityRole="button"
                  onPress={() => {
                    pulse();
                    setBoxBuilderPicker("size");
                  }}
                  style={({ pressed }) => [styles.builderControl, pressed && styles.pressed]}
                >
                  <Text style={styles.builderLabel}>SIZE</Text>
                  <Text style={styles.builderValue}>{boxFaceLabel(boxFamily)} <Text style={styles.builderChevron}>⌄</Text></Text>
                </Pressable>
                <Text style={styles.builderTimes}>×</Text>
                <Pressable
                  accessibilityLabel={`Box depth ${selectedStandardBox?.depth} inches`}
                  accessibilityRole="button"
                  onPress={() => {
                    pulse();
                    setBoxBuilderPicker("depth");
                  }}
                  style={({ pressed }) => [styles.builderControl, pressed && styles.pressed]}
                >
                  <Text style={styles.builderLabel}>DEPTH</Text>
                  <Text style={styles.builderValue}>{selectedStandardBox?.depth}″ <Text style={styles.builderChevron}>⌄</Text></Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Box shape ${boxShapeLabel(boxFamily)}`}
                  accessibilityRole="button"
                  onPress={() => {
                    pulse();
                    setBoxBuilderPicker("shape");
                  }}
                  style={({ pressed }) => [styles.builderControl, styles.builderShapeControl, pressed && styles.pressed]}
                >
                  <Text style={styles.builderLabel}>SHAPE</Text>
                  <Text style={styles.builderValue}>{boxShapeLabel(boxFamily)} <Text style={styles.builderChevron}>⌄</Text></Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityLabel={`Box add-on ${addOnLabel(addOn)}`}
                accessibilityRole="button"
                onPress={() => {
                  pulse();
                  setBoxBuilderPicker("add-on");
                }}
                style={({ pressed }) => [styles.addOnControl, pressed && styles.pressed]}
              >
                <View>
                  <Text style={styles.builderLabel}>ADD-ON</Text>
                  <Text style={styles.addOnValue}>{addOnLabel(addOn)}</Text>
                </View>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>

              {addOn !== "none" ? (
                <View style={styles.addOnVolumeCard}>
                  <View style={styles.markedCopy}>
                    <Text style={styles.markedLabel}>VOLUME MARKED ON ADD-ON</Text>
                    <TextInput
                      accessibilityLabel="Add-on volume in cubic inches"
                      keyboardType="decimal-pad"
                      onChangeText={(value) => {
                        if (/^\d*\.?\d{0,2}$/.test(value)) setAddOnVolume(value);
                      }}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      placeholder="0.0"
                      placeholderTextColor={styles.markedPlaceholder.color}
                      returnKeyType="done"
                      style={styles.addOnVolumeInput}
                      value={addOnVolume}
                    />
                    <Text style={styles.markedUnit}>Use the capacity marked by the manufacturer.</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => Keyboard.dismiss()}
                    style={({ pressed }) => [styles.doneKeyboardButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.doneKeyboardButtonText}>Done</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showBoxHelp }}
          onPress={() => {
            pulse();
            setShowBoxHelp((current) => !current);
          }}
          style={({ pressed }) => [styles.boxHelpButton, pressed && styles.pressed]}
        >
          <Text style={styles.boxHelpButtonText}>How do I identify this?</Text>
          <Text style={styles.chevron}>{showBoxHelp ? "⌃" : "⌄"}</Text>
        </Pressable>
        {showBoxHelp ? (
          <View style={styles.boxHelpCard}>
            <Text style={styles.boxHelpText}>
              Match the face size, depth, and shape you see. “3″ × 2″” means a device or switch box—not a 3″ square box. For plastic, masonry, gangable, or unusual boxes, use the cubic-inch capacity stamped by the manufacturer.
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Add wires</Text>
            <Text style={styles.sectionHint}>Count every wire entering or leaving the box.</Text>
          </View>
        </View>

        <View style={styles.wireList}>
          {wires.map((wire) => (
            <View key={wire.id} style={styles.wireCard}>
              <View style={styles.wireTopRow}>
                <FillQuantityControl
                  accessibilityLabel={`${displayWireSize(wire.size)} wire quantity`}
                  onChange={(quantity) => setQuantity(wire.id, quantity)}
                  value={wire.quantity}
                />

                <Pressable
                  accessibilityLabel={`Wire size ${displayWireSize(wire.size)}`}
                  accessibilityRole="button"
                  onPress={() => {
                    pulse();
                    setPicker({ kind: "wire-size", rowId: wire.id });
                  }}
                  style={({ pressed }) => [styles.wireSizeButton, pressed && styles.pressed]}
                >
                  <View>
                    <Text style={styles.controlLabel}>WIRE SIZE</Text>
                    <Text style={styles.controlValue}>{displayWireSize(wire.size)}</Text>
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

              <Pressable
                accessibilityLabel={`Count as ${roleLabel(wire.role)}`}
                accessibilityRole="button"
                onPress={() => {
                  pulse();
                  setPicker({ kind: "role", rowId: wire.id });
                }}
                style={({ pressed }) => [styles.roleButton, pressed && styles.pressed]}
              >
                <View style={styles.roleCopy}>
                  <Text style={styles.controlLabel}>COUNT AS</Text>
                  <Text style={styles.roleValue}>{roleLabel(wire.role)}</Text>
                </View>
                <View style={[styles.roleBadge, wire.role === "ground" && styles.roleBadgeGround]}>
                  <Text style={styles.roleBadgeText}>{wire.role === "ground" ? "GND" : "WIRE"}</Text>
                </View>
                <Text style={styles.chevron}>⌄</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={addWire}
          style={({ pressed }) => [styles.addWireButton, pressed && styles.pressed]}
        >
          <Text style={styles.addWireIcon}>＋</Text>
          <Text style={styles.addWireText}>Add another wire</Text>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Devices and clamps</Text>
            <Text style={styles.sectionHint}>Tell us what is installed. The app calculates the space.</Text>
          </View>
        </View>

        <View style={styles.extraCard}>
          <View style={styles.extraRow}>
            <View style={styles.extraCopy}>
              <Text style={styles.extraTitle}>Switches or receptacles</Text>
              <Text style={styles.extraHint}>How many device straps are mounted?</Text>
            </View>
            <View style={styles.smallStepper}>
              <Pressable
                accessibilityLabel="Remove one device"
                accessibilityRole="button"
                onPress={() => changeDeviceCount(-1)}
                style={({ pressed }) => [styles.smallStepButton, pressed && styles.pressed]}
              ><Text style={styles.smallStepText}>−</Text></Pressable>
              <Text style={styles.smallStepValue}>{deviceCount}</Text>
              <Pressable
                accessibilityLabel="Add one device"
                accessibilityRole="button"
                onPress={() => changeDeviceCount(1)}
                style={({ pressed }) => [styles.smallStepButton, pressed && styles.pressed]}
              ><Text style={styles.smallStepText}>＋</Text></Pressable>
            </View>
          </View>

          {deviceCount > 0 ? (
            <Pressable
              accessibilityLabel={`Largest wire attached to devices ${displayWireSize(deviceWireSize)}`}
              accessibilityRole="button"
              onPress={() => {
                pulse();
                setPicker({ kind: "device-size" });
              }}
              style={({ pressed }) => [styles.deviceSizeRow, pressed && styles.pressed]}
            >
              <View>
                <Text style={styles.controlLabel}>LARGEST WIRE CONNECTED TO A DEVICE</Text>
                <Text style={styles.deviceSizeValue}>{displayWireSize(deviceWireSize)}</Text>
              </View>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
          ) : null}

          {deviceCount > 0 ? (
            <Text style={styles.deviceHelp}>
              No device volume is needed. Each strap counts as two allowances based on this wire size.
            </Text>
          ) : null}

          <View style={styles.extraDivider} />

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: hasInternalClamp }}
            onPress={() => {
              pulse();
              setHasInternalClamp((current) => !current);
            }}
            style={({ pressed }) => [styles.extraRow, pressed && styles.pressed]}
          >
            <View style={styles.extraCopy}>
              <Text style={styles.extraTitle}>Internal cable clamp</Text>
              <Text style={styles.extraHint}>A clamp built into the box</Text>
            </View>
            <View style={[styles.toggle, hasInternalClamp && styles.toggleOn]}>
              <View style={[styles.toggleKnob, hasInternalClamp && styles.toggleKnobOn]} />
            </View>
          </Pressable>
        </View>

        <View style={[
          styles.resultCard,
          isReady && !result.fits && styles.resultCardFail,
          !isReady && styles.resultCardWaiting,
        ]} onLayout={(event) => setResultLayout(event.nativeEvent.layout)}>
          <View style={styles.resultTopRow}>
            <View>
              <Text style={styles.resultEyebrow}>RESULT</Text>
              <Text style={[
                styles.resultStatus,
                isReady && !result.fits && styles.resultStatusFail,
                !isReady && styles.resultStatusWaiting,
              ]}>
                {!isReady
                  ? needsAddOnVolume ? "ENTER ADD-ON" : "ENTER VOLUME"
                  : result.fits ? "FITS" : "TOO FULL"}
              </Text>
            </View>
            <View style={styles.volumeBadge}>
              <Text style={styles.volumeBadgeValue}>{result.requiredVolume.toFixed(1)}</Text>
              <Text style={styles.volumeBadgeLabel}>in³ NEEDED</Text>
            </View>
          </View>

          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                isReady && !result.fits && styles.meterFillFail,
                { width: `${Math.min(100, usedPercent)}%` },
              ]}
            />
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>AVAILABLE</Text>
              <Text style={styles.detailValue}>{isReady ? `${availableVolume.toFixed(1)} in³` : "—"}</Text>
              <Text style={styles.detailCaption}>{boxTitle}</Text>
            </View>
            <View style={styles.detailRule} />
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>{result.fits ? "SPACE LEFT" : "NEXT STEP"}</Text>
              <Text style={styles.detailValue}>
                {!isReady
                  ? needsAddOnVolume ? "Enter add-on" : "Enter stamp"
                  : result.fits
                    ? `${result.remainingVolume.toFixed(1)} in³`
                    : nextBox
                      ? `${nextBox.volume.toFixed(1)} in³ box`
                      : `Need ${result.requiredVolume.toFixed(1)} in³`}
              </Text>
              <Text style={styles.detailCaption}>
                {!isReady
                  ? needsAddOnVolume ? "Use its marked volume" : "Look inside the box"
                  : result.fits
                    ? "Remaining capacity"
                    : nextBox
                      ? standardBoxDescription(nextBox.family, nextBox.depth)
                      : "Choose a larger box"}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              pulse();
              setShowBreakdown((current) => !current);
            }}
            style={({ pressed }) => [styles.breakdownButton, pressed && styles.pressed]}
          >
            <Text style={styles.breakdownButtonText}>{showBreakdown ? "Hide breakdown" : "See what counts"}</Text>
            <Text style={styles.chevron}>{showBreakdown ? "⌃" : "⌄"}</Text>
          </Pressable>

          {showBreakdown ? (
            <View style={styles.breakdownList}>
              <BreakdownRow label="Insulated wires" value={result.breakdown.insulated} />
              <BreakdownRow label="Equipment grounds" value={result.breakdown.grounds} />
              <BreakdownRow label="Device straps" value={result.breakdown.devices} />
              <BreakdownRow label="Internal clamp" value={result.breakdown.clamps} />
            </View>
          ) : null}
        </View>

        <View style={styles.codeNote}>
          <Text style={styles.codeNoteTitle}>FIELD REFERENCE</Text>
          <Text style={styles.codeNoteText}>
            Solid and stranded conductors use the same volume allowance here. Verify the box’s manufacturer marking, local rules, project specifications, and job requirements before installation. Larger conductors and pull-box sizing require a different calculation.
          </Text>
        </View>
      </ScrollView>

      {!resultIsVisible ? <Pressable
        accessibilityHint="Jumps to the full box fill result"
        accessibilityRole="button"
        onPress={() => {
          pulse();
          Keyboard.dismiss();
          scrollRef.current?.scrollToEnd({ animated: true });
        }}
        style={({ pressed }) => [
          styles.liveResult,
          isReady && !result.fits && styles.liveResultFail,
          !isReady && styles.liveResultWaiting,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.liveResultCopy}>
          <Text style={styles.liveResultStatus}>{liveResultText}</Text>
          <Text numberOfLines={1} style={styles.liveResultBox}>{boxSummary}</Text>
        </View>
        <Text style={styles.liveResultArrow}>View details ↑</Text>
      </Pressable> : null}

      <Modal
        animationType="slide"
        onRequestClose={() => setBoxBuilderPicker(null)}
        transparent
        visible={boxBuilderPicker !== null}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
            <Pressable style={styles.modalScrim} onPress={() => setBoxBuilderPicker(null)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>BUILD YOUR BOX</Text>
                  <Text style={styles.sheetTitle}>
                    {boxBuilderPicker === "size"
                      ? "Choose face size"
                      : boxBuilderPicker === "depth"
                        ? "Choose depth"
                        : boxBuilderPicker === "shape"
                          ? "Choose shape"
                          : "Add anything?"}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setBoxBuilderPicker(null)}
                  style={styles.doneButton}
                ><Text style={styles.doneButtonText}>Done</Text></Pressable>
              </View>

              <View style={styles.builderOptions}>
                {boxBuilderPicker === "size" ? (
                  <>
                    {(boxShape(boxFamily) === "square"
                      ? [
                          { family: "four-square" as const, hint: "Most common", label: "4″" },
                          { family: "four-eleven" as const, hint: "More capacity", label: "4-11/16″" },
                        ]
                      : boxShape(boxFamily) === "octagon"
                        ? [{ family: "four-octagon" as const, hint: "Common octagon", label: "4″" }]
                        : [{ family: "three-two-device" as const, hint: "Switch or device box", label: "3″ × 2″" }]
                    ).map((option) => (
                      <Pressable
                        accessibilityRole="button"
                        key={option.family}
                        onPress={() => chooseFamily(option.family)}
                        style={({ pressed }) => [
                          styles.builderOption,
                          boxFamily === option.family && styles.builderOptionSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.builderOptionCopy}>
                          <Text style={styles.builderOptionTitle}>{option.label}</Text>
                          <Text style={styles.builderOptionHint}>{option.hint}</Text>
                        </View>
                        {boxFamily === option.family ? <Text style={styles.builderOptionCheck}>✓</Text> : null}
                      </Pressable>
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => chooseFamily("marked")}
                      style={({ pressed }) => [styles.builderOption, pressed && styles.pressed]}
                    >
                      <View style={styles.builderOptionCopy}>
                        <Text style={styles.builderOptionTitle}>Other box</Text>
                        <Text style={styles.builderOptionHint}>Use its stamped cubic-inch capacity</Text>
                      </View>
                      <Text style={styles.chevron}>→</Text>
                    </Pressable>
                  </>
                ) : boxBuilderPicker === "depth" ? (
                  standardOptions.map((option) => (
                    <Pressable
                      accessibilityRole="button"
                      key={option.depth}
                      onPress={() => chooseDepth(option.depth)}
                      style={({ pressed }) => [
                        styles.builderOption,
                        depth === option.depth && styles.builderOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.builderOptionCopy}>
                        <Text style={styles.builderOptionTitle}>{option.depth}″ deep</Text>
                        <Text style={styles.builderOptionHint}>{option.volume.toFixed(1)} in³ box capacity</Text>
                      </View>
                      {depth === option.depth ? <Text style={styles.builderOptionCheck}>✓</Text> : null}
                    </Pressable>
                  ))
                ) : boxBuilderPicker === "shape" ? (
                  ([
                    { hint: "4″ or 4-11/16″", label: "Square", shape: "square" },
                    { hint: "4″ fixture or junction box", label: "Octagon", shape: "octagon" },
                    { hint: "3″ × 2″ switch box", label: "Device box", shape: "device" },
                  ] as { hint: string; label: string; shape: BoxShape }[]).map((option) => (
                    <Pressable
                      accessibilityRole="button"
                      key={option.shape}
                      onPress={() => chooseShape(option.shape)}
                      style={({ pressed }) => [
                        styles.builderOption,
                        boxShape(boxFamily) === option.shape && styles.builderOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.builderOptionCopy}>
                        <Text style={styles.builderOptionTitle}>{option.label}</Text>
                        <Text style={styles.builderOptionHint}>{option.hint}</Text>
                      </View>
                      {boxShape(boxFamily) === option.shape ? <Text style={styles.builderOptionCheck}>✓</Text> : null}
                    </Pressable>
                  ))
                ) : (
                  (["none", "mud-ring", "extension"] as BoxAddOn[]).map((option) => (
                    <Pressable
                      accessibilityRole="button"
                      key={option}
                      onPress={() => chooseAddOn(option)}
                      style={({ pressed }) => [
                        styles.builderOption,
                        addOn === option && styles.builderOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.builderOptionCopy}>
                        <Text style={styles.builderOptionTitle}>{addOnLabel(option)}</Text>
                        <Text style={styles.builderOptionHint}>
                          {option === "none" ? "Box only" : "Enter the volume marked on the add-on"}
                        </Text>
                      </View>
                      {addOn === option ? <Text style={styles.builderOptionCheck}>✓</Text> : null}
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setPicker(null)}
        transparent
        visible={picker !== null}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
            <Pressable style={styles.modalScrim} onPress={() => setPicker(null)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>BOX FILL INPUT</Text>
                  <Text style={styles.sheetTitle}>
                    {picker?.kind === "role" ? "What kind of wire?" : "Choose wire size"}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPicker(null)}
                  style={styles.doneButton}
                ><Text style={styles.doneButtonText}>Done</Text></Pressable>
              </View>

              {picker?.kind === "role" ? (
                <View style={styles.roleOptions}>
                  {(["insulated", "ground"] as BoxWireRole[]).map((role) => {
                    const selected = wires.find(({ id }) => id === picker.rowId)?.role === role;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={role}
                        onPress={() => selectRole(role)}
                        style={({ pressed }) => [
                          styles.roleOption,
                          selected && styles.roleOptionSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={[styles.roleOptionIcon, role === "ground" && styles.roleOptionIconGround]}>
                          <Text style={styles.roleOptionIconText}>{role === "ground" ? "G" : "W"}</Text>
                        </View>
                        <View style={styles.roleOptionCopy}>
                          <Text style={styles.roleOptionTitle}>{roleLabel(role)}</Text>
                          <Text style={styles.roleOptionHint}>
                            {role === "ground"
                              ? "Bare or insulated equipment grounding conductor"
                              : "Hot, neutral, traveler, or other insulated conductor"}
                          </Text>
                        </View>
                        {selected ? <Text style={styles.roleOptionCheck}>✓</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.wireSizeGrid}>
                  {BOX_WIRE_SIZES.map((size) => {
                    const selected = picker?.kind === "device-size"
                      ? deviceWireSize === size
                      : wires.find(({ id }) => id === picker?.rowId)?.size === size;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={size}
                        onPress={() => selectWireSize(size)}
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
                </View>
              )}
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value.toFixed(2)} in³</Text>
    </View>
  );
}
