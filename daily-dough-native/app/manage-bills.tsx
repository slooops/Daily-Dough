import React, { useMemo, useState, useCallback } from "react";
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
import {
  ChevronLeft,
  DollarSign,
  Receipt,
  Trash2,
  Info,
  Plus,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import {
  fetchBills,
  addBill,
  deleteBill,
  Bill,
} from "../services/billsService";
import { recomputeAllowance } from "../services/allowanceService";
import { glass } from "../styles/theme";

export default function ManageBillsScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    frequency: "monthly" as "monthly" | "yearly",
  });

  const userId = "demo";

  const loadBills = useCallback(async () => {
    const data = await fetchBills(userId);
    setBills(data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills]),
  );

  const monthlyTotal = useMemo(
    () =>
      bills.reduce((sum, b) => {
        const amt = b.amount ?? 0;
        const freq = b.amount_strategy ?? "monthly";
        return sum + (freq === "yearly" ? amt / 12 : amt);
      }, 0),
    [bills],
  );

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount) return;
    const amountNum = parseFloat(newBill.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) return;

    const result = await addBill(
      userId,
      newBill.name,
      amountNum,
      newBill.frequency,
    );
    if (result) {
      setBills((prev) => [result, ...prev]);
      setNewBill({ name: "", amount: "", frequency: "monthly" });
      recomputeAllowance(userId);
    }
  };

  const handleDeleteBill = async (id: string) => {
    const ok = await deleteBill(id);
    if (ok) {
      setBills((prev) => prev.filter((b) => b.id !== id));
      recomputeAllowance(userId);
    }
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
        {isLoading ? (
          <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
        ) : bills.length > 0 ? (
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
                      <Text style={styles.itemTitle}>{b.name}</Text>
                      <Text style={styles.muted}>
                        {b.amount_strategy ?? "monthly"}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.value}>
                        ${(b.amount ?? 0).toFixed(2)}
                      </Text>
                      <Pressable
                        onPress={() => handleDeleteBill(b.id)}
                        style={styles.iconBtn}
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
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <Text style={[styles.muted, { textAlign: "center" }]}>
                No bills yet — add one below
              </Text>
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
                value={newBill.name}
                onChangeText={(t) =>
                  setNewBill((prev) => ({ ...prev, name: t }))
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
              <Pressable
                onPress={() =>
                  setNewBill((prev) => ({
                    ...prev,
                    frequency:
                      prev.frequency === "monthly" ? "yearly" : "monthly",
                  }))
                }
                style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
              >
                <Text style={styles.buttonSecondaryText}>
                  Frequency: {newBill.frequency}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAddBill}
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
    borderRadius: glass.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: glass.radiusLarge,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: glass.radius,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonSecondaryText: { fontWeight: "600", color: "#111827" },
  iconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: glass.radius,
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
