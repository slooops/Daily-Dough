import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ChevronLeft, EyeOff, Info, Plus, Trash2 } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { TransactionTable } from "../components/ui/TransactionTable";
import {
  fetchIgnoreRules,
  addIgnoreRule,
  deleteIgnoreRule,
  IgnoreRule,
} from "../services/ignoredService";
import { fetchUserTransactions } from "../services/plaidService";
import { recomputeAllowance } from "../services/allowanceService";
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../utils/categoryIcons";
import { inferCategoryFromMerchant } from "../utils/categoryInference";
import { glass } from "../styles/theme";

export default function IgnoreRulesScreen() {
  const router = useRouter();
  const [rules, setRules] = useState<IgnoreRule[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPattern, setNewPattern] = useState("");

  const userId = "demo";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [rulesData, txResult] = await Promise.all([
      fetchIgnoreRules(userId),
      fetchUserTransactions(userId, { limit: 15 }),
    ]);
    setRules(rulesData);
    setRecentTxs(txResult.transactions ?? []);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Build a set of ignored transaction_ids and patterns for highlighting
  const ignoredTxIds = new Set(
    rules.filter((r) => r.transaction_id).map((r) => r.transaction_id!),
  );
  const ignoredPatterns = rules
    .filter((r) => r.merchant_pattern)
    .map((r) => r.merchant_pattern!.toLowerCase());

  const isIgnored = (tx: any): boolean => {
    if (ignoredTxIds.has(tx.transaction_id)) return true;
    const merchant = (tx.merchant_name || tx.name || "").toLowerCase();
    return ignoredPatterns.some((p) => merchant.includes(p));
  };

  const handleAddPattern = async () => {
    if (!newPattern.trim()) return;
    const result = await addIgnoreRule(userId, {
      merchant_pattern: newPattern.trim(),
    });
    if (result) {
      setRules((prev) => [result, ...prev]);
      setNewPattern("");
      recomputeAllowance(userId);
    }
  };

  const handleIgnoreTx = async (transactionId: string) => {
    if (ignoredTxIds.has(transactionId)) return;
    const result = await addIgnoreRule(userId, {
      transaction_id: transactionId,
    });
    if (result) {
      setRules((prev) => [result, ...prev]);
      recomputeAllowance(userId);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const ok = await deleteIgnoreRule(id);
    if (ok) {
      setRules((prev) => prev.filter((r) => r.id !== id));
      recomputeAllowance(userId);
    }
  };

  // Transform rules for TransactionTable
  const rulesTableData = rules.map((r) => ({
    id: r.id,
    merchant: r.merchant_pattern ?? r.transaction_id ?? "Unknown",
    date: "",
    subtitle: r.merchant_pattern ? "Pattern match" : "Specific transaction",
    icon: <EyeOff size={16} color="#4B5563" />,
    iconBackgroundColor: "#F3F4F6",
    actionButton: {
      icon: <Trash2 size={16} color="#DC2626" />,
      onPress: () => handleDeleteRule(r.id),
      backgroundColor: "#FEF2F2",
    },
  }));

  // Transform transactions for TransactionTable
  const transactionTableData = recentTxs.map((t: any) => {
    const merchant = t.merchant_name || t.name || "Unknown";
    const category = inferCategoryFromMerchant(
      merchant,
      t.category_primary || "",
    );
    const ignored = isIgnored(t);
    return {
      id: t.transaction_id || t.id || "unknown",
      merchant,
      date: t.date || "",
      amount: t.amount ?? 0,
      tag: ignored ? "ignored" : "spend",
      icon: ignored ? (
        <EyeOff size={16} color="#4B5563" />
      ) : (
        getCategoryIcon(category)
      ),
      iconBackgroundColor: ignored
        ? "#F3F4F6"
        : getCategoryBackgroundColor(category),
      onPress: ignored ? undefined : () => handleIgnoreTx(t.transaction_id),
    };
  });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#111827" />
        </Pressable>
        <View>
          <Text style={styles.title}>Ignore Rules</Text>
          <Text style={styles.subtle}>Manage transfers & CC payments</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={[styles.row, { alignItems: "flex-start" }]}>
              <Info size={18} color="#2563EB" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>How Ignore Rules Work</Text>
                <Text style={[styles.muted, { marginTop: 4 }]}>
                  Mark transfers and card payments as "Ignored" so they won't
                  affect daily spend. They'll still appear in your feed.
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {isLoading ? (
          <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
        ) : (
          <>
            {rules.length > 0 && (
              <TransactionTable
                title="Active Ignore Rules"
                data={rulesTableData}
                headerIcon={<EyeOff size={16} color="#4B5563" />}
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Add rule by pattern */}
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
                  Add Ignore Rule
                </Text>
                <View style={{ gap: 12 }}>
                  <TextInput
                    placeholder="Merchant pattern (e.g., CHASE CARD)"
                    value={newPattern}
                    onChangeText={setNewPattern}
                    style={styles.input}
                  />
                  <Pressable
                    onPress={handleAddPattern}
                    style={[styles.buttonPrimary, { alignSelf: "flex-start" }]}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={[styles.buttonPrimaryText, { marginLeft: 6 }]}>
                      Add Rule
                    </Text>
                  </Pressable>
                </View>
              </CardContent>
            </Card>

            {/* Recent transactions — tap to ignore */}
            <TransactionTable
              title="Recent Transactions"
              data={transactionTableData}
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
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
  backBtn: { padding: 8, borderRadius: glass.radius },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
  scroll: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  itemTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  muted: { fontSize: 12, color: "#6B7280" },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: glass.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: glass.radiusLarge,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
