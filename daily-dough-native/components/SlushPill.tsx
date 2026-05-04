import React from "react";
import { GlassPill } from "./ui/GlassPill";
import { View, Text, StyleSheet } from "react-native";
import { glassColors, glass } from "../styles/theme";

export function SlushPill({ amount }: { amount: number }) {
  const tint = amount < 0 ? "red" : "green";
  const color = amount < 0 ? glassColors.danger : glassColors.success;

  return (
    <GlassPill tint={tint}>
      <Text style={[styles.label, { color }]}>Underspend Saved</Text>
      <Text style={[styles.value, { color }]}>
        ${Math.abs(amount).toFixed(0)}
      </Text>
    </GlassPill>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "500" },
  value: { fontSize: 13, fontWeight: "700" },
});
