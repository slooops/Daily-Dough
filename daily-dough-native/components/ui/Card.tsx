import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated";
}

export function Card({ children, style, variant = "default" }: CardProps) {
  const cardStyle = variant === "elevated" ? styles.cardElevated : styles.card;

  return <View style={[cardStyle, style]}>{children}</View>;
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  cardElevated: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    boxShadow: "0px 8px 32px rgba(132, 132, 132, 0.1)",
    elevation: 12,
  },
  content: {
    padding: 24,
  },
});
