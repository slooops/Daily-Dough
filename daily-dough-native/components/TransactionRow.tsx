import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface Transaction {
  // Plaid transaction structure
  transaction_id: string;
  account_id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  category_primary: string;
  category_secondary: string | null;
  date: Date | string;

  // Optional UI-specific properties that might be added during processing
  id?: number | string; // Legacy support
  merchant?: string; // Processed merchant name
  tag?: "spend" | "ignored" | "bill";
  category?: string; // Processed category
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isNegative = transaction.amount < 0;
  const merchantName =
    transaction.merchant ||
    transaction.merchant_name ||
    transaction.name ||
    "Unknown";

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.merchant}>{merchantName}</Text>
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
