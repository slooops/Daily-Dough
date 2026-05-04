import React, { useMemo, useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Settings,
  BarChart3,
  Receipt,
  ChevronRight,
} from "lucide-react-native";
import {
  fetchUserTransactions,
  refreshTransactions,
} from "../../services/plaidService";
import { fetchAllowanceToday } from "../../services/allowanceService";
import { DailyDial } from "../../components/DailyDial";
import { SyncStatus } from "../../components/SyncStatus.native";
import { logger } from "../../utils/logger";
import { Progress } from "../../components/ui/Progress";
import { GlassCard, GlassCardContent } from "../../components/ui/GlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { SlushPill } from "../../components/SlushPill";
import { StreakBadge } from "../../components/StreakBadge";
import { Transaction } from "../../components/TransactionRow";
import { TransactionTable } from "../../components/ui/TransactionTable";
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../../utils/categoryIcons";
import { useMorningOpen } from "../../hooks/useMorningOpen";
import { inferCategoryFromMerchant } from "../../utils/categoryInference";
import { glass, glassColors } from "../../styles/theme";
import { spacing, borderRadius } from "../../styles/common";

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
      transaction_id: "demo_tx_coffee_001",
      account_id: "demo_account_checking",
      name: "Blue Bottle Coffee",
      merchant_name: "Blue Bottle",
      amount: 5.0, // Positive = expense in Plaid format
      category_primary: "Food and Drink",
      category_secondary: "Coffee",
      date: new Date("2025-08-18"),
    },
    {
      transaction_id: "demo_tx_payment_001",
      account_id: "demo_account_checking",
      name: "USAA → Bilt Card Payment",
      merchant_name: "USAA",
      amount: 300.0, // Positive = expense/payment
      category_primary: "Payment",
      category_secondary: "Credit Card",
      date: new Date("2025-08-18"),
    },
    {
      transaction_id: "demo_tx_rent_001",
      account_id: "demo_account_checking",
      name: "Monthly Rent Payment",
      merchant_name: "Rent",
      amount: 1200.0, // Positive = expense
      category_primary: "Payment",
      category_secondary: "Rent",
      date: new Date("2025-08-18"),
    },
    {
      transaction_id: "demo_tx_payroll_001",
      account_id: "demo_account_checking",
      name: "ACH Electronic Credit GUSTO PAY 123456",
      merchant_name: null,
      amount: -5850.0, // Negative = credit/income in Plaid
      category_primary: "Payroll",
      category_secondary: null,
      date: new Date("2025-09-15"),
    },
  ] as Transaction[],
};

