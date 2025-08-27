import { StyleSheet } from "react-native";

// Common typography system with slightly larger sizes for SwiftUI-style design
export const typography = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  valueLarge: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});

// Common spacing values (aligned with 24px card padding)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24, // Primary card padding
  xxxl: 32,
  xxxxl: 40,
};

// Common border radius values for SwiftUI-style design
export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  card: 36, // Primary card radius
  pill: 999,
};

// Common colors
export const colors = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
  },
  semantic: {
    danger: "#DC2626",
    warning: "#D97706",
    success: "#059669",
    info: "#2563EB",
  },
};

// Common layout styles
export const layout = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  column: {
    flexDirection: "column",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: {
    flex: 1,
  },
});
