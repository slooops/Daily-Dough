import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, GlassCardContent } from "../components/ui/GlassCard";
import { glass, glassColors } from "../styles/theme";
import { spacing } from "../styles/common";
import { fetchAllowanceToday, endPeriod } from "../services/allowanceService";

export default function EndOfPeriodCelebrationScreen() {
  const router = useRouter();
  const userId = "demo";

  const [slushEnd, setSlushEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [choice, setChoice] = useState<"savings" | "keep" | null>(null);
  const [savings, setSavings] = useState("0");
  const [keep, setKeep] = useState("0");

  useEffect(() => {
    async function load() {
      const data = await fetchAllowanceToday(userId);
      const balance = data.today?.slushBalance ?? 0;
      setSlushEnd(balance);
      if (balance <= 0) {
        setChoice("keep");
        setKeep("0");
        setSavings("0");
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const isPositive = (slushEnd ?? 0) > 0;
  const safeSlush = Math.round(Math.max(0, slushEnd ?? 0) * 100) / 100;

  const select = (c: "savings" | "keep") => {
    setChoice(c);
    if (c === "savings") {
      setSavings(String(safeSlush));
      setKeep("0");
    } else {
      setSavings("0");
      setKeep(String(safeSlush));
    }
  };

  const onChangeSavings = (v: string) => {
    const n = Math.max(0, Math.min(safeSlush, parseInt(v || "0", 10)));
    setSavings(String(n));
    setKeep(String(safeSlush - n));
  };

  const handleStartNewPeriod = async () => {
    setIsSubmitting(true);
    const carryOver = parseInt(keep || "0", 10);
    const result = await endPeriod(userId, carryOver);
    setIsSubmitting(false);
    if (result.success) {
      router.replace("/");
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFF7ED", "#FEF3C7", "#F0F9FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Close button */}
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Ionicons name="close" size={22} color={glassColors.textSecondary} />
        </Pressable>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={{ alignItems: "center", paddingTop: spacing.xl }}>
            <View style={styles.circleXL}>
              <Text style={{ fontSize: 28 }}>🎉</Text>
            </View>
            <Text style={styles.title}>You just got paid!</Text>
            <Text style={styles.subtitle}>
              {isLoading
                ? "Calculating..."
                : isPositive
                  ? `Leftover slush: $${safeSlush.toFixed(2)}`
                  : "Fresh start: Slush resets to $0"}
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              style={{ marginVertical: spacing.xl }}
            />
          ) : (
            <>
              <GlassCard style={{ marginVertical: spacing.lg }}>
                <GlassCardContent style={{ alignItems: "center" }}>
                  <Text style={styles.bodyMedium}>Slush Balance</Text>
                  <Text
                    style={[
                      styles.big,
                      {
                        color: isPositive
                          ? glassColors.success
                          : glassColors.danger,
                        backgroundColor: isPositive
                          ? "rgba(16,185,129,0.10)"
                          : "rgba(239,68,68,0.10)",
                      },
                    ]}
                  >
                    {isPositive ? "+" : ""}${safeSlush.toFixed(2)}
                  </Text>
                </GlassCardContent>
              </GlassCard>

              {isPositive && (
                <View style={{ gap: spacing.md }}>
                  <Pressable
                    onPress={() => select("savings")}
                    style={[
                      styles.card,
                      choice === "savings" && styles.selectedCard,
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.bodyMedium}>
                        Send it all to Savings 🚀
                      </Text>
                      <Text style={styles.caption}>
                        Future you will thank present you
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => select("keep")}
                    style={[
                      styles.card,
                      choice === "keep" && styles.selectedCard,
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.bodyMedium}>
                        Carry into next period 🐉
                      </Text>
                      <Text style={styles.caption}>Build your slush hoard</Text>
                    </View>
                  </Pressable>
                  {choice === "keep" && (
                    <GlassCard>
                      <GlassCardContent>
                        <Text style={styles.bodyMedium}>
                          Customize split (optional)
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: spacing.sm,
                            marginTop: spacing.sm,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.caption}>To Savings</Text>
                            <TextInput
                              keyboardType="numeric"
                              value={savings}
                              onChangeText={onChangeSavings}
                              style={styles.input}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.caption}>Keep as Slush</Text>
                            <TextInput
                              editable={false}
                              value={keep}
                              style={[
                                styles.input,
                                { backgroundColor: "rgba(0,0,0,0.03)" },
                              ]}
                            />
                          </View>
                        </View>
                      </GlassCardContent>
                    </GlassCard>
                  )}
                </View>
              )}

              <Pressable
                onPress={handleStartNewPeriod}
                disabled={(isPositive && !choice) || isSubmitting}
                style={[
                  styles.buttonPrimary,
                  ((isPositive && !choice) || isSubmitting) && { opacity: 0.5 },
                  { marginTop: spacing.lg },
                ]}
              >
                <Text style={styles.buttonPrimaryText}>
                  {isSubmitting
                    ? "Starting..."
                    : isPositive && !choice
                      ? "Make your choice above"
                      : "Start New Period"}
                </Text>
              </Pressable>
            </>
          )}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: spacing.lg },
  circleXL: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(251,146,60,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: glassColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: glassColors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "600",
    color: glassColors.text,
    marginBottom: spacing.sm,
  },
  caption: {
    fontSize: 14,
    color: glassColors.textSecondary,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    borderRadius: glass.radius,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  selectedCard: {
    borderWidth: 1.5,
    borderColor: glassColors.accent,
    backgroundColor: "rgba(14,165,233,0.06)",
  },
  big: {
    fontSize: 28,
    fontWeight: "800",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: glass.radiusPill,
    fontVariant: ["tabular-nums"],
  },
  input: {
    borderWidth: 1.5,
    borderColor: "rgba(14,165,233,0.20)",
    borderRadius: glass.radius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    fontSize: 16,
    color: glassColors.text,
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  buttonPrimary: {
    backgroundColor: glassColors.accent,
    borderRadius: glass.radius,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
