import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme";

type Fraction = { label: string; value: number };

const FRACTIONS: Fraction[] = [
  { label: "1/16", value: 1 / 16 },
  { label: "1/8", value: 1 / 8 },
  { label: "3/16", value: 3 / 16 },
  { label: "1/4", value: 1 / 4 },

  { label: "5/16", value: 5 / 16 },
  { label: "3/8", value: 3 / 8 },
  { label: "7/16", value: 7 / 16 },
  { label: "1/2", value: 1 / 2 },

  { label: "9/16", value: 9 / 16 },
  { label: "5/8", value: 5 / 8 },
  { label: "11/16", value: 11 / 16 },
  { label: "3/4", value: 3 / 4 },

  { label: "13/16", value: 13 / 16 },
  { label: "7/8", value: 7 / 8 },
  { label: "15/16", value: 15 / 16 },
];

export default function FractionTray({
  onPick,
  onClose,
}: {
  onPick: (f: Fraction) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quick Fractions</Text>
          <Text style={styles.subtitle}>Tap one to add it to your input</Text>
        </View>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {FRACTIONS.map((f) => (
          <Pressable
            key={f.label}
            onPress={() => onPick(f)}
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  subtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  closeText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  btn: {
    width: "23%",
    minHeight: 40,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  btnPressed: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
    transform: [{ scale: 0.98 }],
  },

  btnText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
});
