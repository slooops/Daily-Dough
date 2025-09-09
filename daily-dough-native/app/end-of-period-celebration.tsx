import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, CardContent } from "../components/ui/Card";
import { typography, spacing, borderRadius, colors } from "../styles/common";

export default function EndOfPeriodCelebrationScreen() {
  const router = useRouter();
  const slushEnd = 87;
  const isPositive = slushEnd > 0;
  const [choice, setChoice] = useState<"savings" | "keep" | null>(
    isPositive ? null : "keep"
  );
  const [savings, setSavings] = useState(String(isPositive ? slushEnd : 0));
  const [keep, setKeep] = useState(String(isPositive ? 0 : 0));

  const select = (c: "savings" | "keep") => {
    setChoice(c);
    if (c === "savings") {
      setSavings(String(slushEnd));
      setKeep("0");
    } else {
      setSavings("0");
      setKeep(String(slushEnd));
    }
  };

  const onChangeSavings = (v: string) => {
    const n = Math.max(0, Math.min(slushEnd, parseInt(v || "0", 10)));
    setSavings(String(n));
    setKeep(String(slushEnd - n));
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ alignItems: "center", paddingTop: spacing.xl }}>
          <View style={[styles.circleXL, { backgroundColor: "#FB923C" }]}>
            <Text style={{ fontSize: 28 }}>🎉</Text>
          </View>
          <Text style={typography.title}>You just got paid!</Text>
          <Text
            style={[
              typography.caption,
              { marginTop: spacing.xs, textAlign: "center" },
            ]}
          >
            {isPositive
              ? `Leftover slush: $${slushEnd}`
              : "Fresh start: Slush resets to $0"}
          </Text>
        </View>

        <Card
          variant="elevated"
          style={{ marginVertical: spacing.lg, alignItems: "center" }}
        >
          <CardContent style={{ alignItems: "center" }}>
            <Text style={[typography.bodyMedium, { marginBottom: spacing.sm }]}>
              Slush Balance
            </Text>
            <Text
              style={[
                styles.big,
                {
                  color: isPositive ? "#166534" : "#B91C1C",
                  backgroundColor: isPositive ? "#DCFCE7" : "#FEE2E2",
                },
              ]}
            >
              {" "}
              {isPositive ? "+" : ""}${slushEnd}{" "}
            </Text>
          </CardContent>
        </Card>

        {isPositive && (
          <View style={{ gap: spacing.md }}>
            <Pressable
              onPress={() => select("savings")}
              style={[styles.card, choice === "savings" && styles.selectedCard]}
            >
              <CardContent>
                <Text style={typography.bodyMedium}>
                  Send it all to Savings 🚀
                </Text>
                <Text style={typography.caption}>
                  Future you will thank present you
                </Text>
              </CardContent>
            </Pressable>
            <Pressable
              onPress={() => select("keep")}
              style={[styles.card, choice === "keep" && styles.selectedCard]}
            >
              <CardContent>
                <Text style={typography.bodyMedium}>
                  Carry into next period 🐉
                </Text>
                <Text style={typography.caption}>Build your slush hoard</Text>
              </CardContent>
            </Pressable>
            {choice === "keep" && (
              <Card>
                <CardContent>
                  <Text style={typography.bodyMedium}>
                    Customize split (optional)
                  </Text>
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.caption}>To Savings</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={savings}
                        onChangeText={onChangeSavings}
                        style={styles.input}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.caption}>Keep as Slush</Text>
                      <TextInput
                        editable={false}
                        value={keep}
                        style={[styles.input, { backgroundColor: "#F3F4F6" }]}
                      />
                    </View>
                  </View>
                </CardContent>
              </Card>
            )}
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          disabled={isPositive && !choice}
          style={[
            styles.buttonPrimary,
            isPositive && !choice && { opacity: 0.5 },
            { marginTop: spacing.lg },
          ]}
        >
          <Text style={styles.buttonPrimaryText}>
            {isPositive && !choice
              ? "Make your choice above"
              : "Start New Period"}
          </Text>
        </Pressable>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  circleXL: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.card,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  big: {
    fontSize: 28,
    fontWeight: "800",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
