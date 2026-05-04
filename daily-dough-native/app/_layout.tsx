import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = "http://localhost:3000/api";

export default function Layout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding + period end detection
    async function checkProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile?userId=demo`);
        const data = await res.json();
        if (!data.success || !data.profile) {
          // No profile — redirect to onboarding (only if not already there)
          if (segments[0] !== "onboarding") {
            router.replace("/onboarding");
          }
        } else {
          // Check if current period has ended
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          if (
            data.profile.periodEnd &&
            todayStr > data.profile.periodEnd &&
            segments[0] !== "end-of-period-celebration"
          ) {
            router.replace("/end-of-period-celebration");
          }
        }
      } catch {
        // API unreachable — don't block, allow normal navigation
      } finally {
        setCheckedProfile(true);
      }
    }
    checkProfile();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          paddingTop: insets.top,
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          contentStyle: { paddingTop: 0, backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          contentStyle: { paddingTop: 0, backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="end-of-period-celebration"
        options={{
          presentation: "fullScreenModal",
          contentStyle: { paddingTop: 0, backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
