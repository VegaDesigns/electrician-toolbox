import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BEND_ANGLES,
  calculateFourPointSaddle,
  calculateOffset,
  calculateRollingOffset,
  calculateStub,
  calculateThreePointSaddle,
  calculateTowardObstructionMarks,
  isPositiveMeasurement,
  type BendAngle,
} from "../../utils/bending/calculations";
import { formatFeetInches, roundInches } from "../../utils/calc/measure";
import { parseFlexibleNumber } from "../../utils/calc/parser";
import {
  DEFAULT_BENDING_PREFERENCES,
  loadBendingPreferences,
  saveBendingPreferences,
  type BendingPreferences,
  type ConduitSize,
} from "../../utils/storage/bendingPreferences";
import { styles } from "./styles";

type ToolId = "offset" | "rolling" | "stub" | "saddle3" | "saddle4";

type ToolDefinition = {
  id: ToolId;
  name: string;
  eyebrow: string;
  description: string;
  icon: string;
};

const TOOLS: ToolDefinition[] = [
  { id: "offset", name: "Two-bend offset", eyebrow: "MOST USED", description: "Clear an obstruction with spacing and shrink.", icon: "⌁" },
  { id: "rolling", name: "Rolling offset", eyebrow: "RISE + ROLL", description: "Move sideways and vertically in one run.", icon: "⤢" },
  { id: "stub", name: "90° stub-up", eyebrow: "TAKE-UP", description: "Find the arrow mark using your bender deduct.", icon: "↱" },
  { id: "saddle3", name: "3-point saddle", eyebrow: "ROUND OBSTACLES", description: "Three marks with a 45° center bend.", icon: "⌃" },
  { id: "saddle4", name: "4-point saddle", eyebrow: "WIDE OBSTACLES", description: "Two matched offsets around a wide obstruction.", icon: "▱" },
];

const CONDUIT_SIZES: ConduitSize[] = ["1/2", "3/4", "1"];

function tap() {
  Haptics.selectionAsync().catch(() => {});
}

