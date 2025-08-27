import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  Plus,
  Receipt,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { Card, CardContent } from "../components/ui/Card";
import { SyncStatus } from "../components/SyncStatus.native";
import { SlushPill } from "../components/SlushPill";
import { typography, spacing, borderRadius, colors } from "../styles/common";

export default function SettingsScreen() {
  const router = useRouter();
  const [manualInputEnabled, setManualInputEnabled] = useState(false);

  const accounts = [
    {
      id: 1,
      name: "Chase Checking",
      logo: "🏦",
      provider: "Plaid",
      lastSynced: new Date().toISOString(),
      status: "syncing" as const,
    },
    {
      id: 2,
      name: "Wells Fargo Savings",
      logo: "🏛️",
      provider: "Teller",
      lastSynced: new Date().toISOString(),
      status: "idle" as const,
    },
  ];

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
              {accounts.map((a, i) => (
                <View key={a.id}>
                  <View style={styles.rowBetween}>
                    <View style={styles.row}>
                      <View style={styles.accountLogo}>
                        <Text style={{ fontSize: 16 }}>{a.logo}</Text>
                      </View>
                      <View>
                        <Text style={typography.bodyMedium}>{a.name}</Text>
                        <Text style={typography.caption}>{a.provider}</Text>
                      </View>
                    </View>
                    <SyncStatus status={a.status} lastSynced={a.lastSynced} />
                  </View>
                  {i < accounts.length - 1 && (
                    <Separator style={{ marginVertical: spacing.md }} />
                  )}
                </View>
              ))}
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
