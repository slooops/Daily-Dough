import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  DollarSign,
  Receipt,
  Trash2,
  Info,
  Plus,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import {
  TransactionTable,
  TransactionTableItem,
} from "../components/ui/TransactionTable";
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../utils/categoryIcons";

type Bill = {
  id: number;
  merchant: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "yearly";
};
type Tx = {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  tag: "spend" | "bill";
  category: string;
};

export default function ManageBillsScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([
    { id: 1, merchant: "Rent Payment", amount: 1200, frequency: "monthly" },
    { id: 2, merchant: "Netflix", amount: 15.99, frequency: "monthly" },
  ]);
  const [txs, setTxs] = useState<Tx[]>([
    {
      id: 1,
      date: "2025-08-17T14:30",
      merchant: "Electric Company",
      amount: -85.5,
      tag: "spend",
      category: "Utilities",
    },
    {
      id: 2,
      date: "2025-08-16T09:15",
      merchant: "Netflix",
      amount: -15.99,
      tag: "bill",
      category: "Subscriptions",
    },
    {
      id: 3,
      date: "2025-08-15T16:22",
      merchant: "Starbucks",
      amount: -4.75,
      tag: "spend",
      category: "Food",
    },
    {
      id: 4,
      date: "2025-08-15T08:00",
      merchant: "Rent Payment",
      amount: -1200,
      tag: "bill",
      category: "Housing",
    },
  ]);
  const [newBill, setNewBill] = useState({
    merchant: "",
    amount: "",
    frequency: "monthly" as Bill["frequency"],
  });

  const monthlyTotal = useMemo(
    () =>
      bills.reduce((sum, b) => {
        const m =
          b.frequency === "monthly"
            ? b.amount
            : b.frequency === "weekly"
            ? b.amount * 4.33
            : b.frequency === "biweekly"
            ? b.amount * 2.17
            : b.amount / 12;
        return sum + m;
      }, 0),
    [bills]
  );

  // Transform transactions for TransactionTable
  const transactionTableData: TransactionTableItem[] = useMemo(
    () =>
      txs.map((t) => ({
        id: t.id.toString(),
        date: t.date,
        merchant: t.merchant,
        amount: t.amount,
        tag: t.tag,
        category: t.category,
        icon: getCategoryIcon(t.category),
        iconBackgroundColor: getCategoryBackgroundColor(t.category),
        onPress: () => toggleTxBill(t.id),
        badge:
          t.tag === "bill"
            ? { text: "Bill", variant: "secondary" as const }
            : undefined,
      })),
    [txs]
  );

  const toggleTxBill = (id: number) =>
    setTxs((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, tag: t.tag === "bill" ? "spend" : "bill" } : t
      )
    );
  const removeBill = (id: number) =>
    setBills((prev) => prev.filter((b) => b.id !== id));
  const addBill = () => {
    if (!newBill.merchant || !newBill.amount) return;
    const amountNum = parseFloat(newBill.amount);
    if (Number.isNaN(amountNum)) return;
    setBills((prev) =>
      prev.concat({
        id: Date.now(),
        merchant: newBill.merchant,
        amount: amountNum,
        frequency: newBill.frequency,
      })
    );
    setNewBill({ merchant: "", amount: "", frequency: "monthly" });
  };

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
          <Text style={styles.title}>Manage Bills</Text>
          <Text style={styles.subtle}>Flag non-discretionary expenses</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Monthly total card */}
        <Card variant="elevated" style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={[styles.rowBetween, { marginBottom: 12 }]}>
              <View style={styles.row}>
                <View style={[styles.circle, { backgroundColor: "#22C55E" }]}>
                  <DollarSign size={16} color="#fff" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Estimated Monthly Bills</Text>
                  <Text style={styles.muted}>Live calculation</Text>
                </View>
              </View>
              <Text style={[styles.value, { color: "#16A34A", fontSize: 20 }]}>
                ${monthlyTotal.toFixed(0)}
              </Text>
            </View>
            <View style={[styles.pillInfo, { backgroundColor: "#EFF6FF" }]}>
              <Info size={14} color="#2563EB" />
              <Text style={[styles.muted, { color: "#2563EB", marginLeft: 4 }]}>
                Bills don't count against daily spend
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Current bills list */}
        {bills.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <CardContent style={{ padding: 0 }}>
              <View
                style={{
                  padding: 24,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: "#E5E7EB",
                }}
              >
                <View style={styles.row}>
                  <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
                    <Receipt size={16} color="#EA580C" />
                  </View>
                  <Text style={styles.cardTitle}>Current Bills</Text>
                </View>
              </View>
              {bills.map((b, i) => (
                <View key={b.id}>
                  <View
                    style={[
                      styles.rowBetween,
                      { paddingHorizontal: 24, paddingVertical: 16 },
                    ]}
                  >
                    <View>
                      <Text style={styles.itemTitle}>{b.merchant}</Text>
                      <Text style={styles.muted}>{b.frequency}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={[styles.value]}>${b.amount.toFixed(2)}</Text>
                      <Pressable
                        onPress={() => removeBill(b.id)}
                        style={[styles.iconBtn]}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </Pressable>
                    </View>
                  </View>
                  {i < bills.length - 1 && (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: "#E5E7EB",
                        marginHorizontal: 24,
                      }}
                    />
                  )}
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add a manual bill */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
              Add Bill Manually
            </Text>
            <View style={{ gap: 12 }}>
              <TextInput
                placeholder="Bill Name"
                value={newBill.merchant}
                onChangeText={(t) =>
                  setNewBill((prev) => ({ ...prev, merchant: t }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Amount"
                keyboardType="numeric"
                value={newBill.amount}
                onChangeText={(t) =>
                  setNewBill((prev) => ({ ...prev, amount: t }))
                }
                style={styles.input}
              />
              {/* Simple frequency cycler */}
              <Pressable
                onPress={() =>
                  setNewBill((prev) => ({
                    ...prev,
                    frequency:
                      prev.frequency === "monthly"
                        ? "weekly"
                        : prev.frequency === "weekly"
                        ? "biweekly"
                        : prev.frequency === "biweekly"
                        ? "yearly"
                        : "monthly",
                  }))
                }
                style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
              >
                <Text style={styles.buttonSecondaryText}>
                  Frequency: {newBill.frequency}
                </Text>
              </Pressable>
              <Pressable
                onPress={addBill}
                style={[styles.buttonPrimary, { alignSelf: "stretch" }]}
              >
                <Plus size={16} color="#fff" />
                <Text style={[styles.buttonPrimaryText, { marginLeft: 6 }]}>
                  Add Bill
                </Text>
              </Pressable>
            </View>
          </CardContent>
        </Card>

        {/* Recent transactions to flag */}
        <TransactionTable
          title="Recent Transactions"
          data={transactionTableData}
          headerIcon={<Receipt size={16} color="#1D4ED8" />}
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
  cardTitle: { fontWeight: "600", fontSize: 20 },
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
  itemTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  muted: { fontSize: 12, color: "#6B7280" },
  value: { fontWeight: "700" },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    paddingVertical: 16,
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
  iconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
  },
  pillInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
});
