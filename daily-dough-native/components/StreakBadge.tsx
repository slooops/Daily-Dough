import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { glass, glassColors } from "../styles/theme";

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
      ? {
          bg: "rgba(14,165,233,0.10)",
          text: glassColors.accent,
          border: "rgba(14,165,233,0.18)",
        }
      : {
          bg: "rgba(245,158,11,0.10)",
          text: glassColors.warning,
          border: "rgba(245,158,11,0.18)",
        };
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          shadowColor: glass.shadow.color,
          shadowOffset: glass.shadow.offset,
          shadowRadius: glass.shadow.radius,
          shadowOpacity: glass.shadow.opacity,
        },
      ]}
    >
      <Flame size={36} color={colors.text} />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: glass.radiusSmall,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flex: 1,
    maxWidth: "48%",
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  count: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 30,
    fontVariant: ["tabular-nums"],
  },
  label: { fontSize: 11, fontWeight: "500", marginTop: 2, opacity: 0.8 },
});
