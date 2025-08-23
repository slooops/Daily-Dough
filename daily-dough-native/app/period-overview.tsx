import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronLeft, Flame, TrendingUp } from "lucide-react-native";
import { Separator } from "../components/ui/Separator";
import { SlushPill } from "../components/SlushPill";
import { StreakBadge } from "../components/StreakBadge";
import { Progress } from "../components/ui/Progress";

const periodData = {
  period: {
    type: "biweekly",
    start: "2025-08-11",
    end: "2025-08-24",
    discretionary_total: 1400,
    slush_current: 45,
  },
  remaining: 275,
  calendar_days: [
    {
      date: "2025-08-11",
      status: "under",
      spent: 45,
      allowance: 100,
      slush_change: +15,
    },
    {
      date: "2025-08-12",
      status: "over",
      spent: 125,
      allowance: 100,
      slush_change: -25,
    },
    {
      date: "2025-08-13",
      status: "no_spend",
      spent: 0,
      allowance: 100,
      slush_change: +100,
    },
    {
      date: "2025-08-14",
      status: "under",
      spent: 78,
      allowance: 100,
      slush_change: +22,
    },
    {
      date: "2025-08-15",
      status: "over",
      spent: 134,
      allowance: 100,
      slush_change: -34,
    },
    {
      date: "2025-08-16",
      status: "under",
      spent: 65,
      allowance: 100,
      slush_change: +35,
    },
    {
      date: "2025-08-17",
      status: "no_spend",
      spent: 0,
      allowance: 100,
      slush_change: +100,
    },
    {
      date: "2025-08-18",
      status: "under",
      spent: 89,
      allowance: 100,
      slush_change: +11,
    },
    {
      date: "2025-08-19",
      status: "over",
      spent: 115,
      allowance: 100,
      slush_change: -15,
    },
    {
      date: "2025-08-20",
      status: "under",
      spent: 92,
      allowance: 100,
      slush_change: +8,
    },
    {
      date: "2025-08-21",
      status: "no_spend",
      spent: 0,
      allowance: 100,
      slush_change: +100,
    },
    {
      date: "2025-08-22",
      status: "under",
      spent: 71,
      allowance: 100,
      slush_change: +29,
    },
    {
      date: "2025-08-23",
      status: "over",
      spent: 142,
      allowance: 100,
      slush_change: -42,
    },
    {
      date: "2025-08-24",
      status: "under",
      spent: 56,
      allowance: 100,
      slush_change: +44,
    },
  ],
  streaks: { blue_days: 3, orange_streak: 7 },
};

export default function PeriodOverviewScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const progressPercentage = useMemo(() => {
    return (
      ((periodData.period.discretionary_total - periodData.remaining) /
        periodData.period.discretionary_total) *
      100
    );
  }, []);

  const isLowBudget =
    periodData.remaining < periodData.period.discretionary_total * 0.2;
  const isOverBudget = periodData.remaining < 0;

  const dayColor = (status: string) =>
    status === "no_spend"
      ? "#3B82F6"
      : status === "under"
      ? "#34D399"
      : "#F87171";

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#111827" />
        </Pressable>
        <View>
          <Text style={styles.title}>Period Overview</Text>
          <Text style={styles.subtle}>Bi-weekly spending analysis</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Remaining Summary */}
        <View style={styles.cardElevated}>
          <View style={{ gap: 12 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Remaining this period</Text>
              <Text
                style={[
                  styles.value,
                  isOverBudget
                    ? styles.danger
                    : isLowBudget
                    ? styles.warning
                    : null,
                ]}
              >
                ${periodData.remaining} / $
                {periodData.period.discretionary_total}
              </Text>
            </View>
            <Progress value={Math.max(0, Math.min(100, progressPercentage))} />
            <View style={styles.rowBetween}>
              <SlushPill amount={periodData.period.slush_current} />
              <Text style={styles.muted}>
                {Math.max(0, 14 - periodData.calendar_days.length)} days left
              </Text>
            </View>
          </View>
        </View>

        {/* Heatmap */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
              <Calendar size={16} color="#1D4ED8" />
            </View>
            <Text style={styles.cardTitle}>Daily Spending Heatmap</Text>
          </View>
          <View style={styles.grid7}>
            {periodData.calendar_days.map((d, i) => (
              <Pressable
                key={d.date}
                style={[styles.square, { backgroundColor: dayColor(d.status) }]}
                onPress={() => setSelectedDay(d)}
              />
            ))}
          </View>
          <View style={[styles.rowCenter, { gap: 12, paddingTop: 8 }]}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
              />
              <Text style={styles.legendText}>No spend</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#34D399" }]}
              />
              <Text style={styles.legendText}>Under</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#F87171" }]}
              />
              <Text style={styles.legendText}>Over</Text>
            </View>
          </View>
        </View>

        {/* Trend stub */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
              <TrendingUp size={16} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Spending Trend</Text>
          </View>
          <Text style={styles.muted}>Planned vs Actual coming soon</Text>
          <View
            style={{
              height: 64,
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              marginTop: 8,
            }}
          />
        </View>

        {/* Streaks */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
              <Flame size={16} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Streaks This Period</Text>
          </View>
          <View style={styles.rowBetween}>
            <StreakBadge
              count={periodData.streaks.blue_days}
              type="blue"
              label="no-spend days"
            />
            <StreakBadge
              count={periodData.streaks.orange_streak}
              type="orange"
              label="within budget"
            />
          </View>
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
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontWeight: "600" },
  muted: { fontSize: 12, color: "#6B7280" },
  grid7: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 4 },
  square: {
    width: (360 - 16 * 2 - 8 * 6) / 7,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: "#6B7280" },
  danger: { color: "#DC2626" },
  warning: { color: "#D97706" },
});