export default function Home() {
  const router = useRouter();
  const { showMorningAnimation, onAnimationComplete } = useMorningOpen();

  // State for real transaction data
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "syncing" | "idle" | "initializing"
  >("idle");

  // Allowance engine state (replaces sampleData)
  const [allowance, setAllowance] = useState<{
    allowanceToday: number;
    spendToday: number;
    slushBalance: number;
    periodBudget: number;
    baseGrantPerDay: number;
    daysInPeriod: number;
    streakCurrent: number;
    streakLongest: number;
    carryover: number;
  } | null>(null);

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

  // Load allowance data from engine
  const loadAllowance = useCallback(async () => {
    try {
      const data = await fetchAllowanceToday(userId);
      if (data.success && data.today) {
        setAllowance({
          allowanceToday: data.today.allowanceToday,
          spendToday: data.today.spendToday,
          slushBalance: data.today.slushBalance,
          periodBudget: data.seed?.expectedPeriodBudget ?? 0,
          baseGrantPerDay: data.seed?.baseGrantPerDay ?? 0,
          daysInPeriod: data.seed?.daysInPeriod ?? 0,
          streakCurrent: data.streak?.current ?? 0,
          streakLongest: data.streak?.longest ?? 0,
          carryover: data.today.carryover,
        });
      }
    } catch (error) {
      logger.error("Failed to fetch allowance", error, {
        component: "Home",
        action: "loadAllowance",
      });
    }
  }, []);

  // Load real transactions function
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      setSyncStatus("syncing");

      logger.info("Starting transaction fetch", {
        component: "Home",
        action: "loadTransactions",
        data: { userId, limit: 20 },
      });

      // Get transactions from the last 2 months for faster development
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const result = await fetchUserTransactions(userId, {
        limit: 20, // Reasonable limit for development
        since: twoMonthsAgo.toISOString().split("T")[0], // Last 2 months
      });

      // Handle initializing status
      if (result.status === "initializing") {
        logger.warning("Transactions still initializing", {
          component: "Home",
          action: "loadTransactions",
        });
        setSyncStatus("initializing");
        setRealTransactions([]);
        setIsLoadingTransactions(false);
        return;
      }

      // Transform API transactions to UI format
      const transformedTransactions: Transaction[] = result.transactions.map(
        (tx: any, index: number) => {
          // Defensive check for transaction data integrity
          if (!tx.date) {
            console.warn(`⚠️ Transaction missing date:`, tx);
          }

          // Extract merchant name - API uses merchant_name, fallback to name
          const merchantName = tx.merchant_name || tx.name || "Unknown";

          // Extract category - API returns array, take first item or fallback
          const originalCategory =
            Array.isArray(tx.category) && tx.category.length > 0
              ? tx.category[0]
              : tx.category_primary || tx.category || "Other";

          const inferredCategory = inferCategoryFromMerchant(
            merchantName,
            originalCategory,
          );

          // Debug category inference
          if (index < 3) {
            console.log(
              `🎯 Category inference for "${merchantName}": ${originalCategory} → ${inferredCategory}`,
            );
          }

          return {
            transaction_id: tx.transaction_id || `temp-${index}`,
            account_id: tx.account_id || "unknown",
            name: tx.name || merchantName,
            merchant_name: tx.merchant_name,
            amount: typeof tx.amount === "number" ? tx.amount : 0,
            category_primary: originalCategory,
            category_secondary: tx.category_secondary || null,
            date:
              tx.date instanceof Date
                ? tx.date.toISOString()
                : tx.date || new Date().toISOString(),
            // Processed fields for UI
            id: tx.transaction_id || tx.id || `temp-${index}`,
            merchant: merchantName,
            tag: tx.tag || ("spend" as const),
            category: inferredCategory,
          };
        },
      );

      setRealTransactions(transformedTransactions);
      logger.success(
        `Loaded ${transformedTransactions.length} real transactions`,
        {
          component: "Home",
          action: "loadTransactions",
          data: { count: transformedTransactions.length },
        },
      );
    } catch (error) {
      logger.error("Failed to fetch transactions", error, {
        component: "Home",
        action: "loadTransactions",
      });
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
    loadAllowance();
  }, [loadTransactions, loadAllowance]);

  // Polling logic for initializing status
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    if (syncStatus === "initializing") {
      console.log("⏳ Starting polling for transaction initialization...");
      pollInterval = setInterval(() => {
        console.log("🔄 Polling for transactions...");
        loadTransactions();
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [syncStatus, loadTransactions]);

  // Reload transactions when screen comes into focus (after navigation)
  useFocusEffect(
    useCallback(() => {
      logger.navigation("Home", "focused - reloading data");
      loadTransactions();
      loadAllowance();
    }, [loadTransactions, loadAllowance]),
  ); // Use real transactions or fallback to sample data
  const transactions =
    realTransactions.length > 0 ? realTransactions : sampleData.transactions;

  // Use engine data or fallback to sample data
  const dailyAllowance =
    allowance?.allowanceToday ?? sampleData.today.daily_allowance;
  const todaySpent = allowance?.spendToday ?? 0;
  const spendableToday = dailyAllowance - todaySpent;
  const slushAmount = allowance?.slushBalance ?? sampleData.slush.current;
  const periodBudget =
    allowance?.periodBudget ?? sampleData.period.discretionary_total;
  const remainingThisPeriod = allowance
    ? allowance.slushBalance
    : sampleData.period.discretionary_total;
  const periodProgress =
    periodBudget > 0
      ? ((periodBudget - Math.max(0, remainingThisPeriod)) / periodBudget) * 100
      : 0;
  const streakBlue =
    allowance?.streakCurrent ?? sampleData.streaks.blue_days_this_period;
  const streakOrange =
    allowance?.streakLongest ?? sampleData.streaks.orange_current_streak;

  // Transform transaction data for TransactionTable component
  const transactionTableData = transactions.map((t) => ({
    id: (t.transaction_id || t.id || "unknown").toString(),
    merchant: t.merchant || t.merchant_name || t.name || "Unknown Merchant",
    date:
      t.date instanceof Date
        ? t.date.toISOString()
        : t.date || new Date().toISOString(), // Ensure string format for TransactionTable
    amount: t.amount || 0, // Keep original amount with sign for color calculation
    tag: t.tag || "spend",
    icon: getCategoryIcon(t.category || t.category_primary || "Other"),
    iconBackgroundColor: getCategoryBackgroundColor(
      t.category || t.category_primary || "Other",
    ),
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#F0F9FF", "#E0F2FE", "#F8FAFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Daily Dough</Text>
            <SyncStatus
              status={syncStatus}
              lastSynced={new Date().toISOString()}
            />
          </View>

          {/* DailyDial — floating */}
          <View style={styles.sectionCenter}>
            <DailyDial
              allowance={Math.max(0, dailyAllowance)}
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

          {/* Info card — glass */}
          <View style={styles.sectionInfo}>
            <GlassCard>
              <GlassCardContent>
                <View style={styles.infoRow}>
                  <SlushPill amount={slushAmount} />
                  <SyncStatus
                    status={syncStatus}
                    lastSynced={new Date().toISOString()}
                    compact
                  />
                </View>
                <View style={{ marginTop: 16 }}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Remaining this period</Text>
                    <Text style={styles.value}>
                      {`$${Math.max(0, remainingThisPeriod).toFixed(0)} / $${periodBudget.toFixed(0)}`}
                    </Text>
                  </View>
                  <Progress
                    value={Math.max(0, Math.min(100, periodProgress))}
                  />
                </View>
                <View style={styles.streakRow}>
                  <StreakBadge
                    count={streakBlue}
                    type="blue"
                    label="within budget"
                  />
                  <StreakBadge
                    count={streakOrange}
                    type="orange"
                    label="longest streak"
                  />
                </View>
              </GlassCardContent>
            </GlassCard>
          </View>

          {/* Transactions */}
          <TransactionTable
            title={
              realTransactions.length > 0
                ? "Recent Transactions"
                : "Recent Transactions (Demo Data)"
            }
            headerIcon={<Receipt size={16} color={glassColors.accent} />}
            data={transactionTableData}
            style={{ marginHorizontal: spacing.xl, marginBottom: spacing.xl }}
          />

          {/* Bottom spacer for tab bar */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: glassColors.text,
    letterSpacing: -0.5,
  },
  sectionCenter: {
    paddingTop: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  sectionInfo: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: glassColors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: glassColors.text,
    fontVariant: ["tabular-nums"],
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl + 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: glass.radius,
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: spacing.sm,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: glassColors.accent,
  },
});
