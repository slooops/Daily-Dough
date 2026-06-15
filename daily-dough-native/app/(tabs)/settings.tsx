import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  Plus,
  Receipt,
  Loader2,
  Trash2,
} from "lucide-react-native";
import { fetchUserAccounts, fetchUserTransactions, disconnectAllAccounts } from "../../services/plaidService";
import { Badge } from "../../components/ui/Badge";
import { Separator } from "../../components/ui/Separator";
import { Card, CardContent } from "../../components/ui/Card";
import { TransactionTable } from "../../components/ui/TransactionTable";
import { SyncStatus } from "../../components/SyncStatus.native";
import { SlushPill } from "../../components/SlushPill";
import { typography, spacing, borderRadius, colors } from "../../styles/common";
import { glass } from "../../styles/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const [manualInputEnabled, setManualInputEnabled] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

  const loadTransactionCount = useCallback(async () => {
    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const result = await fetchUserTransactions(userId, {
        limit: 200,
        since: twoMonthsAgo.toISOString().split("T")[0],
      });
      setTransactionCount(result.transactions?.length ?? 0);
    } catch {
      setTransactionCount(null);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    Alert.alert(
      "Disconnect All Accounts",
      "This will remove all connected accounts, transactions, and sync data. You can reconnect anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDisconnecting(true);
              await disconnectAllAccounts(userId);
              setAccounts([]);
              setTransactionCount(0);
            } catch (error) {
              Alert.alert("Error", "Failed to disconnect accounts. Please try again.");
            } finally {
              setIsDisconnecting(false);
            }
          },
        },
      ],
    );
  }, [userId]);

  // Load accounts function
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      const userAccounts = await fetchUserAccounts(userId, { importedOnly: true });

      const transformedAccounts = userAccounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          logo: getAccountLogo(account.type),
          provider: "Plaid",
          lastSynced: account.updated_at || new Date().toISOString(),
          status: "idle" as const,
          accountType: capitalizeFirst(account.subtype || account.type),
          balance: account.balances?.current || 0,
        }));

      setAccounts(transformedAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts in settings:", error);
      // Keep empty array if no accounts
      setAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
    loadTransactionCount();
  }, [loadAccounts, loadTransactionCount]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadTransactionCount();
    }, [loadAccounts, loadTransactionCount]),
  );

  // Helper functions
  const getAccountLogo = (type: string) => {
    switch (type?.toLowerCase()) {
      case "depository":
        return "🏦";
      case "credit":
        return "💳";
      case "loan":
        return "🏠";
      case "investment":
        return "📈";
      default:
        return "🏦";
    }
  };

  const capitalizeFirst = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

  // Transform accounts for TransactionTable component
  const accountTableData = accounts.map((account) => ({
    id: account.id,
    merchant: account.name,
    date: account.lastSynced, // Not used for account tables
    emoji: account.logo,
    provider: account.provider,
    balance: account.balance,
    syncStatus: {
      status: account.status,
      lastSynced: account.lastSynced,
    },
  }));

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtle}>
            {transactionCount !== null
              ? `${accounts.length} accounts · ${transactionCount} transactions`
              : "Manage your Daily Dollars"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Accounts & Sync */}
        <TransactionTable
          title="Accounts & Sync"
          headerIcon={<Building2 size={16} color="#fff" />}
          data={accountTableData}
          style={{ marginBottom: spacing.xl }}
        />

        {/* Account Actions */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <Pressable
              onPress={() => router.push("/connect-accounts")}
              style={[styles.buttonOutline, styles.rowCenter]}
            >
              <Plus size={16} color="#111827" style={{ marginRight: 6 }} />
              <Text style={[typography.bodyMedium, styles.buttonText]}>
                Connect New Account
              </Text>
            </Pressable>
            {accounts.length > 0 && (
              <Pressable
                onPress={handleDisconnect}
                disabled={isDisconnecting}
                style={[styles.buttonOutline, styles.rowCenter, {
                  marginTop: spacing.md,
                  borderColor: "#EF4444",
                  opacity: isDisconnecting ? 0.5 : 1,
                }]}
              >
                <Trash2 size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[typography.bodyMedium, { color: "#EF4444", fontWeight: "600" }]}>
                  {isDisconnecting ? "Disconnecting..." : "Disconnect All Accounts"}
                </Text>
              </Pressable>
            )}
          </CardContent>
        </Card>

        {/* Bills & Ignore Rules */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#FDBA74" }]}>
                <Receipt size={16} color="#C2410C" />
              </View>
              <Text style={typography.heading}>Bills & Ignore Rules</Text>
            </View>
            <Pressable
              onPress={() => router.push("/manage-bills")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <View style={styles.row}>
                <Receipt size={16} color="#111827" />
                <Text style={typography.body}>Manage Bills</Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
            <Separator style={{ marginVertical: spacing.sm }} />
            <Pressable
              onPress={() => router.push("/ignore-rules")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <View style={styles.row}>
                <Info size={16} color="#111827" />
                <Text style={typography.body}>Ignored Transactions</Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
          </CardContent>
        </Card>

        {/* Manual Inputs */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
                <Plus size={16} color="#4B5563" />
              </View>
              <Text style={typography.heading}>Manual Inputs</Text>
              <Badge style={{ marginLeft: spacing.sm }} variant="secondary">
                Temporary
              </Badge>
            </View>
            <Pressable
              onPress={() => setManualInputEnabled(!manualInputEnabled)}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <View>
                <Text style={typography.bodyMedium}>
                  Enable manual transactions
                </Text>
                <Text style={typography.caption}>
                  Add transactions manually when needed
                </Text>
              </View>
              <Text style={typography.bodySemibold}>
                {manualInputEnabled ? "On" : "Off"}
              </Text>
            </Pressable>
            {manualInputEnabled && (
              <View>
                <Separator style={{ marginVertical: spacing.md }} />
                <Pressable
                  style={[
                    styles.buttonOutline,
                    styles.rowCenter,
                    { marginTop: spacing.md },
                  ]}
                >
                  <Plus size={16} color="#111827" style={{ marginRight: 6 }} />
                  <Text style={[typography.bodyMedium, styles.buttonText]}>
                    Add Manual Transaction
                  </Text>
                </Pressable>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Budget Setup */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
                <Receipt size={16} color="#16A34A" />
              </View>
              <Text style={typography.heading}>Budget Setup</Text>
            </View>
            <Pressable
              onPress={() => router.push("/onboarding")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <View>
                <Text style={typography.bodyMedium}>Income & Pay Period</Text>
                <Text style={typography.caption}>
                  Update paycheck, rent, and period dates
                </Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
          </CardContent>
        </Card>

        {/* Help & Info */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
                <HelpCircle size={16} color="#1D4ED8" />
              </View>
              <Text style={typography.heading}>Help & Information</Text>
            </View>
            <Pressable
              onPress={() => router.push("/streaks-slush-explainer")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <Text style={typography.body}>How streaks & slush work</Text>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
            <Separator style={{ marginVertical: spacing.sm }} />
            <Pressable
              onPress={() => router.push("/payday-explainer")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <Text style={typography.body}>How payday math works</Text>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
            <Separator style={{ marginVertical: spacing.sm }} />
            <Pressable
              onPress={() => router.push("/end-of-period-celebration")}
              style={[styles.settingItem, styles.rowBetween]}
            >
              <Text style={typography.body}>
                Preview end-of-period celebration
              </Text>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
          </CardContent>
        </Card>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
  scroll: { padding: spacing.lg },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  accountLogo: {
    width: 40,
    height: 40,
    borderRadius: glass.radius,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  settingItem: { paddingVertical: spacing.md },
  buttonOutline: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: glass.radius,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: { fontWeight: "600" },
});
