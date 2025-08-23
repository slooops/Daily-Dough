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
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";

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
        <View style={[styles.cardElevated]}>
          <View style={[styles.rowBetween, { marginBottom: 8 }]}>
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
        </View>

        {/* Current bills list */}
        {bills.length > 0 && (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
                <Receipt size={16} color="#EA580C" />
              </View>
              <Text style={styles.cardTitle}>Current Bills</Text>
            </View>
            {bills.map((b, i) => (
              <View key={b.id}>
                <View style={styles.rowBetween}>
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
                {i < bills.length - 1 && <Separator />}
              </View>
            ))}
          </View>
        )}

        {/* Add a manual bill */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Bill Manually</Text>
          <View style={{ gap: 8 }}>
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
        </View>

        {/* Recent transactions to flag */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {txs.map((t, i) => (
            <View key={t.id}>
              <Pressable
                onPress={() => toggleTxBill(t.id)}
                style={[styles.rowBetween, { paddingVertical: 12 }]}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          t.tag === "bill" ? "#FFEDD5" : "#F3F4F6",
                      },
                    ]}
                  >
                    <Receipt
                      size={16}
                      color={t.tag === "bill" ? "#EA580C" : "#4B5563"}
                    />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{t.merchant}</Text>
                    <View style={styles.row}>
                      <Text style={styles.muted}>
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      {t.tag === "bill" && (
                        <Badge variant="secondary" style={{ marginLeft: 6 }}>
                          Bill
                        </Badge>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={[styles.value, { color: "#DC2626" }]}>
                  ${Math.abs(t.amount).toFixed(2)}
                </Text>
              </Pressable>
              {i < txs.length - 1 && <Separator />}
            </View>
          ))}
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
  cardElevated: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700" },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonSecondaryText: { fontWeight: "600", color: "#111827" },
  iconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  pillInfo: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
});
