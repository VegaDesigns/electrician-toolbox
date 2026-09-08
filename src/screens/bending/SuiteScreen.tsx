import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  ANGLES,
  BENDS,
  Bend,
  Draft,
  Field,
  Method,
  Precision,
  calculate,
  inches,
  initialDraft,
  parseInches,
} from "../../utils/bending/bending";
import { fitForDraft } from "../../utils/bending/feasibility";
import { BendPreview } from "./BendPreview";
import { StubPreview } from "./StubPreview";
import { styles as s } from "./suiteStyles";

const KEY = "bending-suite-v1";
const sizes = [
  { name: "½″", deduct: 5 },
  { name: "¾″", deduct: 6 },
  { name: "1″", deduct: 8 },
  { name: "1¼″", deduct: 11 },
];
type Settings = {
  size: number;
  deduction: number;
  precision: Precision;
  method: Method;
};
const defaults: Settings = {
  size: 1,
  deduction: 6,
  precision: 16,
  method: "field",
};
const newDrafts = () =>
  Object.fromEntries(BENDS.map((b) => [b.id, initialDraft(b.id)])) as Record<
    Bend,
    Draft
  >;
function Button({
  label,
  onPress,
  selected = false,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        label === "←"
          ? "Return to toolbox home"
          : label === "⚙"
            ? "Bender settings"
            : label
      }
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        selected && s.selected,
        primary && s.primary,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[s.text, selected && s.amber, primary && s.inverse]}>
        {label}
      </Text>
    </Pressable>
  );
}
export default function SuiteScreen() {
  const insets = useSafeAreaInsets();
  const [bend, setBend] = useState<Bend>("stub"),
    [drafts, setDrafts] = useState(newDrafts),
    [settings, setSettings] = useState(defaults),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState("");
  const [finished, setFinished] = useState(false),
    [sheet, setSheet] = useState<
      "bends" | "settings" | "help" | "input" | null
    >(null),
    [editing, setEditing] = useState<Field | "deduction">("height"),
    [text, setText] = useState(""),
    [inputError, setInputError] = useState(""),
    [feedbackError, setFeedbackError] = useState(""),
    [referenceError, setReferenceError] = useState(""),
    [copied, setCopied] = useState(false);
  const queue = useRef(Promise.resolve());
  const draft = drafts[bend],
    calc = calculate(
      bend,
      draft,
      settings.deduction,
      settings.method,
      settings.precision,
    ),
    r = calc.result,
    b = BENDS.find((b) => b.id === bend)!;
  const fit = r ? fitForDraft(bend, r, draft, settings.size, settings.deduction, settings.method, settings.precision) : null;
  const strongFitWarning = fit?.issues.some(i => i.blocksLayout || i.title === "Likely too tight for the bender" || i.title === "Tight back-to-back bends") ?? false;
  const layoutBlocked = fit?.issues.some(i => i.blocksLayout) ?? false;
  const f = (n: number) => inches(n, settings.precision);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const data = JSON.parse(raw);
        if (data.settings) {
          const v = data.settings;
          setSettings({
            size:
              Number.isInteger(v.size) && v.size >= 0 && v.size < 4
                ? v.size
                : 1,
            deduction:
              typeof v.deduction === "number" &&
              v.deduction > 0 &&
              v.deduction <= 48
                ? v.deduction
                : 6,
            precision: [8, 16, 32].includes(v.precision) ? v.precision : 16,
            method: v.method === "geometry" ? "geometry" : "field",
          });
        }
        if (BENDS.some((b) => b.id === data.bend)) setBend(data.bend);
        if (data.drafts) {
          const next = newDrafts();
          for (const b of BENDS) {
            const saved = data.drafts[b.id];
            if (!saved) continue;
            for (const key of [
              "height",
              "roll",
              "bridge",
              "span",
              "location",
            ] as Field[])
              if (typeof saved[key] === "string" && saved[key].length < 40)
                next[b.id][key] = saved[key];
            if (ANGLES.includes(saved.angle)) next[b.id].angle = saved.angle;
            if ([45, 60].includes(saved.center))
              next[b.id].center = saved.center;
          }
          setDrafts(next);
        }
      })
      .catch(() => {
        if (active)
          setStorageError(
            "Previous setup could not be restored. Changes will not replace it until you retry.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || storageError) return;
    const payload = JSON.stringify({ settings, bend, drafts });
    queue.current = queue.current
      .then(() => AsyncStorage.setItem(KEY, payload))
      .catch(() =>
        setStorageError(
          "Your setup could not be saved on this device. You can still calculate.",
        ),
      );
  }, [ready, settings, bend, drafts, storageError]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);
  const previewKey = `${bend}:${JSON.stringify(draft)}:${settings.deduction}:${settings.method}:${settings.precision}:${settings.size}`;
  function applySettings(change: Partial<Settings>) {
    setSettings(v => ({ ...v, ...change })); setFinished(false); setCopied(false);
  }
  function update(change: Partial<Draft>) {
    setFinished(false);
    setDrafts((v) => ({ ...v, [bend]: { ...v[bend], ...change } }));
    setCopied(false);
  }
  function openInput(field: Field | "deduction") {
    setEditing(field);
    setText(field === "deduction" ? String(settings.deduction) : draft[field]);
    setInputError("");
    setSheet("input");
  }
  function done() {
    const n = parseInches(text);
    if (editing === "location" && !text.trim()) {
      update({ location: "" });
      setSheet(null);
      return;
    }
    if (
      n === null ||
      n < 0 ||
      (editing !== "location" && n === 0) ||
      (editing === "deduction" && n > 48)
    ) {
      setInputError(
        "Enter a valid measurement, such as 6, 6.5, or 6 1/2 inches.",
      );
      return;
    }
    if (editing === "deduction") applySettings({ deduction: n });
    else update({ [editing]: text.trim() });
    setSheet(null);
  }
  const labels: Record<Field | "deduction", string> = {
    height:
      bend === "stub"
        ? "Finished stub height"
        : bend === "rolling"
          ? "Rise"
          : bend === "saddle3" || bend === "saddle4"
            ? "Obstacle height"
            : "Offset height",
    roll: "Sideways travel",
    bridge: "Between inner marks",
    span: "Outside back-to-back",
    location:
      bend === "saddle3" ? "Obstacle center from tip" : "First mark from tip",
    deduction: "Bender deduction",
  };
  function tile(field: Field) {
    const n = parseInches(draft[field]);
    return (
      <Pressable
        key={field}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${labels[field]}`}
        style={s.inputTile}
        onPress={() => openInput(field)}
      >
        <Text style={s.muted}>{labels[field]} ↗</Text>
        <Text style={s.inputValue}>{n === null ? "Set location" : f(n)}</Text>
      </Pressable>
    );
  }
  async function copy() {
    if (!r || layoutBlocked) return;
    setFeedbackError("");
    try {
      await Clipboard.setStringAsync(
        `${b.title} · ${sizes[settings.size].name} EMT\n${r.label}: ${f(r.value)}\n${r.origin}\n${r.steps.join("\n")}\n${[...r.warnings, ...(fit?.issues.map(i => `${i.title}: ${i.message}`) ?? [])].join("\n")}\n${r.method}. Nearest 1/${settings.precision} inch. Verify with your bender.`,
      );
      setCopied(true);
    } catch {
      setFeedbackError("Could not copy. Please try again.");
    }
  }
  function openGuide(url: string) {
    setReferenceError("");
    Linking.openURL(url).catch(() =>
      setReferenceError(
        "Could not open the guide. Check your connection and try again.",
      ),
    );
  }
  if (!ready)
    return (
      <SafeAreaView style={s.safe}>
        <Text style={[s.muted, { padding: 24 }]}>
          Loading your bender setup…
        </Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView edges={["top", "bottom"]} style={s.safe}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Return to toolbox home"
          onPress={() => router.replace("/")} style={({ pressed }) => [s.homeButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={s.homeIcon}>⌂</Text><Text style={s.homeLabel}>Toolbox</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Change bend from header, currently ${b.title}`}
          onPress={() => setSheet("bends")} style={[s.grow, { minHeight: 48, justifyContent: "center", gap: 3 }]}>
          <Text style={s.headerTitle}>Bending Suite</Text>
          <Text style={s.label}>{b.title} ⌄</Text>
        </Pressable>
        <Button label="⚙" onPress={() => setSheet("settings")} />
      </View>
      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
      >
        {feedbackError ? (
          <Text accessibilityRole="alert" style={s.error}>
            {feedbackError}
          </Text>
        ) : null}
        {storageError ? (
          <View style={s.card}>
            <Text style={s.error}>{storageError}</Text>
            <Button
              label="Retry saving current setup"
              onPress={() => setStorageError("")}
            />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Change bend type, currently ${b.title}`}
          onPress={() => setSheet("bends")}
          style={[s.card, s.row]}
        >
          <Text style={[s.title, s.amber]}>{b.icon}</Text>
          <View style={s.grow}>
            <Text style={s.eyebrow}>BEND TYPE</Text>
            <Text style={s.title}>{b.title}</Text>
            <Text style={s.muted}>{b.hint}</Text>
          </View>
          <Text style={s.changeBend}>Change
bend ⌄</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSheet("settings")}
        >
          <Text style={s.muted}>
            {sizes[settings.size].name} EMT · Hand bender ⚙
          </Text>
        </Pressable>
        <View style={s.card}>
          <Text style={s.eyebrow}>YOUR MEASUREMENTS · INCHES</Text>
          <View style={s.wrap}>
            {tile(bend === "back" ? "span" : "height")}
            {bend === "rolling" && tile("roll")}
            {bend === "saddle4" && tile("bridge")}
          </View>
          {bend === "saddle4" && (
            <Text style={s.muted}>
              Bridge = distance between marks 2 and 3, not the clear width of
              the obstacle. Allow room for the bends.
            </Text>
          )}
          {!["stub", "back"].includes(bend) && (
            <>
              <Text style={s.muted}>
                {bend === "saddle3"
                  ? "Center bend · returns are half this angle"
                  : "Angle of each bend"}
              </Text>
              <View style={s.wrap}>
                {(bend === "saddle3" ? [45, 60] : ANGLES).map((a) => (
                  <Button
                    key={a}
                    label={`${a}°`}
                    selected={
                      (bend === "saddle3" ? draft.center : draft.angle) === a
                    }
                    onPress={() =>
                      bend === "saddle3"
                        ? update({ center: a as 45 | 60 })
                        : update({ angle: a as Draft["angle"] })
                    }
                  />
                ))}
              </View>
            </>
          )}
          {!["stub", "back"].includes(bend) && (
            draft.location ? (
              <View style={s.savedLocation}>
                <Text style={[s.text, s.grow]}>
                  {`${labels.location}: ${f(parseInches(draft.location) ?? 0)}`}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${labels.location}`}
                  onPress={() => openInput("location")}
                  style={({ pressed }) => [s.locationEdit, { opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={s.label}>Edit</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel={`Add ${labels.location}, optional`}
                onPress={() => openInput("location")}
                style={({ pressed }) => [s.locationButton, { opacity: pressed ? 0.7 : 1 }]}>
                <Text style={s.locationIcon}>＋</Text>
                <Text style={s.locationText}>{`Add ${bend === "saddle3" ? "obstacle center" : "first mark"}`}</Text>
                <Text style={s.muted}>optional</Text>
              </Pressable>
            )
          )}
        </View>
        {fit && fit.issues.length > 0 && <View style={[s.fitWarning, !strongFitWarning && s.fitReminder]} accessibilityRole="alert">
          {fit.issues.map(issue => <View key={issue.title} style={{ gap: 4 }}>
            <Text style={s.label}>{issue.title}</Text><Text style={s.fitBody}>{issue.message}</Text>
          </View>)}
          {strongFitWarning && <Text style={s.muted}>Reference shoe only. Match your actual bender; clearance can require more room.</Text>}
          {layoutBlocked && <Button label="Change precision" onPress={() => setSheet("settings")} />}
          {fit.suggestedAngle !== undefined && <Button label={`Try ${fit.suggestedAngle}° · more spacing`}
            onPress={() => { update({ angle: fit.suggestedAngle! }); setFinished(false); }} />}
          <Pressable accessibilityRole="button" onPress={() => setSheet("help")} style={s.locationEdit}>
            <Text style={s.label}>How this is checked</Text>
          </Pressable>
        </View>}
        {!layoutBlocked && <View style={s.card}>
          {r && !layoutBlocked && bend === "stub" ? (
            <StubPreview
              key={previewKey}
              result={r}
              precision={settings.precision}
              finished={finished}
              onFinishedChange={setFinished}
              copied={copied}
              onCopy={copy}
              onHelp={() => setSheet("help")}
            />
          ) : r && !layoutBlocked ? (
            <BendPreview
              key={previewKey}
              bend={bend as Exclude<Bend, "stub">}
              result={r}
              precision={settings.precision}
              finished={finished}
              onFinishedChange={setFinished}
              copied={copied}
              onCopy={copy}
              onHelp={() => setSheet("help")}
            />
          ) : (
            <View style={{ minHeight: 280, justifyContent: "center", gap: 16 }}>
              <Text accessibilityRole="alert" style={s.error}>
                {calc.error ?? fit?.issues.find(i => i.blocksLayout)?.message}
              </Text>
              <Button
                label="Bender help and references"
                onPress={() => setSheet("help")}
              />
            </View>
          )}
        </View>}
      </ScrollView>
      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <KeyboardAvoidingView
          style={s.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              s.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                paddingTop: 20,
                marginTop: insets.top + 12,
              },
            ]}
          >
            <View style={s.row}>
              <Text style={[s.title, s.grow]}>
                {sheet === "bends"
                  ? "Choose a bend"
                  : sheet === "settings"
                    ? "Bender setup"
                    : sheet === "help"
                      ? "Before you bend"
                      : labels[editing]}
              </Text>
              <Button
                label={sheet === "input" ? "Cancel" : "Done"}
                onPress={() => setSheet(null)}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.sheetBody}
            >
              {sheet === "bends" &&
                BENDS.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: bend === item.id }}
                    onPress={() => {
                      setBend(item.id);
                      if (item.id !== bend) setFinished(false);
                      setCopied(false);
                      setSheet(null);
                    }}
                    style={[s.card, s.row, bend === item.id && s.selected]}
                  >
                    <Text style={[s.title, s.amber]}>{item.icon}</Text>
                    <View style={s.grow}>
                      <Text style={s.text}>{item.title}</Text>
                      <Text style={s.muted}>{item.hint}</Text>
                    </View>
                  </Pressable>
                ))}
              {sheet === "input" && (
                <>
                  <Text style={s.muted}>
                    Inches only. Decimals and fractions both work: 6.5 or 6 1/2.
                    {editing === "location"
                      ? " Leave blank to use relative marks."
                      : ""}
                  </Text>
                  {editing === "location" && (
                    <Text style={s.muted}>
                      {bend === "saddle3"
                        ? "Enter the obstacle center from the pipe end. The center-location correction is included in your marks."
                        : "This sets absolute marks from the pipe end. Estimated shrink is not automatically added to your first mark."}
                    </Text>
                  )}
                  <TextInput
                    autoFocus
                    selectTextOnFocus
                    accessibilityLabel={labels[editing]}
                    style={s.input}
                    value={text}
                    onChangeText={(v) => {
                      setText(v);
                      setInputError("");
                    }}
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="done"
                    onSubmitEditing={done}
                    maxLength={24}
                  />
                  {inputError ? (
                    <Text style={s.error}>{inputError}</Text>
                  ) : null}
                  <Button label="Enter" onPress={done} primary />
                </>
              )}
              {sheet === "settings" && (
                <>
                  <Text style={s.eyebrow}>EMT · MATCH YOUR ACTUAL SHOE</Text>
                  <View style={s.wrap}>
                    {sizes.map((v, i) => (
                      <Button
                        key={i}
                        label={v.name}
                        selected={settings.size === i}
                        onPress={() =>
                          applySettings({ size: i, deduction: v.deduct })
                        }
                      />
                    ))}
                  </View>
                  <Text style={s.muted}>
                    Common hand-bender starting values for EMT. Match the
                    deduction stamped on your shoe; it can vary by model. For
                    1¼″ EMT, tools may specify 11″ or 12″—check yours.
                  </Text>
                  <Button
                    label={`90° deduction: ${f(settings.deduction)} · Change`}
                    onPress={() => openInput("deduction")}
                  />
                  <Text style={s.eyebrow}>TAPE-MEASURE PRECISION</Text>
                  <View style={s.wrap}>
                    {([8, 16, 32] as Precision[]).map((p) => (
                      <Button
                        key={p}
                        label={`1/${p}″`}
                        selected={settings.precision === p}
                        onPress={() =>
                          applySettings({ precision: p })
                        }
                      />
                    ))}
                  </View>
                  <Text style={s.eyebrow}>OFFSET CALCULATION</Text>
                  <Button
                    label="Hand-bender multipliers"
                    selected={settings.method === "field"}
                    onPress={() =>
                      applySettings({ method: "field" })
                    }
                  />
                  <Button
                    label="Ideal geometry · advanced"
                    selected={settings.method === "geometry"}
                    onPress={() =>
                      applySettings({ method: "geometry" })
                    }
                  />
                  <Text style={s.muted}>
                    Field mode uses common rounded multipliers (30° × 2).
                    Geometry uses 1/sin(angle), not a calibrated shoe model.
                    Three-point saddles always use their separate field method.
                  </Text>
                </>
              )}
              {sheet === "help" && (
                <>
                  {referenceError ? (
                    <Text accessibilityRole="alert" style={s.error}>
                      {referenceError}
                    </Text>
                  ) : null}
                  {fit && <View style={{ gap: 8 }}>
                    <Text style={s.eyebrow}>BENDER FIT CHECK</Text>
                    <Text style={s.muted}>Checks use an illustrative {f(fit.referenceRadius)} centerline radius from the Greenlee Site-Rite manual for this EMT size. This is not your identified shoe. Two equal round bends need at least 2 × radius × (1 − cos(angle)) of height before any straight section fits between them. The app compares height to that geometric bound, not the multiplier mark distance to an arc length.</Text>
                    <Text style={s.muted}>A warning is not a universal rejection. No warning is not a guarantee: hook engagement, bend radius, springback, pipe length and obstacle clearance still require your actual tool. Close marks under 4″ and tip marks under 1″ trigger conservative reminders, not manufacturer minimums. Numeric layouts that round to zero or merge marks are withheld.</Text>
                  </View>}
                  {r && (
                    <>
                      <Text style={s.eyebrow}>
                        {b.title.toUpperCase()} · AT THE BENDER
                      </Text>
                      {r.steps.map((step, i) => (
                        <Text
                          key={i}
                          style={s.step}
                        >{`${i + 1}. ${step}`}</Text>
                      ))}
                      {r.warnings.map((warning) => (
                        <Text key={warning} style={s.warning}>
                          {warning}
                        </Text>
                      ))}
                      {!r.relative && (
                        <>
                          <Text style={s.eyebrow}>
                            {bend === "back"
                              ? "FROM THE OUTSIDE BACK OF THE FIRST 90"
                              : "MARKS FROM THE STARTING END"}
                          </Text>
                          {r.marks.map((mark, i) => (
                            <Text
                              key={i}
                              style={s.step}
                            >{`${mark.label}: ${f(mark.at)} · ${mark.align} · ${mark.angle}°`}</Text>
                          ))}
                        </>
                      )}
                      <Text style={s.muted}>
                        {r.method}
                        {r.factor
                          ? ` · multiplier ${Number(r.factor.toFixed(4))}`
                          : ""}
                        {`\nUnrounded main value: ${r.value.toFixed(4)} in · Display: nearest 1/${settings.precision}″`}
                        {r.shrink !== undefined
                          ? `\nEstimated ${bend === "saddle3" ? "center-location correction" : "shrink"}: ${f(r.shrink)}`
                          : ""}
                        {r.rollAngle !== undefined
                          ? `\nRoll plane: ${r.rollAngle.toFixed(1)}° from vertical toward sideways travel`
                          : ""}
                      </Text>
                      <Text style={s.muted}>
                        The pipe preview is schematic, not a calibrated shoe
                        profile or cut-length calculation.
                      </Text>
                      <View style={s.divider} />
                    </>
                  )}
                  <Text style={s.step}>
                    Arrow: stub mark, offset marks and saddle return marks.
                    {"\n\n"}Star: back of the second 90, measured from the
                    outside back of an existing bend.{"\n\n"}Center notch: the
                    middle saddle bend. Use the notch for your selected center
                    angle.
                  </Text>
                  <Text style={s.step}>
                    Offsets show spacing—not where the obstacle starts. Place
                    your first mark for the job. Shrink is an estimate, not a
                    finished cut length.
                  </Text>
                  <Text style={s.step}>
                    Rolling offsets combine up and sideways travel into one
                    bending plane. Four-point saddles ask for inner mark
                    spacing; that is not guaranteed clearance around an
                    obstacle.
                  </Text>
                  <Text style={s.warning}>
                    Confirm your manufacturer’s instructions. A short stub or
                    closely spaced marks may not fit the shoe. Practice on
                    scrap, check the resting angle, and verify dimensions before
                    installation.
                  </Text>
                  <Button
                    label="Open Gardner Bender hand-bender guide ↗"
                    onPress={() => {
                      openGuide(
                        "https://www.gardnerbender.com/-/media/inriver/GAR_BRO_032_1220_Hand%20Bender%20How%20To%20Guide.pdf",
                      );
                    }}
                  />
                  <Button
                    label="Open Greenlee hand-bender guide ↗"
                    onPress={() => {
                      openGuide(
                        "https://cdn.greenlee.com/resources/media?key=1adba548-f1d2-43d2-bf44-fe4b89a8b579&languageCode=en&type=document",
                      );
                    }}
                  />
                  <Button
                    label="Open Klein bending guide ↗"
                    onPress={() => {
                      openGuide(
                        "https://data.kleintools.com/sites/all/product_assets/documents/instructions/klein/ConduitBenderGuide.pdf",
                      );
                    }}
                  />
                  <Text style={s.muted}>
                    Independent field aid. Not affiliated with or endorsed by
                    any tool manufacturer. Markings and shoe profiles vary;
                    follow the instructions for your actual tool. Segmented
                    bends, kicks and powered-bender setups are not included.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
