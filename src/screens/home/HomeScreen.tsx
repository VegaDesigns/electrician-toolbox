import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

type ToolTileProps = {
  accent: "amber" | "blue" | "phase";
  icon: string;
  onPress: () => void;
  status?: string;
  subtitle: string;
  title: string;
};

function ToolIcon({ accent, icon }: Pick<ToolTileProps, "accent" | "icon">) {
  if (accent === "phase") {
    return (
      <View accessibilityElementsHidden style={[styles.toolIcon, styles.toolIconPhase]}>
        <View style={[styles.phaseDot, styles.phaseBlack]} />
        <View style={[styles.phaseDot, styles.phaseRed]} />
        <View style={[styles.phaseDot, styles.phaseBlue]} />
      </View>
    );
  }

  return (
    <View style={[styles.toolIcon, accent === "blue" && styles.toolIconBlue]}>
      <Text style={[styles.toolIconText, accent === "blue" && styles.toolIconTextBlue]}>
        {icon}
      </Text>
    </View>
  );
}

function ToolTile({ accent, icon, onPress, status, subtitle, title }: ToolTileProps) {
  return (
    <Pressable
      accessibilityHint={`Opens ${title}`}
      accessibilityLabel={`${title}${status ? `, ${status}` : ""}`}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.toolTile,
        accent === "amber" && styles.toolTileAmber,
        accent === "blue" && styles.toolTileBlue,
        accent === "phase" && styles.toolTilePhase,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.toolTopRow}>
        <ToolIcon accent={accent} icon={icon} />
        <Text style={styles.openArrow}>↗</Text>
      </View>

      <View style={styles.toolCopy}>
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
        <Text style={styles.toolTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
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
            <Text style={styles.headline}>What do you need?</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TOOLS</Text>

        <View style={styles.toolGrid}>
          <ToolTile
            accent="amber"
            icon="＋"
            onPress={() => router.push("/workpad")}
            subtitle="Measurements and field math"
            title="Workpad"
          />

          <ToolTile
            accent="phase"
            icon="●"
            onPress={() => router.push("/panel-colors")}
            subtitle="Circuit phase and wire color"
            title="Panel Colors"
          />

          <ToolTile
            accent="blue"
            icon="↱"
            onPress={() => router.push("/bending")}
            status="COMING SOON"
            subtitle="Field-first conduit bending"
            title="Bending"
          />

          <ToolTile
            accent="amber"
            icon="◉"
            onPress={() => router.push("/conduit-fill")}
            subtitle="Conduit capacity and sizing"
            title="Fill Guide"
          />

          <ToolTile
            accent="blue"
            icon="∥"
            onPress={() => router.push("/wire-guide")}
            subtitle="Ampacity and conductor limits"
            title="Wire Guide"
          />

          <ToolTile
            accent="amber"
            icon="“”"
            onPress={() => router.push("/trade-talk")}
            subtitle="Electrical terms and jobsite slang"
            title="Trade Talk"
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.offlineDot} />
          <Text style={styles.footerText}>READY OFFLINE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
