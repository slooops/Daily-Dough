import React from "react";
import { View, StyleSheet } from "react-native";

export function Progress({
  value,
  height = 20,
}: {
  value: number;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const borderRadius = height / 2;

  return (
    <View style={[styles.track, { height, borderRadius }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            height,
            borderRadius,
            minWidth: clamped > 0 ? height : 0, // Ensures circular shape at low values
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#DBEAFE",
    overflow: "hidden",
  },
  fill: {
    backgroundColor: "#3B82F6",
  },
});
