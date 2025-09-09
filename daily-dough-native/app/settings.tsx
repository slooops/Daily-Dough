import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
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
} from "lucide-react-native";
import { fetchUserAccounts } from "../services/plaidService";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { Card, CardContent } from "../components/ui/Card";
import { SyncStatus } from "../components/SyncStatus.native";
import { SlushPill } from "../components/SlushPill";
import { typography, spacing, borderRadius, colors } from "../styles/common";

export default function SettingsScreen() {
  const router = useRouter();
  const [manualInputEnabled, setManualInputEnabled] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

  // Load accounts function
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      const userAccounts = await fetchUserAccounts(userId);

      // Transform API accounts to UI format
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
  }, [loadAccounts]);

  // Reload accounts when screen comes into focus (after navigation)
  useFocusEffect(
    useCallback(() => {
      // Only reload if we have existing data (avoid double-loading on first mount)
      if (accounts.length > 0) {
        console.log("⚙️ Settings screen focused, reloading accounts...");
        loadAccounts();
      }
    }, [loadAccounts, accounts.length])
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

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#111827" />
        </Pressable>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtle}>Manage your Daily Dollars</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Accounts & Sync */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#2563EB" }]}>
                <Building2 size={16} color="#fff" />
              </View>
              <Text style={typography.heading}>Accounts & Sync</Text>
            </View>
            <View>
              {isLoadingAccounts ? (
                <View
                  style={{ paddingVertical: spacing.xl, alignItems: "center" }}
                >
                  <Loader2 size={24} color="#6B7280" />
                  <Text style={[typography.caption, { marginTop: spacing.sm }]}>
                    Loading accounts...
                  </Text>
                </View>
              ) : accounts.length > 0 ? (
                accounts.map((a, i) => (
                  <View key={a.id}>
                    <View style={styles.rowBetween}>
                      <View style={styles.row}>
                        <View style={styles.accountLogo}>
                          <Text style={{ fontSize: 16 }}>{a.logo}</Text>
                        </View>
                        <View>
                          <Text style={typography.bodyMedium}>{a.name}</Text>
                          <View style={styles.row}>
                            <Text style={typography.caption}>{a.provider}</Text>
                            <Text
                              style={[typography.caption, { marginLeft: 4 }]}
                            >
                              •
                            </Text>
                            <Text
                              style={[
                                typography.caption,
                                { fontWeight: "600" },
                              ]}
                            >
                              ${Math.abs(a.balance).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <SyncStatus status={a.status} lastSynced={a.lastSynced} />
                    </View>
                    {i < accounts.length - 1 && (
                      <Separator style={{ marginVertical: spacing.md }} />
                    )}
                  </View>
                ))
              ) : (
                <View
                  style={{ paddingVertical: spacing.xl, alignItems: "center" }}
                >
                  <Text style={[typography.caption, { textAlign: "center" }]}>
                    No accounts connected yet.{"\n"}
                    Connect a bank account to get started.
                  </Text>
                </View>
              )}
            </View>
            <Separator style={{ marginVertical: spacing.md }} />

            <Pressable
              onPress={() => router.push("/connect-accounts")}
              style={[styles.buttonOutline, styles.rowCenter]}
            >
              <Plus size={16} color="#111827" style={{ marginRight: 6 }} />
              <Text style={[typography.bodyMedium, styles.buttonText]}>
                Connect New Account
              </Text>
            </Pressable>
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
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.sm, borderRadius: borderRadius.lg },
  title: typography.subtitle,
  subtle: typography.caption,
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
    borderRadius: borderRadius.lg,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  settingItem: { paddingVertical: spacing.md },
  buttonOutline: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: { fontWeight: "600" },
});
