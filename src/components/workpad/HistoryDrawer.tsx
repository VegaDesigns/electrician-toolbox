import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "../../theme";
import type { CalcHistoryItem } from "../../utils/storage/calcHistory";

type Props = {
  visible: boolean;
  items: CalcHistoryItem[];
  onClose: () => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
  onSelectItem: (item: CalcHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
};

export default function HistoryDrawer({
  visible,
  items,
  onClose,
  onClear,
  onDeleteItem,
  onSelectItem,
  onToggleFavorite,
}: Props) {
  const savedItems = items.filter((item) => item.isFavorite);
  const recentItems = items.filter((item) => !item.isFavorite);

  const hasItems = items.length > 0;
  const hasRecentItems = recentItems.length > 0;

  function renderHistoryCard(item: CalcHistoryItem) {
    const isSaved = !!item.isFavorite;

    return (
      <View key={item.id} style={styles.card}>
        <Pressable
          onPress={() => onSelectItem(item)}
          style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
        >
          <Text style={styles.expression} numberOfLines={1}>
            {item.expression}
          </Text>

          <Text style={styles.result} numberOfLines={1}>
            {item.result}
          </Text>

          <Text style={styles.timestamp}>
            {formatHistoryTime(item.createdAt)}
          </Text>
        </Pressable>

        <View style={styles.actionsColumn}>
          <Pressable
            onPress={() => onToggleFavorite(item.id)}
            style={({ pressed }) => [
              styles.favoriteButton,
              isSaved && styles.favoriteButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.favoriteText,
                isSaved && styles.favoriteTextActive,
              ]}
            >
              {isSaved ? "★" : "☆"}
            </Text>
          </Pressable>

          {!isSaved && (
            <Pressable
              onPress={() => onDeleteItem(item.id)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>History</Text>
              <Text style={styles.subtitle}>
                {savedItems.length} saved · {recentItems.length} recent
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          {!hasItems ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptyText}>
                Completed calculations will show up here.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {savedItems.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Saved</Text>
                    {savedItems.map(renderHistoryCard)}
                  </View>
                )}

                {recentItems.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent</Text>
                    {recentItems.map(renderHistoryCard)}
                  </View>
                )}
              </ScrollView>

              {hasRecentItems && (
                <Pressable
                  onPress={onClear}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.clearText}>Clear Recent</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function formatHistoryTime(createdAt: number): string {
  const date = new Date(createdAt);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    maxHeight: "78%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },

  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  closeText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "900",
  },

  emptyBox: {
    paddingVertical: 42,
    alignItems: "center",
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },

  list: {
    maxHeight: 430,
  },

  listContent: {
    paddingBottom: 12,
  },

  section: {
    gap: 10,
    marginBottom: 18,
  },

  sectionTitle: {
    color: Colors.textSubtle,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardMain: {
    flex: 1,
    minWidth: 0,
  },

  expression: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },

  result: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },

  timestamp: {
    color: Colors.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  actionsColumn: {
    gap: 7,
    alignItems: "stretch",
  },

  favoriteButton: {
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },

  favoriteButtonActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryMuted,
  },

  favoriteText: {
    color: Colors.textMuted,
    fontSize: 17,
    fontWeight: "900",
  },

  favoriteTextActive: {
    color: Colors.primary,
  },

  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#3A1D24",
    borderWidth: 1,
    borderColor: "#EF4444",
    alignItems: "center",
  },

  deleteText: {
    color: "#FCA5A5",
    fontSize: 11,
    fontWeight: "900",
  },

  clearButton: {
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },

  clearText: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
