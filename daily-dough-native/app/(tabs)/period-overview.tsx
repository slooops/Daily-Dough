import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Calendar, Flame } from "lucide-react-native";
import { SlushPill } from "../../components/SlushPill";
import { StreakBadge } from "../../components/StreakBadge";
import { Progress } from "../../components/ui/Progress";
import { Card, CardContent } from "../../components/ui/Card";
import { typography, spacing, borderRadius, colors } from "../../styles/common";
import { glass } from "../../styles/theme";
import {
  fetchAllowancePeriod,
  fetchPeriodHistory,
} from "../../services/allowanceService";

interface DayResult {
  date: string;
  allowanceToday: number;
  spendToday: number;
  creditsToday: number;
  slushBalance: number;
  withinBudget: boolean;
  noSpendDay: boolean;
  carryover: number;
}

export default function PeriodOverviewScreen() {
  const [days, setDays] = useState<DayResult[]>([]);
  const [seed, setSeed] = useState<{
    expectedPeriodBudget: number;
    daysInPeriod: number;
  } | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [pastPeriods, setPastPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayResult | null>(null);

  const userId = "demo";

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setIsLoading(true);
        const [periodData, historyData] = await Promise.all([
          fetchAllowancePeriod(userId),
          fetchPeriodHistory(userId),
        ]);
        console.log(`📅 Period data: success=${periodData.success}, days=${periodData.days?.length ?? 0}, seed=${JSON.stringify(periodData.seed)}`);
        if (periodData.days?.length > 0) {
          console.log(`📅 Sample day [0]:`, JSON.stringify(periodData.days[0]));
          console.log(`📅 Sample day [last]:`, JSON.stringify(periodData.days[periodData.days.length - 1]));
        }
        if (periodData.success) {
          setDays(periodData.days ?? []);
          setSeed(periodData.seed ?? null);
          setStreak(periodData.streak ?? { current: 0, longest: 0 });
        }
        if (historyData.success) {
          setPastPeriods(historyData.periods ?? []);
        }
        setIsLoading(false);
      }
      load();
    }, []),
  );

  const totalSpend = useMemo(
    () => days.reduce((s, d) => s + d.spendToday, 0),
    [days],
  );
  const totalBudget = seed?.expectedPeriodBudget ?? 0;
  const remaining = totalBudget - totalSpend;
  const progressPercentage =
    totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
  const isLowBudget = remaining < totalBudget * 0.2;
  const isOverBudget = remaining < 0;
  const slushCurrent = days.length > 0 ? days[days.length - 1].slushBalance : 0;
  const daysLeft = (seed?.daysInPeriod ?? 0) - days.length;

  const dayColor = (d: DayResult) =>
    d.noSpendDay ? "#34D399" : d.withinBudget ? "#3B82F6" : "#F87171";

  // Build full calendar month grid
  const { monthLabel, calendarDays } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const label = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

    const dayMap = new Map(days.map((d) => [d.date, d]));
    const todayStr = now.toISOString().split("T")[0];

    const grid: { day: number | null; data: DayResult | null; isFuture: boolean }[] = [];
    // Leading blanks for day-of-week alignment
    for (let i = 0; i < firstDow; i++) {
      grid.push({ day: null, data: null, isFuture: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      grid.push({ day: d, data: dayMap.get(dateStr) ?? null, isFuture: dateStr > todayStr });
    }
    return { monthLabel: label, calendarDays: grid };
  }, [days]);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Period Overview</Text>
          <Text style={styles.subtle}>
            {seed ? `${days.length} of ${seed.daysInPeriod} days` : "Loading..."}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1, justifyContent: "center" }}
        />
      ) : (
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
                  ${Math.round(remaining)} / ${Math.round(totalBudget)}
                </Text>
              </View>
              <Progress
                value={Math.max(0, Math.min(100, progressPercentage))}
              />
              <View style={styles.rowBetween}>
                <SlushPill amount={Math.round(slushCurrent)} />
                <Text style={typography.caption}>
                  {Math.max(0, daysLeft)} days left
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
              <Text style={[typography.caption, { textAlign: "center", marginBottom: spacing.sm }]}>
                {monthLabel}
              </Text>
              <View style={styles.gridContainer}>
                {/* Day-of-week headers */}
                <View style={styles.grid7}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <View key={i} style={styles.dowHeader}>
                      <Text style={styles.dowText}>{d}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.grid7}>
                  {calendarDays.map((cell, i) => {
                    if (cell.day === null) {
                      return <View key={i} style={styles.square} />;
                    }
                    const bg = cell.data
                      ? dayColor(cell.data)
                      : cell.isFuture
                        ? "#F3F4F6"
                        : "#E5E7EB";
                    return (
                      <Pressable
                        key={i}
                        style={[
                          styles.square,
                          {
                            backgroundColor: bg,
                            opacity: cell.isFuture ? 0.4 : 1,
                          },
                        ]}
                        onPress={() => cell.data && setSelectedDay(cell.data)}
                      >
                        <Text
                          style={[
                            styles.squareLabel,
                            { color: cell.data ? "rgba(255,255,255,0.9)" : "#9CA3AF" },
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View
                style={[
                  styles.rowCenter,
                  { gap: spacing.md, paddingTop: spacing.sm, flexWrap: "wrap" },
                ]}
              >
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#34D399" }]}
                  />
                  <Text style={typography.caption}>No spend</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
                  />
                  <Text style={typography.caption}>Under</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#F87171" }]}
                  />
                  <Text style={typography.caption}>Over</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#F3F4F6" }]}
                  />
                  <Text style={typography.caption}>Future</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Selected Day Detail */}
          {selectedDay && (
            <Card style={{ marginBottom: spacing.xl }}>
              <CardContent style={{ gap: spacing.sm, padding: spacing.xxl }}>
                <Text style={typography.heading}>{selectedDay.date}</Text>
                <View style={styles.rowBetween}>
                  <Text style={typography.label}>Allowance</Text>
                  <Text style={typography.value}>
                    ${Math.round(selectedDay.allowanceToday)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={typography.label}>Spent</Text>
                  <Text style={typography.value}>
                    ${Math.round(selectedDay.spendToday)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={typography.label}>Slush</Text>
                  <Text style={typography.value}>
                    ${Math.round(selectedDay.slushBalance)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

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
                  count={days.filter((d) => d.noSpendDay).length}
                  type="blue"
                  label="no-spend days"
                />
                <StreakBadge
                  count={streak.current}
                  type="orange"
                  label="within budget"
                />
              </View>
            </CardContent>
          </Card>

          {/* Past Periods */}
          {pastPeriods.length > 0 && (
            <Card style={{ marginBottom: spacing.xl }}>
              <CardContent style={{ gap: spacing.md, padding: spacing.xxl }}>
                <Text style={typography.heading}>Past Periods</Text>
                {pastPeriods.map((p: any) => (
                  <View key={p.id} style={styles.rowBetween}>
                    <Text style={typography.caption}>
                      {p.periodStart} → {p.periodEnd}
                    </Text>
                    <Text style={typography.value}>
                      ${Math.round(p.totalSpend)} / ${Math.round(p.totalBudget)}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
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
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
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
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  squareLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.9)",
  },
  dowHeader: {
    width:
      (Dimensions.get("window").width -
        spacing.lg * 2 -
        spacing.xxl * 2 -
        spacing.sm * 6) /
      7,
    alignItems: "center" as const,
  },
  dowText: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#9CA3AF",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
});
