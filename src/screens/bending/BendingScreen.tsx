import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

const constructionImage = require("../../../assets/images/bending-coming-soon.png");

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

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>CONDUIT</Text>
          <Text style={styles.headerTitle}>Bending Suite</Text>
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>COMING SOON</Text>
          </View>

          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="Conduit bending tools and software under construction"
            resizeMode="contain"
            source={constructionImage}
            style={styles.illustration}
          />

          <Text style={styles.eyebrow}>BACK ON THE WORKBENCH</Text>
          <Text style={styles.title}>We’re rebuilding this one right.</Text>
          <Text style={styles.description}>
            The Bending Suite is being redesigned around the way electricians
            actually measure, mark, and bend conduit in the field.
          </Text>
        </View>

        <View style={styles.buildCard}>
          <View style={styles.buildIcon}>
            <Text style={styles.buildIconText}>⌘</Text>
          </View>
          <View style={styles.buildCopy}>
            <Text style={styles.buildLabel}>ON THE BUILD LIST</Text>
            <Text style={styles.buildTitle}>Clear marks. Real pipe diagrams.</Text>
            <Text style={styles.buildDescription}>
              We’ll bring it back when the workflow is ready to trust on the job.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={goHome}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Back to the toolbox</Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
