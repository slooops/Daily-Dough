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
import {
  ArrowRightLeft,
  ChevronLeft,
  CreditCard,
  EyeOff,
  Info,
  Plus,
  Trash2,
} from "lucide-react-native";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";

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

  const typeColor = (type: Rule["type"]) =>
    type === "Credit Card Payment"
      ? { bg: "#DBEAFE", fg: "#1D4ED8" }
      : type === "Internal Transfer"
      ? { bg: "#DCFCE7", fg: "#16A34A" }
      : { bg: "#F3F4F6", fg: "#4B5563" };

  const typeIcon = (type: Rule["type"]) =>
    type === "Credit Card Payment" ? (
      <CreditCard size={16} color="#111827" />
    ) : (
      <ArrowRightLeft size={16} color="#111827" />
    );

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
        <View style={styles.card}>
          <View style={[styles.row, { alignItems: "flex-start" }]}>
            <Info size={18} color="#2563EB" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>How Ignore Rules Work</Text>
              <Text style={[styles.muted, { marginTop: 4 }]}>
                Mark transfers and card payments as "Ignored" so they won’t
                affect daily spend. They’ll still appear in your feed.
              </Text>
            </View>
          </View>
        </View>

        {rules.length > 0 && (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
                <EyeOff size={16} color="#4B5563" />
              </View>
              <Text style={styles.cardTitle}>Active Ignore Rules</Text>
            </View>
            {rules.map((r, i) => (
              <View key={r.id}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.circle,
                        { backgroundColor: typeColor(r.type).bg },
                      ]}
                    >
                      {typeIcon(r.type)}
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>{r.pattern}</Text>
                      <Text style={[styles.muted]}>{r.type}</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => removeRule(r.id)}
                    style={[styles.iconBtn]}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </Pressable>
                </View>
                {i < rules.length - 1 && <Separator />}
              </View>
            ))}
          </View>
        )}

        {/* Add rule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Ignore Rule</Text>
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

        {/* Recent transactions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {txs.map((t, i) => (
            <View key={t.id}>
              <Pressable
                onPress={() => toggleTxIgnore(t.id)}
                style={[styles.rowBetween, { paddingVertical: 12 }]}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor:
                          t.tag === "ignored"
                            ? "#F3F4F6"
                            : typeColor(t.type).bg,
                      },
                    ]}
                  >
                    {t.tag === "ignored" ? (
                      <EyeOff size={16} color="#4B5563" />
                    ) : (
                      typeIcon(t.type)
                    )}
                  </View>
                  <View>
                    <View style={styles.row}>
                      <Text style={styles.itemTitle}>{t.merchant}</Text>
                      <Badge variant="secondary" style={{ marginLeft: 6 }}>
                        {t.type}
                      </Badge>
                    </View>
                    <Text style={styles.muted}>
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.value,
                    { color: t.amount < 0 ? "#DC2626" : "#16A34A" },
                  ]}
                >
                  {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount).toFixed(2)}
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  value: { fontWeight: "700" },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
});
