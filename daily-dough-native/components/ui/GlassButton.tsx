import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { glass, glassColors } from "../../styles/theme";

export interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  haptic?: boolean;
}

export function GlassButton({
  title,
  onPress,
  style,
  textStyle,
  variant = "primary",
  disabled = false,
  haptic = true,
}: GlassButtonProps) {
  const handlePress = useCallback(() => {
    if (haptic && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress, haptic]);

  const variantStyles = {
    primary: {
      container: styles.primary,
      text: styles.primaryText,
    },
    secondary: {
      container: styles.secondary,
      text: styles.secondaryText,
    },
    ghost: {
      container: styles.ghost,
      text: styles.ghostText,
    },
  }[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[variantStyles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: glass.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: glassColors.accent,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondary: {
    backgroundColor: "rgba(14, 165, 233, 0.10)",
    borderWidth: glass.borderWidth,
    borderColor: "rgba(14, 165, 233, 0.25)",
  },
  secondaryText: {
    color: glassColors.accent,
    fontSize: 16,
    fontWeight: "600",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: glassColors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
