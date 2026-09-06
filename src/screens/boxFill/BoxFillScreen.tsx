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

function pulse() {
  Haptics.selectionAsync().catch(() => {});
}

function displayWireSize(size: BoxWireSize) {
  return `#${size}`;
}

function roleLabel(role: BoxWireRole) {
  return role === "ground" ? "Equipment ground" : "Insulated conductor";
}

export default function BoxFillScreen() {
  const [boxFamily, setBoxFamily] = useState<BoxFamily>("four-square");
  const [depth, setDepth] = useState("2-1/8");
  const [markedVolume, setMarkedVolume] = useState("");
  const [wires, setWires] = useState<WireRow[]>([
    { id: 1, quantity: 3, role: "insulated", size: "12" },
  ]);
  const [nextRowId, setNextRowId] = useState(2);
  const [deviceCount, setDeviceCount] = useState(0);
  const [deviceWireSize, setDeviceWireSize] = useState<BoxWireSize>("12");
  const [hasInternalClamp, setHasInternalClamp] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const standardOptions = boxFamily === "marked" ? [] : STANDARD_BOXES[boxFamily];
  const selectedStandardBox = standardOptions.find((option) => option.depth === depth)
    ?? standardOptions.at(-1);
  const availableVolume = boxFamily === "marked"
    ? Number(markedVolume) || 0
    : selectedStandardBox?.volume ?? 0;
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
  const isReady = availableVolume > 0;
  const usedPercent = isReady ? (result.requiredVolume / availableVolume) * 100 : 0;

  function chooseFamily(nextFamily: BoxFamily) {
    pulse();
    Keyboard.dismiss();
    setBoxFamily(nextFamily);
    if (nextFamily === "four-square") setDepth("2-1/8");
    if (nextFamily === "four-eleven") setDepth("2-1/8");
  }

  function chooseDepth(nextDepth: string) {
    pulse();
    setDepth(nextDepth);
  }

  function changeQuantity(id: number, change: number) {
    pulse();
    setWires((current) => current.map((wire) =>
      wire.id === id
        ? { ...wire, quantity: Math.max(1, Math.min(999, wire.quantity + change)) }
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

  const boxTitle = boxFamily === "four-square"
    ? "4″ square"
    : boxFamily === "four-eleven"
      ? "4-11/16″ square"
      : "Marked box";

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
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepCopy}>
            <Text style={styles.sectionTitle}>Choose the box</Text>
            <Text style={styles.sectionHint}>Use the shape you see—or its stamped volume.</Text>
          </View>
        </View>

        <View style={styles.boxChoices}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: boxFamily === "four-square" }}
            onPress={() => chooseFamily("four-square")}
            style={({ pressed }) => [
              styles.boxChoice,
              boxFamily === "four-square" && styles.boxChoiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.boxSketch}><View style={styles.knockout} /></View>
            <Text style={styles.boxChoiceTitle}>4″ Square</Text>
            <Text style={styles.boxChoiceHint}>Most common</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: boxFamily === "four-eleven" }}
            onPress={() => chooseFamily("four-eleven")}
            style={({ pressed }) => [
              styles.boxChoice,
              boxFamily === "four-eleven" && styles.boxChoiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.boxSketch, styles.boxSketchLarge]}><View style={styles.knockout} /></View>
            <Text style={styles.boxChoiceTitle}>4-11/16″</Text>
            <Text style={styles.boxChoiceHint}>More room</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: boxFamily === "marked" }}
            onPress={() => chooseFamily("marked")}
            style={({ pressed }) => [
              styles.boxChoice,
              boxFamily === "marked" && styles.boxChoiceSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.stampIcon}><Text style={styles.stampIconText}>in³</Text></View>
            <Text style={styles.boxChoiceTitle}>Stamped</Text>
            <Text style={styles.boxChoiceHint}>Other boxes</Text>
          </Pressable>
        </View>

        {boxFamily === "marked" ? (
          <View style={styles.markedCard}>
            <View style={styles.markedCopy}>
              <Text style={styles.markedLabel}>VOLUME STAMPED INSIDE BOX</Text>
              <TextInput
                accessibilityLabel="Box volume in cubic inches"
                keyboardType="decimal-pad"
                onChangeText={(value) => {
                  if (/^\d*\.?\d{0,2}$/.test(value)) setMarkedVolume(value);
                }}
                placeholder="30.3"
                placeholderTextColor={styles.markedPlaceholder.color}
                returnKeyType="done"
                style={styles.markedInput}
                value={markedVolume}
              />
              <Text style={styles.markedUnit}>cubic inches</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => Keyboard.dismiss()}
              style={({ pressed }) => [styles.doneKeyboardButton, pressed && styles.pressed]}
            >
              <Text style={styles.doneKeyboardButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.depthLabel}>BOX DEPTH</Text>
            <View style={styles.depthRow}>
              {standardOptions.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: depth === option.depth }}
                  key={option.depth}
                  onPress={() => chooseDepth(option.depth)}
                  style={({ pressed }) => [
                    styles.depthChoice,
                    depth === option.depth && styles.depthChoiceSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[
                    styles.depthValue,
                    depth === option.depth && styles.depthValueSelected,
                  ]}>{option.depth}″</Text>
                  <Text style={[
                    styles.depthVolume,
                    depth === option.depth && styles.depthVolumeSelected,
                  ]}>{option.volume.toFixed(1)} in³</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.otherBoxHelp}>
          Gangable, plastic, masonry, octagon, and odd boxes: use the cubic-inch capacity marked by the manufacturer.
        </Text>

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
            <Text style={styles.sectionTitle}>Anything else?</Text>
            <Text style={styles.sectionHint}>Devices and built-in cable clamps take space too.</Text>
          </View>
        </View>

        <View style={styles.extraCard}>
          <View style={styles.extraRow}>
            <View style={styles.extraCopy}>
              <Text style={styles.extraTitle}>Switches or receptacles</Text>
              <Text style={styles.extraHint}>Count each device strap</Text>
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
                <Text style={styles.controlLabel}>LARGEST WIRE ATTACHED TO DEVICE</Text>
                <Text style={styles.deviceSizeValue}>{displayWireSize(deviceWireSize)}</Text>
              </View>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
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
        ]}>
          <View style={styles.resultTopRow}>
            <View>
              <Text style={styles.resultEyebrow}>RESULT</Text>
              <Text style={[
                styles.resultStatus,
                isReady && !result.fits && styles.resultStatusFail,
                !isReady && styles.resultStatusWaiting,
              ]}>
                {!isReady ? "ENTER VOLUME" : result.fits ? "FITS" : "TOO FULL"}
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
                  ? "Enter stamp"
                  : result.fits
                    ? `${result.remainingVolume.toFixed(1)} in³`
                    : nextBox
                      ? `${nextBox.volume.toFixed(1)} in³ box`
                      : `Need ${result.requiredVolume.toFixed(1)} in³`}
              </Text>
              <Text style={styles.detailCaption}>
                {!isReady
                  ? "Look inside the box"
                  : result.fits
                    ? "Remaining capacity"
                    : nextBox
                      ? `${nextBox.family === "four-square" ? "4″ square" : "4-11/16″ square"} · ${nextBox.depth}″ deep`
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
          <Text style={styles.codeNoteTitle}>NEC 2020 / 2023 · 314.16</Text>
          <Text style={styles.codeNoteText}>
            Solid and stranded conductors use the same allowance here. #4 and larger conductors require pull-box sizing under 314.28. Verify the box marking and local requirements.
          </Text>
        </View>
      </ScrollView>

      <Pressable
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
        <View style={[
          styles.liveResultDot,
          isReady && !result.fits && styles.liveResultDotFail,
          !isReady && styles.liveResultDotWaiting,
        ]} />
        <View style={styles.liveResultCopy}>
          <Text style={styles.liveResultStatus}>
            {!isReady ? "ENTER BOX VOLUME" : result.fits ? "FITS" : "TOO FULL"}
          </Text>
          <Text style={styles.liveResultNumbers}>
            {result.requiredVolume.toFixed(1)} in³ needed · {isReady ? `${availableVolume.toFixed(1)} in³ available` : "stamp required"}
          </Text>
        </View>
        <Text style={styles.liveResultArrow}>↑</Text>
      </Pressable>

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
