import React, { useMemo, useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Settings, BarChart3, Receipt } from "lucide-react-native";
import {
  fetchUserTransactions,
  refreshTransactions,
} from "../services/plaidService";
import { DailyDial } from "../components/DailyDial";
import { SyncStatus } from "../components/SyncStatus.native";
import { logger } from "../utils/logger";
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

// Enhanced category inference for Plaid transaction data
const inferCategoryFromMerchant = (
  merchant: string,
  originalCategory: string
): string => {
  if (
    originalCategory &&
    originalCategory !== "Other" &&
    originalCategory !== ""
  ) {
    return originalCategory; // Use real category if available
  }

  const merchantLower = merchant.toLowerCase();

  // Income (highest priority)
  if (
    merchantLower.includes("ach electronic credit") ||
    merchantLower.includes("gusto pay") ||
    merchantLower.includes("payroll") ||
    merchantLower.includes("salary") ||
    merchantLower.includes("deposit") ||
    merchantLower.includes("direct dep") ||
    merchantLower.includes("wage")
  ) {
    return "Income";
  }

  // Financial services
  if (
    merchantLower.includes("cd deposit") ||
    merchantLower.includes("interest") ||
    merchantLower.includes("bank fee") ||
    merchantLower.includes("overdraft") ||
    merchantLower.includes("atm fee")
  ) {
    return "Financial";
  }

  // Recreation/Fitness (based on "Touchstone Climbing")
  if (
    merchantLower.includes("climbing") ||
    merchantLower.includes("gym") ||
    merchantLower.includes("fitness") ||
    merchantLower.includes("yoga") ||
    merchantLower.includes("crossfit") ||
    merchantLower.includes("pilates") ||
    merchantLower.includes("sports") ||
    merchantLower.includes("tennis") ||
    merchantLower.includes("golf") ||
    merchantLower.includes("swim") ||
    merchantLower.includes("martial arts")
  ) {
    return "Recreation";
  }

  // Grocery vs Food distinction
  if (
    merchantLower.includes("grocery") ||
    merchantLower.includes("supermarket") ||
    merchantLower.includes("safeway") ||
    merchantLower.includes("whole foods") ||
    merchantLower.includes("trader joe") ||
    merchantLower.includes("kroger") ||
    merchantLower.includes("wegmans")
  ) {
    return "Grocery";
  }

  // Restaurants/Food
  if (
    merchantLower.includes("restaurant") ||
    merchantLower.includes("coffee") ||
    merchantLower.includes("starbucks") ||
    merchantLower.includes("mcdonald") ||
    merchantLower.includes("pizza") ||
    merchantLower.includes("food") ||
    merchantLower.includes("cafe") ||
    merchantLower.includes("diner") ||
    merchantLower.includes("bistro")
  ) {
    return "Food";
  }

  // Transportation
  if (
    merchantLower.includes("uber") ||
    merchantLower.includes("lyft") ||
    merchantLower.includes("taxi") ||
    merchantLower.includes("gas") ||
    merchantLower.includes("shell") ||
    merchantLower.includes("chevron") ||
    merchantLower.includes("parking") ||
    merchantLower.includes("metro") ||
    merchantLower.includes("transit")
  ) {
    return "Transportation";
  }

  // Travel
  if (
    merchantLower.includes("airline") ||
    merchantLower.includes("hotel") ||
    merchantLower.includes("airbnb") ||
    merchantLower.includes("expedia") ||
    merchantLower.includes("booking") ||
    merchantLower.includes("flight")
  ) {
    return "Travel";
  }

  // Shopping
  if (
    merchantLower.includes("amazon") ||
    merchantLower.includes("target") ||
    merchantLower.includes("walmart") ||
    merchantLower.includes("store") ||
    merchantLower.includes("shop") ||
    merchantLower.includes("retail")
  ) {
    return "Shopping";
  }

  // Subscriptions
  if (
    merchantLower.includes("netflix") ||
    merchantLower.includes("spotify") ||
    merchantLower.includes("subscription") ||
    merchantLower.includes("monthly") ||
    merchantLower.includes("annual")
  ) {
    return "Subscriptions";
  }

  // Entertainment
  if (
    merchantLower.includes("movie") ||
    merchantLower.includes("theater") ||
    merchantLower.includes("cinema") ||
    merchantLower.includes("concert") ||
    merchantLower.includes("ticket")
  ) {
    return "Entertainment";
  }

  // Healthcare
  if (
    merchantLower.includes("pharmacy") ||
    merchantLower.includes("doctor") ||
    merchantLower.includes("medical") ||
    merchantLower.includes("clinic") ||
    merchantLower.includes("hospital")
  ) {
    return "Healthcare";
  }

  // Personal Care
  if (
    merchantLower.includes("salon") ||
    merchantLower.includes("spa") ||
    merchantLower.includes("barber") ||
    merchantLower.includes("beauty") ||
    merchantLower.includes("cosmetic")
  ) {
    return "Personal Care";
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

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

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
            originalCategory
          );

          // Debug category inference
          if (index < 3) {
            console.log(
              `🎯 Category inference for "${merchantName}": ${originalCategory} → ${inferredCategory}`
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
        }
      );

      setRealTransactions(transformedTransactions);
      logger.success(
        `Loaded ${transformedTransactions.length} real transactions`,
        {
          component: "Home",
          action: "loadTransactions",
          data: { count: transformedTransactions.length },
        }
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
  }, [loadTransactions]);

  // Polling logic for initializing status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

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
      logger.navigation("Home", "focused - reloading transactions");
      loadTransactions();
    }, [loadTransactions])
  ); // Use real transactions or fallback to sample data
  const transactions =
    realTransactions.length > 0 ? realTransactions : sampleData.transactions;

  const todaySpent = useMemo(
    () =>
      transactions
        .filter((t) => {
          if (!t.date) return false;

          // Handle both Date objects and string dates
          const dateStr =
            t.date instanceof Date ? t.date.toISOString() : t.date;
          return dateStr.startsWith(sampleData.today.date) && t.tag === "spend";
        })
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
      t.category || t.category_primary || "Other"
    ),
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
          headerIcon={<Receipt size={16} color="#1D4ED8" />}
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
