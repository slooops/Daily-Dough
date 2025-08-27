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
import { Card, CardContent } from "../components/ui/Card";
import { typography, spacing, borderRadius, colors } from "../styles/common";

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
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#2563EB" }]}>
                <Calendar size={16} color="#fff" />
              </View>
              <Text style={typography.heading}>Budget Setup</Text>
            </View>
            <Text style={[typography.caption, { marginTop: spacing.xs }]}>
              We anchor your budget to your actual payday so allowances align
              with income.
            </Text>
          </CardContent>
        </Card>

        {/* Bi-weekly */}
        <Card
          style={{
            marginBottom: spacing.xl,
            borderLeftWidth: 4,
            borderLeftColor: "#3B82F6",
          }}
        >
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
                <Calendar size={16} color="#1D4ED8" />
              </View>
              <Text style={[typography.bodyMedium, { color: "#1D4ED8" }]}>
                Bi-weekly (Default)
              </Text>
              <Badge variant="secondary" style={{ marginLeft: spacing.sm }}>
                Most common
              </Badge>
            </View>
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              <Text style={typography.caption}>
                • Paycheck every 2 weeks (26/yr)
              </Text>
              <Text style={typography.caption}>
                • Budget periods align to pay dates
              </Text>
              <Text style={typography.caption}>
                • 3-paycheck months handled automatically
              </Text>
            </View>
            <View
              style={[
                styles.pillInfo,
                { backgroundColor: "#ECFDF5", marginTop: spacing.md },
              ]}
            >
              <TrendingUp size={14} color="#16A34A" />
              <Text
                style={[
                  typography.caption,
                  { color: "#166534", marginLeft: spacing.xs },
                ]}
              >
                Daily = (Paycheck - Monthly bills ÷ 2) ÷ 14
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card
          style={{
            marginBottom: spacing.xl,
            borderLeftWidth: 4,
            borderLeftColor: "#F59E0B",
          }}
        >
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
                <Calendar size={16} color="#EA580C" />
              </View>
              <Text style={[typography.bodyMedium, { color: "#EA580C" }]}>
                Monthly
              </Text>
              <Badge variant="secondary" style={{ marginLeft: spacing.sm }}>
                Alternative
              </Badge>
            </View>
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              <Text style={typography.caption}>
                • Paycheck once a month (12/yr)
              </Text>
              <Text style={typography.caption}>
                • Periods follow calendar months
              </Text>
              <Text style={typography.caption}>• Simpler monthly planning</Text>
            </View>
            <View
              style={[
                styles.pillInfo,
                { backgroundColor: "#ECFDF5", marginTop: spacing.md },
              ]}
            >
              <DollarSign size={14} color="#16A34A" />
              <Text
                style={[
                  typography.caption,
                  { color: "#166534", marginLeft: spacing.xs },
                ]}
              >
                Daily = (Paycheck - Monthly bills) ÷ days in month
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Special Cases */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
                <TrendingUp size={16} color="#16A34A" />
              </View>
              <Text style={typography.heading}>Special Cases</Text>
            </View>
            <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
              <View style={[styles.row, { alignItems: "flex-start" }]}>
                <CheckCircle
                  size={16}
                  color="#16A34A"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyMedium}>3-Paycheck Months</Text>
                  <Text style={typography.caption}>
                    We detect them and boost discretionary accordingly.
                  </Text>
                  <Badge
                    variant="default"
                    style={{ marginTop: spacing.xs }}
                    textStyle={{ color: "#fff", fontSize: 10 }}
                  >
                    💰 This month has 3 paychecks → discretionary higher
                  </Badge>
                </View>
              </View>
              <View style={[styles.row, { alignItems: "flex-start" }]}>
                <AlertCircle
                  size={16}
                  color="#2563EB"
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyMedium}>Carryover Logic</Text>
                  <Text style={typography.caption}>
                    100% of daily over/under goes to Period Slush to smooth
                    variations.
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Setup Inputs */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
                <DollarSign size={16} color="#4B5563" />
              </View>
              <Text style={typography.heading}>Setup Inputs</Text>
            </View>
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              <Text style={typography.caption}>
                • Payday anchor date (detected from linked accounts)
              </Text>
              <Text style={typography.caption}>
                • Paycheck amounts (manual or auto)
              </Text>
              <Text style={typography.caption}>
                • Monthly bills total (from flagged transactions)
              </Text>
            </View>
            <Separator style={{ marginVertical: spacing.md }} />
            <Text style={typography.caption}>
              Rounding: daily allowances round to nearest $1; any remainder
              applied on the last day (±$1).
            </Text>
          </CardContent>
        </Card>

        <Pressable
          onPress={() => router.back()}
          style={[styles.buttonPrimary, { marginBottom: spacing.xl }]}
        >
          <Text style={[styles.buttonPrimaryText]}>Back to Settings</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm, borderRadius: borderRadius.md },
  title: typography.subtitle,
  subtle: typography.caption,
  scroll: { padding: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pillInfo: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