function parseMeasurement(value: string): number | null {
  return parseFlexibleNumber(value.replace(/[″"]/g, "").trim());
}

function fieldMeasurement(value: number): string {
  return formatFeetInches(roundInches(value, 16), 16);
}

function Header({ activeTool, onBack }: { activeTool: ToolDefinition | null; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={activeTool ? "Return to bending tools" : "Return to toolbox home"}
        accessibilityRole="button"
        onPress={() => { tap(); onBack(); }}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backButtonText}>← {activeTool ? "Tools" : "Home"}</Text>
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.headerEyebrow}>CONDUIT</Text>
        <Text numberOfLines={1} style={styles.headerTitle}>{activeTool?.name ?? "Bending Suite"}</Text>
      </View>
    </View>
  );
}

function ConduitPicker({ value, onChange }: { value: ConduitSize; onChange: (value: ConduitSize) => void }) {
  return (
    <View style={styles.conduitPicker}>
      <View style={styles.pickerLabelGroup}>
        <Text style={styles.pickerLabel}>CONDUIT SIZE</Text>
        <Text style={styles.pickerSubLabel}>EMT hand bender</Text>
      </View>
      <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
        {CONDUIT_SIZES.map((size) => {
          const selected = size === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={size}
              onPress={() => { tap(); onChange(size); }}
              style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{size}″</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ToolCard({ tool, onPress }: { tool: ToolDefinition; onPress: () => void }) {
  return (
    <Pressable
      accessibilityHint={`Opens the ${tool.name} calculator`}
      accessibilityRole="button"
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [styles.toolCard, pressed && styles.pressed]}
    >
      <View style={styles.toolIcon}><Text style={styles.toolIconText}>{tool.icon}</Text></View>
      <View style={styles.toolCardCopy}>
        <Text style={styles.toolEyebrow}>{tool.eyebrow}</Text>
        <Text style={styles.toolTitle}>{tool.name}</Text>
        <Text style={styles.toolDescription}>{tool.description}</Text>
      </View>
      <Text style={styles.toolArrow}>›</Text>
    </Pressable>
  );
}

function MeasurementInput({ label, value, onChangeText, placeholder, hint }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; hint?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#626D78"
          selectTextOnFocus
          style={styles.input}
          value={value}
        />
        <Text style={styles.inputUnit}>IN</Text>
      </View>
      {hint ? <Text style={styles.inputHint}>{hint}</Text> : null}
    </View>
  );
}

function AnglePicker({ value, onChange, values = BEND_ANGLES }: {
  value: BendAngle; onChange: (value: BendAngle) => void; values?: readonly BendAngle[];
}) {
  return (
    <View style={styles.angleGroup}>
      <Text style={styles.inputLabel}>BEND ANGLE</Text>
      <View accessibilityRole="radiogroup" style={styles.angleRow}>
        {values.map((angle) => {
          const selected = angle === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={angle}
              onPress={() => { tap(); onChange(angle); }}
              style={({ pressed }) => [styles.angleButton, selected && styles.angleButtonSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.angleText, selected && styles.angleTextSelected]}>{angle}°</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BendDiagram({ kind }: { kind: ToolId }) {
  if (kind === "stub") {
    return (
      <View accessibilityElementsHidden style={styles.diagram}>
        <View style={[styles.pipe, styles.stubHorizontal]} /><View style={[styles.pipe, styles.stubVertical]} />
        <View style={[styles.diagramMark, styles.stubMark]} /><Text style={[styles.diagramLabel, styles.stubLabel]}>90°</Text>
      </View>
    );
  }
  if (kind === "saddle3") {
    return (
      <View accessibilityElementsHidden style={styles.diagram}>
        <View style={[styles.pipe, styles.saddleLeft]} /><View style={[styles.pipe, styles.saddleRiseLeft]} />
        <View style={[styles.pipe, styles.saddleRiseRight]} /><View style={[styles.pipe, styles.saddleRight]} />
        <View style={[styles.diagramMark, styles.saddleMarkOne]} /><View style={[styles.diagramMark, styles.saddleMarkTwo]} />
        <View style={[styles.diagramMark, styles.saddleMarkThree]} />
      </View>
    );
  }
  if (kind === "saddle4") {
    return (
      <View accessibilityElementsHidden style={styles.diagram}>
        <View style={[styles.pipe, styles.fourLeft]} /><View style={[styles.pipe, styles.fourRiseLeft]} />
        <View style={[styles.pipe, styles.fourTop]} /><View style={[styles.pipe, styles.fourRiseRight]} />
        <View style={[styles.pipe, styles.fourRight]} />
        {[styles.fourMarkOne, styles.fourMarkTwo, styles.fourMarkThree, styles.fourMarkFour].map((markStyle, index) => (
          <View key={index} style={[styles.diagramMark, markStyle]} />
        ))}
      </View>
    );
  }
  return (
    <View accessibilityElementsHidden style={styles.diagram}>
      <View style={[styles.pipe, styles.offsetStart]} /><View style={[styles.pipe, styles.offsetRise]} />
      <View style={[styles.pipe, styles.offsetEnd]} /><View style={[styles.diagramMark, styles.offsetMarkOne]} />
      <View style={[styles.diagramMark, styles.offsetMarkTwo]} />
      {kind === "rolling" ? <Text style={styles.rollingLabel}>RISE + ROLL</Text> : null}
    </View>
  );
}

function ResultRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.resultRow, accent && styles.resultRowAccent]}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text selectable style={[styles.resultValue, accent && styles.resultValueAccent]}>{value}</Text>
    </View>
  );
}

function ResultsCard({ title, children, note }: { title: string; children: React.ReactNode; note: string }) {
  return (
    <View style={styles.resultsCard}>
      <View style={styles.resultsHeader}>
        <View><Text style={styles.resultsEyebrow}>TAPE-READY LAYOUT</Text><Text style={styles.resultsTitle}>{title}</Text></View>
        <View style={styles.readyBadge}><Text style={styles.readyBadgeText}>READY</Text></View>
      </View>
      <View style={styles.resultsList}>{children}</View>
      <Text style={styles.resultNote}>{note}</Text>
    </View>
  );
}

function EmptyResults({ message }: { message: string }) {
  return (
    <View style={styles.emptyResults}>
      <Text style={styles.emptyResultsIcon}>↟</Text><Text style={styles.emptyResultsText}>{message}</Text>
    </View>
  );
}

function CalculatorShell({ tool, children }: { tool: ToolDefinition; children: React.ReactNode }) {
  return (
    <>
      <View style={styles.calculatorHero}>
        <View style={styles.calculatorHeroTop}>
          <View style={styles.largeToolIcon}><Text style={styles.largeToolIconText}>{tool.icon}</Text></View>
          <Text style={styles.calculatorEyebrow}>{tool.eyebrow}</Text>
        </View>
        <Text style={styles.calculatorTitle}>{tool.name}</Text>
        <Text style={styles.calculatorDescription}>{tool.description}</Text>
        <BendDiagram kind={tool.id} />
      </View>
      {children}
    </>
  );
}

function OffsetCalculator() {
  const [heightText, setHeightText] = useState("4");
  const [targetText, setTargetText] = useState("");
  const [angle, setAngle] = useState<BendAngle>(30);
  const height = parseMeasurement(heightText);
  const target = parseMeasurement(targetText);
  const result = isPositiveMeasurement(height) ? calculateOffset(height, angle) : null;
  const marks = result && isPositiveMeasurement(target) ? calculateTowardObstructionMarks(target, result) : null;
  return (
    <CalculatorShell tool={TOOLS[0]}>
      <View style={styles.formCard}>
        <View style={styles.inputGrid}>
          <MeasurementInput label="OFFSET HEIGHT" onChangeText={setHeightText} placeholder="4 or 4 1/2" value={heightText} />
          <MeasurementInput hint="Optional · working toward it" label="TO OBSTRUCTION" onChangeText={setTargetText} placeholder="e.g. 36" value={targetText} />
        </View>
        <AnglePicker onChange={setAngle} value={angle} />
      </View>
      {result ? (
        <ResultsCard note="Working toward an obstruction: add shrink to the obstruction distance. Working away: ignore shrink and space the two marks apart." title="Mark the offset">
          <ResultRow accent label="SPACE BETWEEN MARKS" value={fieldMeasurement(result.spacing)} />
          <ResultRow label="SHRINK" value={fieldMeasurement(result.shrink)} /><ResultRow label="MULTIPLIER" value={`${result.multiplier.toFixed(2)}×`} />
          {marks ? <><ResultRow label="MARK 1 FROM END" value={fieldMeasurement(marks.firstMark)} /><ResultRow label="MARK 2 · NEAR OBSTRUCTION" value={fieldMeasurement(marks.secondMark)} /></> : null}
        </ResultsCard>
      ) : <EmptyResults message="Enter a positive offset height to calculate the marks." />}
    </CalculatorShell>
  );
}

function RollingOffsetCalculator() {
  const [riseText, setRiseText] = useState("3");
  const [rollText, setRollText] = useState("4");
  const [targetText, setTargetText] = useState("");
  const [angle, setAngle] = useState<BendAngle>(30);
  const rise = parseMeasurement(riseText);
  const roll = parseMeasurement(rollText);
  const target = parseMeasurement(targetText);
  const result = isPositiveMeasurement(rise) && isPositiveMeasurement(roll) ? calculateRollingOffset(rise, roll, angle) : null;
  const marks = result && isPositiveMeasurement(target) ? calculateTowardObstructionMarks(target, result) : null;
  return (
    <CalculatorShell tool={TOOLS[1]}>
      <View style={styles.formCard}>
        <View style={styles.inputGrid}>
          <MeasurementInput label="VERTICAL RISE" onChangeText={setRiseText} placeholder="3" value={riseText} />
          <MeasurementInput label="SIDEWAYS ROLL" onChangeText={setRollText} placeholder="4" value={rollText} />
        </View>
        <MeasurementInput hint="Optional · distance to obstruction" label="TARGET DISTANCE" onChangeText={setTargetText} placeholder="e.g. 36" value={targetText} />
        <AnglePicker onChange={setAngle} value={angle} />
      </View>
      {result ? (
        <ResultsCard note="Keep both bends in the same rolled plane. Mark a straight reference line on the conduit before rotating it." title="Mark the rolling offset">
          <ResultRow accent label="TRUE OFFSET" value={fieldMeasurement(result.trueOffset)} /><ResultRow label="SPACE BETWEEN MARKS" value={fieldMeasurement(result.spacing)} />
          <ResultRow label="SHRINK" value={fieldMeasurement(result.shrink)} />
          {marks ? <><ResultRow label="MARK 1 FROM END" value={fieldMeasurement(marks.firstMark)} /><ResultRow label="MARK 2 · NEAR OBSTRUCTION" value={fieldMeasurement(marks.secondMark)} /></> : null}
        </ResultsCard>
      ) : <EmptyResults message="Enter a positive rise and roll to calculate the true offset." />}
    </CalculatorShell>
  );
}

function StubCalculator({ preferences, onDeductChange }: { preferences: BendingPreferences; onDeductChange: (value: number) => void }) {
  const [heightText, setHeightText] = useState("18");
  const [deductText, setDeductText] = useState(String(preferences.deducts[preferences.conduitSize]));
  const height = parseMeasurement(heightText);
  const deduct = parseMeasurement(deductText);
  const result = isPositiveMeasurement(height) && isPositiveMeasurement(deduct) ? calculateStub(height, deduct) : null;
  const valid = result && result.mark > 0;
  function updateDeduct(value: string) {
    setDeductText(value);
    const parsed = parseMeasurement(value);
    if (isPositiveMeasurement(parsed)) onDeductChange(parsed);
  }
  return (
    <CalculatorShell tool={TOOLS[2]}>
      <View style={styles.formCard}><View style={styles.inputGrid}>
        <MeasurementInput label="FINISHED STUB HEIGHT" onChangeText={setHeightText} placeholder="18" value={heightText} />
        <MeasurementInput hint="Saved for this conduit size" label="BENDER DEDUCT" onChangeText={updateDeduct} placeholder="Check bender" value={deductText} />
      </View></View>
      {valid ? (
        <ResultsCard note="Measure from the conduit end, align the bender arrow with this mark, and bend to 90°. Verify the deduct stamped on your specific bender." title="Mark the stub-up">
          <ResultRow accent label="ARROW MARK FROM END" value={fieldMeasurement(result.mark)} /><ResultRow label="FINISHED HEIGHT" value={fieldMeasurement(height!)} />
          <ResultRow label="BENDER DEDUCT" value={fieldMeasurement(deduct!)} />
        </ResultsCard>
      ) : <EmptyResults message="The stub height must be greater than your bender deduct." />}
    </CalculatorShell>
  );
}

function ThreePointSaddleCalculator() {
  const [heightText, setHeightText] = useState("2");
  const [centerText, setCenterText] = useState("30");
  const height = parseMeasurement(heightText);
  const center = parseMeasurement(centerText);
  const result = isPositiveMeasurement(height) && isPositiveMeasurement(center) ? calculateThreePointSaddle(height, center) : null;
  const valid = result && result.firstMark > 0;
  return (
    <CalculatorShell tool={TOOLS[3]}>
      <View style={styles.formCard}>
        <View style={styles.inputGrid}><MeasurementInput label="SADDLE HEIGHT" onChangeText={setHeightText} placeholder="2" value={heightText} /><MeasurementInput label="END TO OBSTACLE CENTER" onChangeText={setCenterText} placeholder="30" value={centerText} /></View>
        <View style={styles.fixedAngleStrip}><Text style={styles.fixedAngleLabel}>STANDARD ANGLES</Text><Text style={styles.fixedAngleValue}>22.5° · 45° · 22.5°</Text></View>
      </View>
      {valid ? (
        <ResultsCard note="Make the 45° center bend first. Reverse the conduit for each 22.5° outside bend and keep all three bends in the same plane." title="Mark the 3-point saddle">
          <ResultRow label="MARK 1 · 22.5°" value={fieldMeasurement(result.firstMark)} /><ResultRow accent label="MARK 2 · 45° CENTER" value={fieldMeasurement(result.centerMark)} />
          <ResultRow label="MARK 3 · 22.5°" value={fieldMeasurement(result.thirdMark)} /><ResultRow label="CENTER TO OUTSIDE" value={fieldMeasurement(result.outsideSpacing)} />
          <ResultRow label="SHRINK ALLOWANCE" value={fieldMeasurement(result.shrink)} />
        </ResultsCard>
      ) : <EmptyResults message="Enter a center distance long enough to fit the first saddle mark." />}
    </CalculatorShell>
  );
}

function FourPointSaddleCalculator() {
  const [heightText, setHeightText] = useState("4");
  const [widthText, setWidthText] = useState("10");
  const [firstMarkText, setFirstMarkText] = useState("");
  const [angle, setAngle] = useState<BendAngle>(30);
  const height = parseMeasurement(heightText);
  const width = parseMeasurement(widthText);
  const firstMark = parseMeasurement(firstMarkText);
  const result = isPositiveMeasurement(height) && isPositiveMeasurement(width) ? calculateFourPointSaddle(height, width, angle) : null;
  const hasFirstMark = isPositiveMeasurement(firstMark);
  return (
    <CalculatorShell tool={TOOLS[4]}>
      <View style={styles.formCard}>
        <View style={styles.inputGrid}><MeasurementInput label="SADDLE HEIGHT" onChangeText={setHeightText} placeholder="4" value={heightText} /><MeasurementInput label="OBSTACLE WIDTH" onChangeText={setWidthText} placeholder="10" value={widthText} /></View>
        <MeasurementInput hint="Optional · converts spacing into four tape marks" label="FIRST MARK FROM END" onChangeText={setFirstMarkText} placeholder="e.g. 24" value={firstMarkText} />
        <AnglePicker onChange={setAngle} value={angle} values={[22.5, 30, 45]} />
      </View>
      {result ? (
        <ResultsCard note="Bend the first pair as an offset, then mirror the second pair. Keep both pairs in the same plane and verify clearance before the final bend." title="Mark the 4-point saddle">
          <ResultRow accent label="EACH OFFSET SPACING" value={fieldMeasurement(result.firstToSecond)} /><ResultRow label="BETWEEN INNER MARKS" value={fieldMeasurement(result.secondToThird)} />
          <ResultRow label="TOTAL MARK LAYOUT" value={fieldMeasurement(result.totalLayout)} /><ResultRow label="TOTAL SHRINK" value={fieldMeasurement(result.totalShrink)} />
          {hasFirstMark ? <><ResultRow label="MARK 1" value={fieldMeasurement(firstMark)} /><ResultRow label="MARK 2" value={fieldMeasurement(firstMark + result.firstToSecond)} /><ResultRow label="MARK 3" value={fieldMeasurement(firstMark + result.firstToSecond + result.secondToThird)} /><ResultRow label="MARK 4" value={fieldMeasurement(firstMark + result.totalLayout)} /></> : null}
        </ResultsCard>
      ) : <EmptyResults message="Enter a positive saddle height and obstacle width." />}
    </CalculatorShell>
  );
}

function SuiteHome({ onChoose }: { onChoose: (tool: ToolId) => void }) {
  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}><View style={styles.heroIcon}><Text style={styles.heroIconText}>↱</Text></View><View style={styles.offlineBadge}><View style={styles.onlineDot} /><Text style={styles.offlineBadgeText}>WORKS OFFLINE</Text></View></View>
        <Text style={styles.eyebrow}>FIELD BENDING</Text><Text style={styles.title}>What are you bending?</Text>
        <Text style={styles.description}>Pick a layout. Every result rounds to the nearest 1/16″ and stays on this device.</Text><BendDiagram kind="offset" />
      </View>
      <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>BENDING TOOLS</Text><Text style={styles.sectionCount}>{TOOLS.length} CALCULATORS</Text></View>
      <View style={styles.toolList}>{TOOLS.map((tool) => <ToolCard key={tool.id} onPress={() => onChoose(tool.id)} tool={tool} />)}</View>
      <View style={styles.fieldNote}><Text style={styles.fieldNoteIcon}>!</Text><Text style={styles.fieldNoteText}>Centerline calculations are a starting point. Verify your bender’s markings, deduct, shoe radius, and springback before production bends.</Text></View>
    </>
  );
}

export default function BendingScreen() {
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const [preferences, setPreferences] = useState<BendingPreferences>(DEFAULT_BENDING_PREFERENCES);
  const activeTool = useMemo(() => TOOLS.find((tool) => tool.id === activeToolId) ?? null, [activeToolId]);
  useEffect(() => {
    let active = true;
    loadBendingPreferences().then((loaded) => { if (active) setPreferences(loaded); });
    return () => { active = false; };
  }, []);
  function updatePreferences(next: BendingPreferences) {
    setPreferences(next);
    saveBendingPreferences(next).catch(() => {});
  }
  function handleBack() {
    if (activeToolId) { setActiveToolId(null); return; }
    router.replace("/");
  }
  function renderCalculator() {
    if (activeToolId === "offset") return <OffsetCalculator />;
    if (activeToolId === "rolling") return <RollingOffsetCalculator />;
    if (activeToolId === "stub") return <StubCalculator key={preferences.conduitSize} onDeductChange={(deduct) => updatePreferences({ ...preferences, deducts: { ...preferences.deducts, [preferences.conduitSize]: deduct } })} preferences={preferences} />;
    if (activeToolId === "saddle3") return <ThreePointSaddleCalculator />;
    if (activeToolId === "saddle4") return <FourPointSaddleCalculator />;
    return <SuiteHome onChoose={setActiveToolId} />;
  }
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <Header activeTool={activeTool} onBack={handleBack} />
      <ScrollView bounces={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ConduitPicker onChange={(conduitSize) => updatePreferences({ ...preferences, conduitSize })} value={preferences.conduitSize} />
        {renderCalculator()}
      </ScrollView>
    </SafeAreaView>
  );
}
