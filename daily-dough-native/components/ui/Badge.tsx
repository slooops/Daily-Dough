import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type Variant = "default" | "secondary" | "destructive";

export function Badge({
  variant = "secondary",
  children,
  style,
  textStyle,
}: {
  variant?: Variant;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const vStyles = variantStyles[variant] || variantStyles.secondary;
  const childArray = React.Children.toArray(children);

  // NEW - Smart spacing logic
  const hasText = childArray.some(
    (child) => typeof child === "string" || typeof child === "number"
  );
  const hasNonTextChildren = childArray.some(
    (child) => typeof child !== "string" && typeof child !== "number"
  );
  const shouldAddSpacing = hasText && hasNonTextChildren;

  return (
    <View style={[styles.base, vStyles.container, style]}>
      {React.Children.map(children, (child, idx) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text key={idx} style={[styles.text, vStyles.text, textStyle]}>
            {child}
          </Text>
        ) : (
          <View
            key={idx}
            style={shouldAddSpacing ? { marginRight: 4 } : undefined}
          >
            {child as any}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "500" },
});

const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> =
  {
    default: {
      container: { backgroundColor: "#DBEAFE" },
      text: { color: "#1D4ED8" },
    },
    secondary: {
      container: { backgroundColor: "#F3F4F6" },
      text: { color: "#374151" },
    },
    destructive: {
      container: { backgroundColor: "#FEE2E2" },
      text: { color: "#B91C1C" },
    },
  };
