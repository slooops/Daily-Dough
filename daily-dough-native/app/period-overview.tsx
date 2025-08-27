import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronLeft, Flame, TrendingUp } from "lucide-react-native";
import { Separator } from "../components/ui/Separator";
import { SlushPill } from "../components/SlushPill";
import { StreakBadge } from "../components/StreakBadge";
import { Progress } from "../components/ui/Progress";
import { Card, CardContent } from "../components/ui/Card";
import { typography, spacing, borderRadius, colors } from "../styles/common";

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
        <Card variant="elevated" style={{ marginBottom: spacing.xl }}>
          <CardContent style={{ gap: spacing.md, padding: spacing.xxl }}>
            <View style={styles.rowBetween}>
              <Text style={typography.label}>Remaining this period</Text>
              <Text
                style={[
                  typography.value,
                  isOverBudget
                    ? { color: colors.semantic.danger }
                    : isLowBudget
                    ? { color: colors.semantic.warning }
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
              <Text style={typography.caption}>
                {Math.max(0, 14 - periodData.calendar_days.length)} days left
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent style={{ gap: spacing.md, padding: spacing.xxl }}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
                <Calendar size={16} color="#1D4ED8" />
              </View>
              <Text style={typography.heading}>Daily Spending Heatmap</Text>
            </View>
            <View style={styles.gridContainer}>
              <View style={styles.grid7}>
                {periodData.calendar_days.map((d, i) => (
                  <Pressable
                    key={d.date}
                    style={[
                      styles.square,
                      { backgroundColor: dayColor(d.status) },
                    ]}
                    onPress={() => setSelectedDay(d)}
                  />
                ))}
              </View>
            </View>
            <View
              style={[
                styles.rowCenter,
                { gap: spacing.md, paddingTop: spacing.sm },
              ]}
            >
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={typography.caption}>No spend</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#34D399" }]}
                />
                <Text style={typography.caption}>Under</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#F87171" }]}
                />
                <Text style={typography.caption}>Over</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Trend stub */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent style={{ gap: spacing.md, padding: spacing.xxl }}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
                <TrendingUp size={16} color="#16A34A" />
              </View>
              <Text style={typography.heading}>Spending Trend</Text>
            </View>
            <Text style={typography.caption}>
              Planned vs Actual coming soon
            </Text>
            <View
              style={{
                height: 64,
                backgroundColor: "#F3F4F6",
                borderRadius: borderRadius.xl,
                marginTop: spacing.sm,
              }}
            />
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card style={{ marginBottom: spacing.xl }}>
          <CardContent style={{ gap: spacing.md, padding: spacing.xxl }}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
                <Flame size={16} color="#EA580C" />
              </View>
              <Text style={typography.heading}>Streaks This Period</Text>
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
          </CardContent>
        </Card>

        <View style={{ height: spacing.xl }} />
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
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.sm, borderRadius: borderRadius.lg },
  title: typography.subtitle,
  subtle: typography.caption,
  scroll: { padding: spacing.lg },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
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
  gridContainer: {
    width: "100%",
    alignItems: "center",
  },
  grid7: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: 4,
    justifyContent: "center",
    width: "100%",
  },
  square: {
    width:
      (Dimensions.get("window").width -
        spacing.lg * 2 -
        spacing.xxl * 2 -
        spacing.sm * 6) /
      7,
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
});
