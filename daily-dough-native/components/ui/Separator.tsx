import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export function Separator({ style }: { style?: ViewStyle }) {
  return <View style={[styles.sep, style]} />;
}

const styles = StyleSheet.create({
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
});

export default Separator;
