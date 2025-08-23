import { Stack } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingTop: insets.top, backgroundColor: "#fff" },
      }}
    >
      {/* Home already uses SafeAreaView; avoid double top inset there */}
      <Stack.Screen
        name="index"
        options={{ contentStyle: { paddingTop: 0, backgroundColor: "#fff" } }}
      />
    </Stack>
  );
}
