import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { BlurView } from "expo-blur";
import { glass, glassColors } from "../../styles/theme";

export interface GlassPillProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Tint the pill surface */
  tint?: "neutral" | "green" | "red" | "amber" | "blue";
}

const tintMap = {
  neutral: { bg: "rgba(255,255,255,0.55)", text: glassColors.text },
  green: { bg: "rgba(16,185,129,0.12)", text: glassColors.success },
  red: { bg: "rgba(239,68,68,0.12)", text: glassColors.danger },
  amber: { bg: "rgba(245,158,11,0.12)", text: glassColors.warning },
  blue: { bg: "rgba(14,165,233,0.12)", text: glassColors.accent },
};

export function GlassPill({
  children,
  style,
  tint = "neutral",
}: GlassPillProps) {
  const colors = tintMap[tint];

  return (
    <View style={[styles.outer, { backgroundColor: colors.bg }, style]}>
      <View style={styles.border} />
      {children}
    </View>
  );
}

/** Convenience: a pill with a label + value, like "Slush: $42" */
export function GlassPillLabel({
  label,
  value,
  tint = "neutral",
  style,
}: {
  label: string;
  value: string;
  tint?: GlassPillProps["tint"];
  style?: ViewStyle;
}) {
  const colors = tintMap[tint];
  return (
    <GlassPill tint={tint} style={style}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </GlassPill>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: glass.radiusPill,
    overflow: "hidden",
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: glass.radiusPill,
    borderWidth: glass.borderWidth,
    borderColor: "rgba(255,255,255,0.25)",
    pointerEvents: "none",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
});
