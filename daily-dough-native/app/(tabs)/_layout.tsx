import React from "react";
import { Tabs } from "expo-router";
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { glass, glassColors } from "../../styles/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabWidth = width * 0.5;

  return (
    <View
      style={[
        tabBarStyles.outer,
        {
          bottom: insets.bottom > 0 ? insets.bottom - 8 : 8,
          width: tabWidth,
          left: (width - tabWidth) / 2,
        },
      ]}
    >
      {Platform.OS === "ios" && (
        <BlurView
          intensity={60}
          tint="systemChromeMaterial"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: glass.radiusLarge, overflow: "hidden" },
          ]}
        />
      )}
      <View style={tabBarStyles.inner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? glassColors.accent : "rgba(60,60,67,0.6)";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
          if (route.name === "index") iconName = "speedometer-outline";
          else if (route.name === "period-overview")
            iconName = "calendar-outline";
          else if (route.name === "settings") iconName = "cog-outline";

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={tabBarStyles.tab}
            >
              <Ionicons name={iconName} size={24} color={color} />
              <Text style={[tabBarStyles.label, { color }]}>
                {options.title || route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  outer: {
    position: "absolute",
    height: 64,
    borderRadius: glass.radiusLarge,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    shadowColor: glass.shadow.color,
    shadowOffset: glass.shadow.offset,
    shadowRadius: glass.shadow.radius,
    shadowOpacity: glass.shadow.opacity,
    elevation: 8,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Dial" }} />
      <Tabs.Screen name="period-overview" options={{ title: "Period" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
