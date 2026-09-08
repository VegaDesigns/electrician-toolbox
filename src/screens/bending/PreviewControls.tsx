import React from "react";
import { Pressable, Text, View } from "react-native";
import { previewStyles as s } from "./previewStyles";

export function PreviewControls({ guided, finished, steps, step, onView, onGuide, onStep }: {
  guided: boolean; finished: boolean; steps: readonly string[]; step: number;
  onView: (finished: boolean) => void; onGuide: () => void; onStep: (step: number) => void;
}) {
  return <>
    {!guided && <View style={s.tabs}>
      {[false, true].map(value => <Pressable key={String(value)} accessibilityRole="tab"
        accessibilityState={{ selected: finished === value }} onPress={() => onView(value)}
        style={({ pressed }) => [s.tab, finished === value && s.active, { opacity: pressed ? 0.7 : 1 }]}>
        <Text style={[s.tabText, finished === value && s.amber]}>{value ? "Finished" : "Mark it"}</Text>
      </Pressable>)}
    </View>}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: guided }} onPress={onGuide}
      style={({ pressed }) => [s.guideButton, { opacity: pressed ? 0.7 : 1 }]}>
      <Text style={s.guideText}>{guided ? "Close bend guide −" : "Show me how to bend +"}</Text>
    </Pressable>
    {guided && <View style={s.controls}>
      <View style={s.steps}>{steps.map((label, i) => <Pressable key={label}
        accessibilityRole="button" accessibilityLabel={`${i + 1}. ${label}`}
        accessibilityState={{ selected: step === i }} onPress={() => onStep(i)}
        style={({ pressed }) => [s.step, step === i && s.active, { opacity: pressed ? 0.7 : 1 }]}>
        <Text style={[s.stepNumber, step === i && s.amber]}>{i + 1}</Text>
        <Text style={[s.stepName, step === i && s.amber]}>{label}</Text>
      </Pressable>)}</View>
    </View>}
  </>;
}

export function GuideNavigation({ step, count, onStep }: { step: number; count: number; onStep: (step: number) => void }) {
  return <View style={s.guideNavigation}>
    <Pressable accessibilityRole="button" accessibilityLabel="Previous guide step" disabled={step === 0}
      accessibilityState={{ disabled: step === 0 }} onPress={() => onStep(step - 1)}
      style={[s.textButton, step === 0 && { opacity: 0.35 }]}><Text style={s.guideText}>Previous</Text></Pressable>
    <Text style={s.legend}>{step + 1} of {count}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={step === count - 1 ? "Restart bend guide" : "Next guide step"}
      onPress={() => onStep(step === count - 1 ? 0 : step + 1)} style={s.textButton}>
      <Text style={s.guideText}>{step === count - 1 ? "Restart" : "Next →"}</Text>
    </Pressable>
  </View>;
}
