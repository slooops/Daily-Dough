import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface Transaction {
  id: number | string;
  date: string;
  merchant: string;
  amount: number;
  tag: "spend" | "ignored" | "bill";
  category?: string;
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isNegative = transaction.amount < 0;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        <Text style={styles.meta}>
          {new Date(transaction.date).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <Text
        style={[styles.amount, { color: isNegative ? "#DC2626" : "#16A34A" }]}
      >
        {isNegative ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  merchant: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
});
