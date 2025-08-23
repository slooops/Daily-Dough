import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
      <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
      {!!label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  count: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "500" },
});
