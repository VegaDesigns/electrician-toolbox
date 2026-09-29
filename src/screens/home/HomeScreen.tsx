import { useI18n } from "../../i18n";
import { AppIcon } from "../../components/AppIcon";
import { FeedbackPressable as Pressable } from "../../components/FeedbackPressable";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStyles } from "./styles";

type ToolTileProps = {
  accent: "amber" | "blue" | "phase";
  icon: string;
  onPress: () => void;
  status?: string;
  subtitle: string;
  title: string;
};

function ToolIcon({ accent, icon }: Pick<ToolTileProps, "accent" | "icon">) {
  const styles = useStyles();

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
  const { t } = useI18n();
  const styles = useStyles();
  const { fontScale, width } = useWindowDimensions();

  return (
    <Pressable
      accessibilityHint={t("Opens {{title}}", { title })}
      accessibilityLabel={`${title}${status ? `, ${status}` : ""}`}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.toolTile,
        (fontScale > 1.2 || width < 350) && styles.toolTileWide,
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
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { t } = useI18n();
  const styles = useStyles();

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
            <Text style={styles.headline}>{t("What do you need?")}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Open app settings")} onPress={() => router.push("/settings")} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
            <AppIcon name="menu" />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t("TOOLS")}</Text>

        <View style={styles.toolGrid}>
          <ToolTile
            accent="amber"
            icon="＋"
            onPress={() => router.push("/workpad")}
            subtitle={t("Measurements and field math")}
            title={t("Workpad")}
          />

          <ToolTile
            accent="phase"
            icon="●"
            onPress={() => router.push("/panel-colors")}
            subtitle={t("Circuit phase and wire color")}
            title={t("Panel Colors")}
          />

          <ToolTile
            accent="blue"
            icon="✓"
            onPress={() => router.push("/job-board")}
            subtitle={t("Job notes and material lists")}
            title={t("Jobsite Lists")}
          />

          <ToolTile
            accent="amber"
            icon="◉"
            onPress={() => router.push("/conduit-fill")}
            subtitle={t("Conduit capacity and sizing")}
            title={t("Fill Guide")}
          />

          <ToolTile
            accent="blue"
            icon="∥"
            onPress={() => router.push("/wire-guide")}
            subtitle={t("Ampacity and conductor limits")}
            title={t("Wire Guide")}
          />

          <ToolTile
            accent="amber"
            icon="“”"
            onPress={() => router.push("/trade-talk")}
            subtitle={t("Electrical terms and jobsite slang")}
            title={t("Trade Talk")}
          />

          <ToolTile
            accent="blue"
            icon="↱"
            onPress={() => router.push("/bending")}
            status={t("NEW")}
            subtitle={t("Bend marks and pipe layouts")}
            title={t("Bending")}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.offlineDot} />
          <Text style={styles.footerText}>{t("READY OFFLINE")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
