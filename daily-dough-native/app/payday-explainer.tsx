import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  CheckCircle,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";

export default function PaydayExplainerScreen() {
  const router = useRouter();
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
          <Text style={styles.title}>Payday Anchoring</Text>
          <Text style={styles.subtle}>How pay periods work</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Overview */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.circle, { backgroundColor: "#2563EB" }]}>
              <Calendar size={16} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Budget Setup</Text>
          </View>
          <Text style={[styles.muted, { marginTop: 6 }]}>
            We anchor your budget to your actual payday so allowances align with
            income.
          </Text>
        </View>

        {/* Bi-weekly */}
        <View
          style={[
            styles.card,
            { borderLeftWidth: 4, borderLeftColor: "#3B82F6" },
          ]}
        >
          <View style={styles.row}>
            <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
              <Calendar size={16} color="#1D4ED8" />
            </View>
            <Text style={[styles.itemTitle, { color: "#1D4ED8" }]}>
              Bi-weekly (Default)
            </Text>
            <Badge variant="secondary" style={{ marginLeft: 8 }}>
              Most common
            </Badge>
          </View>
          <View style={{ gap: 6, marginTop: 8 }}>
            <Text style={styles.muted}>• Paycheck every 2 weeks (26/yr)</Text>
            <Text style={styles.muted}>
              • Budget periods align to pay dates
            </Text>
            <Text style={styles.muted}>
              • 3-paycheck months handled automatically
            </Text>
          </View>
          <View
            style={[
              styles.pillInfo,
              { backgroundColor: "#ECFDF5", marginTop: 10 },
            ]}
          >
            <TrendingUp size={14} color="#16A34A" />
            <Text style={[styles.muted, { color: "#166534", marginLeft: 6 }]}>
              Daily = (Paycheck - Monthly bills ÷ 2) ÷ 14
            </Text>
          </View>
        </View>

        {/* Monthly */}
        <View
          style={[
            styles.card,
            { borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
          ]}
        >
          <View style={styles.row}>
            <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
              <Calendar size={16} color="#EA580C" />
            </View>
            <Text style={[styles.itemTitle, { color: "#EA580C" }]}>
              Monthly
            </Text>
            <Badge variant="secondary" style={{ marginLeft: 8 }}>
              Alternative
            </Badge>
          </View>
          <View style={{ gap: 6, marginTop: 8 }}>
            <Text style={styles.muted}>• Paycheck once a month (12/yr)</Text>
            <Text style={styles.muted}>• Periods follow calendar months</Text>
            <Text style={styles.muted}>• Simpler monthly planning</Text>
          </View>
          <View
            style={[
              styles.pillInfo,
              { backgroundColor: "#ECFDF5", marginTop: 10 },
            ]}
          >
            <DollarSign size={14} color="#16A34A" />
            <Text style={[styles.muted, { color: "#166534", marginLeft: 6 }]}>
              Daily = (Paycheck - Monthly bills) ÷ days in month
            </Text>
          </View>
        </View>

        {/* Special Cases */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
              <TrendingUp size={16} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Special Cases</Text>
          </View>
          <View style={{ gap: 10, marginTop: 8 }}>
            <View style={[styles.row, { alignItems: "flex-start" }]}>
              <CheckCircle size={16} color="#16A34A" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>3-Paycheck Months</Text>
                <Text style={styles.muted}>
                  We detect them and boost discretionary accordingly.
                </Text>
                <Badge
                  variant="default"
                  style={{ marginTop: 6 }}
                  textStyle={{ color: "#fff", fontSize: 10 }}
                >
                  💰 This month has 3 paychecks → discretionary higher
                </Badge>
              </View>
            </View>
            <View style={[styles.row, { alignItems: "flex-start" }]}>
              <AlertCircle size={16} color="#2563EB" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Carryover Logic</Text>
                <Text style={styles.muted}>
                  100% of daily over/under goes to Period Slush to smooth
                  variations.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Setup Inputs */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
              <DollarSign size={16} color="#4B5563" />
            </View>
            <Text style={styles.cardTitle}>Setup Inputs</Text>
          </View>
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.muted}>
              • Payday anchor date (detected from linked accounts)
            </Text>
            <Text style={styles.muted}>
              • Paycheck amounts (manual or auto)
            </Text>
            <Text style={styles.muted}>
              • Monthly bills total (from flagged transactions)
            </Text>
          </View>
          <Separator style={{ marginVertical: 10 }} />
          <Text style={styles.muted}>
            Rounding: daily allowances round to nearest $1; any remainder
            applied on the last day (±$1).
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          style={[styles.buttonPrimary, { marginBottom: 24 }]}
        >
          <Text style={[styles.buttonPrimaryText]}>Back to Settings</Text>
        </Pressable>
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
  pillInfo: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700" },
});
