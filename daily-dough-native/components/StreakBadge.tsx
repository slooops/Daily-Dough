import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";

export function StreakBadge({
  count,
  type,
  label,
}: {
  count: number;
  type: "blue" | "orange";
  label?: string;
}) {
  const colors =
    type === "blue"
      ? { bg: "#DBEAFE", text: "#1D4ED8" }
      : { bg: "#FFEDD5", text: "#C2410C" };
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Flame size={42} color={colors.text} />
      <View style={styles.textContainer}>
        <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
        {!!label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
    maxWidth: "48%",
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  count: { fontSize: 28, fontWeight: "800", lineHeight: 32 },
  label: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});
