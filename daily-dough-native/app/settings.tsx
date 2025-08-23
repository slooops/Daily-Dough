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
import { SyncStatus } from "../components/SyncStatus.native";
import { SlushPill } from "../components/SlushPill";

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
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#2563EB" }]}>
              <Building2 size={16} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Accounts & Sync</Text>
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
                      <Text style={styles.itemTitle}>{a.name}</Text>
                      <Text style={styles.muted}>{a.provider}</Text>
                    </View>
                  </View>
                  <SyncStatus status={a.status} lastSynced={a.lastSynced} />
                </View>
                {i < accounts.length - 1 && <Separator />}
              </View>
            ))}
          </View>
          <Separator style={{ marginVertical: 12 }} />

          <Pressable
            onPress={() => router.push("/connect-accounts")}
            style={[styles.buttonOutline, styles.rowCenter]}
          >
            <Plus size={16} color="#111827" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Connect New Account</Text>
          </Pressable>
        </View>

        {/* Bills & Ignore Rules */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#FDBA74" }]}>
              <Receipt size={16} color="#C2410C" />
            </View>
            <Text style={styles.cardTitle}>Bills & Ignore Rules</Text>
          </View>
          <Pressable
            onPress={() => router.push("/manage-bills")}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <View style={styles.row}>
              <Receipt size={16} color="#111827" />
              <Text style={styles.settingTitle}>Manage Bills</Text>
            </View>
            <ChevronRight size={16} color="#6B7280" />
          </Pressable>
          <Separator />
          <Pressable
            onPress={() => router.push("/ignore-rules")}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <View style={styles.row}>
              <Info size={16} color="#111827" />
              <Text style={styles.settingTitle}>Ignored Transactions</Text>
            </View>
            <ChevronRight size={16} color="#6B7280" />
          </Pressable>
        </View>

        {/* Manual Inputs */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
              <Plus size={16} color="#4B5563" />
            </View>
            <Text style={styles.cardTitle}>Manual Inputs</Text>
            <Badge style={{ marginLeft: 8 }} variant="secondary">
              Temporary
            </Badge>
          </View>
          <Pressable
            onPress={() => setManualInputEnabled(!manualInputEnabled)}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <View>
              <Text style={styles.itemTitle}>Enable manual transactions</Text>
              <Text style={styles.muted}>
                Add transactions manually when needed
              </Text>
            </View>
            <Text style={styles.switchText}>
              {manualInputEnabled ? "On" : "Off"}
            </Text>
          </Pressable>
          {manualInputEnabled && (
            <View>
              <Separator />
              <Pressable
                style={[
                  styles.buttonOutline,
                  styles.rowCenter,
                  { marginTop: 12 },
                ]}
              >
                <Plus size={16} color="#111827" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Add Manual Transaction</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Help & Info */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
              <HelpCircle size={16} color="#1D4ED8" />
            </View>
            <Text style={styles.cardTitle}>Help & Information</Text>
          </View>
          <Pressable
            onPress={() => router.push("/streaks-slush-explainer")}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <Text style={styles.settingTitle}>How streaks & slush work</Text>
            <ChevronRight size={16} color="#6B7280" />
          </Pressable>
          <Separator />
          <Pressable
            onPress={() => router.push("/payday-explainer")}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <Text style={styles.settingTitle}>How payday math works</Text>
            <ChevronRight size={16} color="#6B7280" />
          </Pressable>
          <Separator />
          <Pressable
            onPress={() => router.push("/end-of-period-celebration")}
            style={[styles.settingItem, styles.rowBetween]}
          >
            <Text style={styles.settingTitle}>
              Preview end-of-period celebration
            </Text>
            <ChevronRight size={16} color="#6B7280" />
          </Pressable>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: { padding: 8, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
  scroll: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  accountLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  itemTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  muted: { fontSize: 12, color: "#6B7280" },
  settingItem: { paddingVertical: 10 },
  settingTitle: { fontSize: 14 },
  buttonOutline: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: { fontWeight: "600" },
  switchText: { fontWeight: "600", color: "#111827" },
});
