import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { glass } from "../../styles/theme";

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Increase opacity for cards over busy backgrounds */
  intensity?: "light" | "medium" | "heavy";
  /** Disable blur (falls back to semi-transparent white) */
  noBlur?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = "medium",
  noBlur = false,
}: GlassCardProps) {
  const blurAmount =
    intensity === "light"
      ? glass.blurLight
      : intensity === "heavy"
        ? glass.blur + 10
        : glass.blur;

  const bgOpacity =
    intensity === "light"
      ? "rgba(255,255,255,0.45)"
      : intensity === "heavy"
        ? "rgba(255,255,255,0.82)"
        : glass.background;

  if (noBlur) {
    return (
      <View style={[styles.card, { backgroundColor: bgOpacity }, style]}>
        {/* Shimmer border overlay */}
        <View style={styles.border} />
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.outer, style]}>
      <BlurView intensity={blurAmount} tint="light" style={styles.blur}>
        <View style={[styles.overlay, { backgroundColor: bgOpacity }]}>
          <View style={styles.border} />
          {children}
        </View>
      </BlurView>
    </View>
  );
}

export function GlassCardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: glass.radius,
    overflow: "hidden",
    // Shadow
    shadowColor: glass.shadow.color,
    shadowOffset: glass.shadow.offset,
    shadowRadius: glass.shadow.radius,
    shadowOpacity: glass.shadow.opacity,
    elevation: 8,
  },
  blur: {
    borderRadius: glass.radius,
    overflow: "hidden",
  },
  overlay: {
    borderRadius: glass.radius,
    overflow: "hidden",
  },
  card: {
    borderRadius: glass.radius,
    overflow: "hidden",
    shadowColor: glass.shadow.color,
    shadowOffset: glass.shadow.offset,
    shadowRadius: glass.shadow.radius,
    shadowOpacity: glass.shadow.opacity,
    elevation: 8,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: glass.radius,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    pointerEvents: "none",
  },
  content: {
    padding: 24,
  },
});
