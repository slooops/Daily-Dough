import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { DailyDial } from "../components/DailyDial";
import { SyncStatus } from "../components/SyncStatus.native";
import { Progress } from "../components/ui/Progress";
import { SlushPill } from "../components/SlushPill";
import { StreakBadge } from "../components/StreakBadge";
import { TransactionRow, Transaction } from "../components/TransactionRow";
import { useMorningOpen } from "../hooks/useMorningOpen";

const sampleData = {
  period: { discretionary_total: 1400 },
  today: {
    daily_allowance: 100,
    date: "2025-08-18",
    carryover_from_yesterday: -12,
  },
  slush: { current: 13 },
  streaks: { blue_days_this_period: 3, orange_current_streak: 7 },
  transactions: [
    {
      id: 1,
      date: "2025-08-18T09:20",
      merchant: "Blue Bottle",
      amount: -5.0,
      tag: "spend",
    },
    {
      id: 2,
      date: "2025-08-18T10:05",
      merchant: "USAA → Chase Card",
      amount: -300.0,
      tag: "ignored",
    },
    {
      id: 3,
      date: "2025-08-18T11:00",
      merchant: "Rent",
      amount: -1200.0,
      tag: "bill",
    },
  ] as Transaction[],
};

export default function Home() {
  const router = useRouter();
  const { showMorningAnimation, onAnimationComplete } = useMorningOpen();

  const todaySpent = useMemo(
    () =>
      sampleData.transactions
        .filter(
          (t) => t.date.startsWith(sampleData.today.date) && t.tag === "spend"
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    []
  );
  const spendableToday =
    sampleData.today.daily_allowance -
    todaySpent +
    sampleData.today.carryover_from_yesterday;
  const remainingThisPeriod =
    sampleData.period.discretionary_total - todaySpent * 10; // mock
  const periodProgress =
    ((sampleData.period.discretionary_total - remainingThisPeriod) /
      sampleData.period.discretionary_total) *
    100;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.title}>Daily Dough</Text>
          <SyncStatus status="idle" lastSynced={new Date().toISOString()} />
        </View>
      </View>
      <View style={styles.sectionCenter}>
        <DailyDial
          allowance={sampleData.today.daily_allowance}
          spent={todaySpent}
          variant={
            showMorningAnimation
              ? "morning-animate"
              : spendableToday < 0
              ? "negative-start"
              : "normal"
          }
          onAnimationComplete={onAnimationComplete}
        />
      </View>
      <View style={styles.sectionInfo}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SlushPill amount={sampleData.slush.current} />
          <SyncStatus
            status="idle"
            lastSynced={new Date().toISOString()}
            compact
          />
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => router.push("/period-overview")}
            style={styles.buttonOutline}
          >
            <Text style={styles.buttonText}>Period Overview</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.buttonOutline}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </Pressable>
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={styles.label}>Remaining this period</Text>
            <Text style={styles.value}>{`$${remainingThisPeriod.toFixed(
              0
            )} / $${sampleData.period.discretionary_total}`}</Text>
          </View>
          <Progress value={Math.max(0, Math.min(100, periodProgress))} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <StreakBadge
            count={sampleData.streaks.blue_days_this_period}
            type="blue"
            label="no-spend days"
          />
          <StreakBadge
            count={sampleData.streaks.orange_current_streak}
            type="orange"
            label="within budget"
          />
        </View>
      </View>

      <FlatList
        data={sampleData.transactions}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        contentContainerStyle={{
          backgroundColor: "#fff",
          marginTop: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "#E5E7EB",
        }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: "#E5E7EB",
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 8 },
  sectionCenter: { paddingTop: 16, alignItems: "center" },
  sectionInfo: { padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "700" },
  label: { fontSize: 14, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "600" },
  buttonOutline: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: { fontWeight: "600" },
});
