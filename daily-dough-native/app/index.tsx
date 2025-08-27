import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Settings, BarChart3 } from "lucide-react-native";
import { DailyDial } from "../components/DailyDial";
import { SyncStatus } from "../components/SyncStatus.native";
import { Progress } from "../components/ui/Progress";
import { Card, CardContent } from "../components/ui/Card";
import { SlushPill } from "../components/SlushPill";
import { StreakBadge } from "../components/StreakBadge";
import { Transaction } from "../components/TransactionRow";
import { TransactionTable } from "../components/ui/TransactionTable";
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../utils/categoryIcons";
import { useMorningOpen } from "../hooks/useMorningOpen";
import { typography, spacing, borderRadius, colors } from "../styles/common";

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
      category: "Food",
    },
    {
      id: 2,
      date: "2025-08-18T10:05",
      merchant: "USAA → Chase Card",
      amount: -300.0,
      tag: "ignored",
      category: "Credit Card Payment",
    },
    {
      id: 3,
      date: "2025-08-18T11:00",
      merchant: "Rent",
      amount: -1200.0,
      tag: "bill",
      category: "Housing",
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

  // Transform transaction data for TransactionTable component
  const transactionTableData = sampleData.transactions.map((t) => ({
    id: t.id.toString(),
    merchant: t.merchant,
    date: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    amount: Math.abs(t.amount),
    tag: t.tag,
    amountColor: t.amount < 0 ? "#DC2626" : "#059669",
    icon: getCategoryIcon(t.category || "Other"),
    iconBackgroundColor: getCategoryBackgroundColor(t.category || "Other"),
  }));

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.sectionHeader, { paddingVertical: spacing.lg }]}>
          <Text style={typography.title}>Daily Dough</Text>
          <SyncStatus status="idle" lastSynced={new Date().toISOString()} />
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
          <Card variant="elevated">
            <CardContent>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing.lg,
                }}
              >
                <SlushPill amount={sampleData.slush.current} />
                <SyncStatus
                  status="idle"
                  lastSynced={new Date().toISOString()}
                  compact
                />
              </View>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: spacing.md,
                  }}
                >
                  <Text style={typography.label}>Remaining this period</Text>
                  <Text
                    style={typography.value}
                  >{`$${remainingThisPeriod.toFixed(0)} / $${
                    sampleData.period.discretionary_total
                  }`}</Text>
                </View>
                <Progress value={Math.max(0, Math.min(100, periodProgress))} />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: spacing.xl,
                }}
              >
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
            </CardContent>
          </Card>
        </View>

        <TransactionTable
          title="Recent Transactions"
          data={transactionTableData}
          style={{ marginHorizontal: spacing.xl, marginBottom: spacing.xl }}
        />

        {/* Settings buttons moved to bottom */}
        <View style={{ gap: spacing.md }}>
          <Pressable
            onPress={() => router.push("/period-overview")}
            style={styles.actionButton}
          >
            <BarChart3 size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>Period Overview</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.actionButton}
          >
            <Settings size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  sectionHeader: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  sectionCenter: {
    paddingTop: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  sectionInfo: { padding: spacing.xl },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
});
