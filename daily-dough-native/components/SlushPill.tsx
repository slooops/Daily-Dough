import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function SlushPill({ amount }: { amount: number }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Slush</Text>
      <Text style={styles.value}>${amount.toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
  },
  label: { color: "#065F46", fontSize: 12, fontWeight: "500" },
  value: { color: "#065F46", fontSize: 14, fontWeight: "700" },
});
