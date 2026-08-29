import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

type ToolCardProps = {
  accent: "amber" | "blue";
  description: string;
  eyebrow: string;
  icon: string;
  onPress: () => void;
  title: string;
};

function ToolCard({
  accent,
  description,
  eyebrow,
  icon,
  onPress,
  title,
}: ToolCardProps) {
  return (
    <Pressable
      accessibilityHint={`Opens ${title}`}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.toolCard,
        accent === "amber" ? styles.toolCardAmber : styles.toolCardBlue,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.toolTopRow}>
        <View
          style={[
            styles.toolIcon,
            accent === "blue" && styles.toolIconBlue,
          ]}
        >
          <Text
            style={[
              styles.toolIconText,
              accent === "blue" && styles.toolIconTextBlue,
            ]}
          >
            {icon}
          </Text>
        </View>

        <Text style={styles.openArrow}>↗</Text>
      </View>

      <Text style={styles.toolEyebrow}>{eyebrow}</Text>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolDescription}>{description}</Text>

      {accent === "amber" ? (
        <View style={styles.workpadPreview}>
          <Text style={styles.workpadPreviewValue}>ft · in · frac</Text>
          <Text style={styles.workpadPreviewLabel}>FIELD MATH</Text>
        </View>
      ) : (
        <View accessibilityElementsHidden style={styles.pipePreview}>
          <View style={[styles.pipeSegment, styles.pipeSegmentStart]} />
          <View style={[styles.pipeSegment, styles.pipeSegmentRise]} />
          <View style={[styles.pipeSegment, styles.pipeSegmentEnd]} />
          <Text style={styles.pipeDefault}>UNDER CONSTRUCTION</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>ϟ</Text>
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.brandName}>ELECTRICIAN TOOLBOX</Text>
            <Text style={styles.headline}>Ready for the job.</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Choose a tool</Text>

        <View style={styles.toolStack}>
          <ToolCard
            accent="amber"
            description="Fast measurements, fractions, and field calculations."
            eyebrow="CALCULATE"
            icon="＋"
            onPress={() => router.push("/workpad")}
            title="Workpad Calculator"
          />

          <ToolCard
            accent="blue"
            description="A field-first bending suite is on the workbench."
            eyebrow="COMING SOON"
            icon="↱"
            onPress={() => router.push("/bending")}
            title="Conduit Bending"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Works offline</Text>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>2 tools</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
