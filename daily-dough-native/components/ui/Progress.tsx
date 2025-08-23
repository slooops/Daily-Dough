import React from "react";
import { View, StyleSheet } from "react-native";

export function Progress({
  value,
  height = 12,
}: {
  value: number;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[styles.fill, { width: `${clamped}%`, height: height - 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden" },
  fill: { backgroundColor: "#3B82F6", borderRadius: 999, margin: 1 },
});
