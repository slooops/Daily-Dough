import React, { useMemo, useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Settings, BarChart3 } from "lucide-react-native";
import { fetchUserTransactions } from "../services/plaidService";
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

// Smart category inference for development (when Plaid sandbox returns "Other")
const inferCategoryFromMerchant = (
  merchant: string,
  originalCategory: string
): string => {
  if (originalCategory && originalCategory !== "Other") {
    return originalCategory; // Use real category if available
  }

  const merchantLower = merchant.toLowerCase();

  // Transportation
  if (
    merchantLower.includes("uber") ||
    merchantLower.includes("lyft") ||
    merchantLower.includes("taxi") ||
    merchantLower.includes("gas") ||
    merchantLower.includes("shell") ||
    merchantLower.includes("chevron")
  ) {
    return "Transportation";
  }

  // Travel
  if (
    merchantLower.includes("airline") ||
    merchantLower.includes("hotel") ||
    merchantLower.includes("airbnb") ||
    merchantLower.includes("expedia")
  ) {
    return "Travel";
  }

  // Food
  if (
    merchantLower.includes("restaurant") ||
    merchantLower.includes("coffee") ||
    merchantLower.includes("starbucks") ||
    merchantLower.includes("mcdonald") ||
    merchantLower.includes("pizza") ||
    merchantLower.includes("food")
  ) {
    return "Food";
  }

  // Shopping
  if (
    merchantLower.includes("amazon") ||
    merchantLower.includes("target") ||
    merchantLower.includes("walmart") ||
    merchantLower.includes("store")
  ) {
    return "Shopping";
  }

  // Entertainment
  if (
    merchantLower.includes("netflix") ||
    merchantLower.includes("spotify") ||
    merchantLower.includes("movie") ||
    merchantLower.includes("theater")
  ) {
    return "Entertainment";
  }

  // Default to Other
  return "Other";
};

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
      date: "2025-08-18T09:20:00.000Z",
      merchant: "Blue Bottle",
      amount: -5.0,
      tag: "spend",
      category: "Food",
    },
    {
      id: 2,
      date: "2025-08-18T10:05:00.000Z",
      merchant: "USAA → Bilt Card",
      amount: -300.0,
      tag: "ignored",
      category: "Credit Card Payment",
    },
    {
      id: 3,
      date: "2025-08-18T11:00:00.000",
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

  // State for real transaction data
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "idle">("idle");

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

  // Load real transactions function
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      setSyncStatus("syncing");

      // Get transactions from the last 2 months for faster development
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const userTransactions = await fetchUserTransactions(userId, {
        limit: 20, // Reasonable limit for development
        since: twoMonthsAgo.toISOString().split("T")[0], // Last 2 months
      });

      // Transform API transactions to UI format
      const transformedTransactions: Transaction[] = userTransactions.map(
        (tx: any, index: number) => {
          const inferredCategory = inferCategoryFromMerchant(
            tx.merchant || "Unknown",
            tx.category
          );

          // Debug category inference
          if (index < 3) {
            console.log(
              `🎯 Category inference for "${tx.merchant}": ${tx.category} → ${inferredCategory}`
            );
          }

          return {
            id: tx.id,
            date: tx.date || new Date().toISOString(),
            merchant: tx.merchant || "Unknown",
            amount: tx.amount || 0,
            tag: tx.tag || ("spend" as const),
            category: inferredCategory,
          };
        }
      );

      setRealTransactions(transformedTransactions);
      console.log(
        `📊 Loaded ${transformedTransactions.length} real transactions`
      );
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Fall back to sample data if API fails
      setRealTransactions(sampleData.transactions);
    } finally {
      setIsLoadingTransactions(false);
      setSyncStatus("idle");
    }
  }, []);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reload transactions when screen comes into focus (after navigation)
  useFocusEffect(
    useCallback(() => {
      // Only reload if we have existing data (avoid double-loading on first mount)
      if (realTransactions.length > 0) {
        console.log("📱 Home screen focused, reloading transactions...");
        loadTransactions();
      }
    }, [loadTransactions, realTransactions.length])
  ); // Use real transactions or fallback to sample data
  const transactions =
    realTransactions.length > 0 ? realTransactions : sampleData.transactions;

  const todaySpent = useMemo(
    () =>
      transactions
        .filter(
          (t) => t.date.startsWith(sampleData.today.date) && t.tag === "spend"
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions]
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
  const transactionTableData = transactions.map((t) => ({
    id: t.id.toString(),
    merchant: t.merchant,
    date: t.date, // Pass raw date, let TransactionTable format it
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
          <SyncStatus
            status={syncStatus}
            lastSynced={new Date().toISOString()}
          />
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
                  status={syncStatus}
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
          title={
            realTransactions.length > 0
              ? "Recent Transactions"
              : "Recent Transactions (Demo Data)"
          }
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
