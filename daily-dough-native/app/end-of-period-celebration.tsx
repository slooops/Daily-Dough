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
        <View style={{ alignItems: "center", paddingTop: 24 }}>
          <View style={[styles.circleXL, { backgroundColor: "#FB923C" }]}>
            <Text style={{ fontSize: 28 }}>🎉</Text>
          </View>
          <Text style={styles.title}>You just got paid!</Text>
          <Text style={styles.muted}>
            {isPositive
              ? `Leftover slush: $${slushEnd}`
              : "Fresh start: Slush resets to $0"}
          </Text>
        </View>

        <View
          style={[styles.cardElevated, { marginTop: 16, alignItems: "center" }]}
        >
          <Text style={[styles.itemTitle, { marginBottom: 8 }]}>
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
        </View>

        {isPositive && (
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => select("savings")}
              style={[styles.card, choice === "savings" && styles.selectedCard]}
            >
              <Text style={styles.itemTitle}>Send it all to Savings 🚀</Text>
              <Text style={styles.muted}>
                Future you will thank present you
              </Text>
            </Pressable>
            <Pressable
              onPress={() => select("keep")}
              style={[styles.card, choice === "keep" && styles.selectedCard]}
            >
              <Text style={styles.itemTitle}>Carry into next period 🐉</Text>
              <Text style={styles.muted}>Build your slush hoard</Text>
            </Pressable>
            {choice === "keep" && (
              <View style={styles.card}>
                <Text style={styles.itemTitle}>Customize split (optional)</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.muted}>To Savings</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={savings}
                      onChangeText={onChangeSavings}
                      style={styles.input}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.muted}>Keep as Slush</Text>
                    <TextInput
                      editable={false}
                      value={keep}
                      style={[styles.input, { backgroundColor: "#F3F4F6" }]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          disabled={isPositive && !choice}
          style={[
            styles.buttonPrimary,
            isPositive && !choice && { opacity: 0.5 },
            { marginTop: 16 },
          ]}
        >
          <Text style={styles.buttonPrimaryText}>
            {isPositive && !choice
              ? "Make your choice above"
              : "Start New Period"}
          </Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 16 },
  circleXL: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  muted: { fontSize: 12, color: "#6B7280", marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
  },
  cardElevated: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  big: {
    fontSize: 24,
    fontWeight: "800",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700" },
});
