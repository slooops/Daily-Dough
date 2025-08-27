import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, EyeOff, Info, Plus, Trash2 } from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { TransactionTable } from "../components/ui/TransactionTable";
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../utils/categoryIcons";

type Rule = {
  id: number;
  pattern: string;
  type: "Internal Transfer" | "Credit Card Payment" | "Transfer";
};
type Tx = {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  tag: "spend" | "ignored";
  type: Rule["type"];
};

export default function IgnoreRulesScreen() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, pattern: "USAA → Chase Card", type: "Credit Card Payment" },
    { id: 2, pattern: "Transfer from CHECKING", type: "Internal Transfer" },
  ]);
  const [txs, setTxs] = useState<Tx[]>([
    {
      id: 1,
      date: "2025-08-17T16:45",
      merchant: "PAYMENT TO CHASE CARD",
      amount: -300,
      tag: "spend",
      type: "Credit Card Payment",
    },
    {
      id: 2,
      date: "2025-08-16T09:30",
      merchant: "VENMO CASHOUT",
      amount: 45,
      tag: "spend",
      type: "Transfer",
    },
  ]);
  const [newRule, setNewRule] = useState<{
    pattern: string;
    type: Rule["type"];
  }>({ pattern: "", type: "Internal Transfer" });

  const toggleTxIgnore = (id: number) =>
    setTxs((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, tag: t.tag === "ignored" ? "spend" : "ignored" }
          : t
      )
    );
  const removeRule = (id: number) =>
    setRules((prev) => prev.filter((r) => r.id !== id));
  const addRule = () => {
    if (!newRule.pattern) return;
    setRules((prev) =>
      prev.concat({
        id: Date.now(),
        pattern: newRule.pattern,
        type: newRule.type,
      })
    );
    setNewRule({ pattern: "", type: "Internal Transfer" });
  };

  // Transform rule data for TransactionTable component
  const rulesTableData = rules.map((r) => ({
    id: r.id.toString(),
    merchant: r.pattern,
    date: "", // No date for rules
    subtitle: r.type,
    icon: getCategoryIcon(r.type),
    iconBackgroundColor: getCategoryBackgroundColor(r.type),
    actionButton: {
      icon: <Trash2 size={16} color="#DC2626" />,
      onPress: () => removeRule(r.id),
      backgroundColor: "#FEF2F2",
    },
  }));

  // Transform transaction data for TransactionTable component
  const transactionTableData = txs.map((t) => ({
    id: t.id.toString(),
    merchant: t.merchant,
    date: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    amount: Math.abs(t.amount),
    tag: t.tag,
    amountColor: t.amount < 0 ? "#DC2626" : "#059669",
    badge: { text: t.type, variant: "secondary" as const },
    icon:
      t.tag === "ignored" ? (
        <EyeOff size={16} color="#4B5563" />
      ) : (
        getCategoryIcon(t.type)
      ),
    iconBackgroundColor:
      t.tag === "ignored" ? "#F3F4F6" : getCategoryBackgroundColor(t.type),
    onPress: () => toggleTxIgnore(t.id),
  }));

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

        {rules.length > 0 && (
          <TransactionTable
            title="Active Ignore Rules"
            data={rulesTableData}
            headerIcon={<EyeOff size={16} color="#4B5563" />}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Add rule */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
              Add Ignore Rule
            </Text>
            <View style={{ gap: 12 }}>
              <TextInput
                placeholder="Transaction Pattern (e.g., PAYMENT TO CHASE CARD)"
                value={newRule.pattern}
                onChangeText={(t) =>
                  setNewRule((prev) => ({ ...prev, pattern: t }))
                }
                style={styles.input}
              />
              <Pressable
                onPress={() =>
                  setNewRule((prev) => ({
                    ...prev,
                    type:
                      prev.type === "Internal Transfer"
                        ? "Credit Card Payment"
                        : prev.type === "Credit Card Payment"
                        ? "Transfer"
                        : "Internal Transfer",
                  }))
                }
                style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
              >
                <Text style={styles.buttonSecondaryText}>
                  Category: {newRule.type}
                </Text>
              </Pressable>
              <Pressable
                onPress={addRule}
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

        {/* Recent transactions */}
        <TransactionTable
          title="Recent Transactions"
          data={transactionTableData}
          style={{ marginBottom: 16 }}
        />

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
  backBtn: { padding: 8, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
  scroll: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  itemTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  muted: { fontSize: 12, color: "#6B7280" },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  value: { fontWeight: "700" },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonSecondaryText: { fontWeight: "600", color: "#111827" },
});
