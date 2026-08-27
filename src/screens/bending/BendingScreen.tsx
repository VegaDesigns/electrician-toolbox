import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

export default function BendingScreen() {
  function goHome() {
    Haptics.selectionAsync().catch(() => {});
    router.replace("/");
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to toolbox home"
          accessibilityRole="button"
          onPress={goHome}
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.homeButtonText}>← Home</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Bending Suite</Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>↱</Text>
            </View>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>3/4″ EMT DEFAULT</Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>CONDUIT BENDING</Text>
          <Text style={styles.title}>Plan it. Mark it. Bend it.</Text>
          <Text style={styles.description}>
            A dedicated field suite for accurate, tape-ready bends.
          </Text>

          <View accessibilityElementsHidden style={styles.pipeDiagram}>
            <View style={[styles.pipeSegment, styles.pipeStart]} />
            <View style={[styles.pipeSegment, styles.pipeRise]} />
            <View style={[styles.pipeSegment, styles.pipeEnd]} />
            <View style={[styles.mark, styles.markOne]} />
            <View style={[styles.mark, styles.markTwo]} />
          </View>
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>FIRST TOOL</Text>
          <Text style={styles.nextTitle}>Two-bend offset</Text>
          <Text style={styles.nextDescription}>
            We’ll build the offset calculator here first, then add stub-ups,
            saddles, rolling offsets, and advanced bends one at a time.
          </Text>

          <View style={styles.toolTags}>
            <View style={styles.toolTagActive}>
              <Text style={styles.toolTagActiveText}>Offset · next</Text>
            </View>
            <View style={styles.toolTag}>
              <Text style={styles.toolTagText}>Stub-up</Text>
            </View>
            <View style={styles.toolTag}>
              <Text style={styles.toolTagText}>Saddles</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
