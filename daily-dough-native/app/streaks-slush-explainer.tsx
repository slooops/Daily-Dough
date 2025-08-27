import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  DollarSign,
  Flame,
  RefreshCw,
  Target,
} from "lucide-react-native";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { Separator } from "../components/ui/Separator";

export default function StreaksSlushExplainerScreen() {
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
          <Text style={styles.title}>How it Works</Text>
          <Text style={styles.subtle}>Streaks & slush rules</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Streaks overview */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#2563EB" }]}>
                <Flame size={16} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Streak Rules</Text>
            </View>
            <Text style={[styles.muted, { marginTop: 6 }]}>
              We track two streaks to keep budgeting fun.
            </Text>
          </CardContent>
        </Card>

        {/* No-spend days */}
        <Card
          style={{
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: "#3B82F6",
          }}
        >
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
                <Flame size={16} color="#1D4ED8" />
              </View>
              <Text style={[styles.itemTitle, { color: "#1D4ED8" }]}>
                No-Spend Days
              </Text>
              <Badge variant="secondary" style={{ marginLeft: 8 }}>
                Blue Flame
              </Badge>
            </View>
            <View style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.muted}>
                • A day counts if posted spend = $0 (manual entries count as
                spend)
              </Text>
              <Text style={styles.muted}>
                • Streak breaks if any spend &gt; $0 that day
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Within-budget days */}
        <Card
          style={{
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: "#F59E0B",
          }}
        >
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#FFEDD5" }]}>
                <Flame size={16} color="#EA580C" />
              </View>
              <Text style={[styles.itemTitle, { color: "#EA580C" }]}>
                Within-Budget Days
              </Text>
              <Badge variant="secondary" style={{ marginLeft: 8 }}>
                Orange Flame
              </Badge>
            </View>
            <View style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.muted}>
                • Counts if spent_today ≤ daily_allowance
              </Text>
              <Text style={styles.muted}>
                • OR if spent_today &gt; daily_allowance AND slush after
                applying today ≥ 0
              </Text>
              <Text style={styles.muted}>
                • Streak breaks when slush &lt; 0 at day close
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Slush explained */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#22C55E" }]}>
                <DollarSign size={16} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Period Slush</Text>
            </View>
            <Text style={[styles.muted, { marginTop: 6 }]}>
              Your slush pot collects 100% of daily over/under to smooth
              spending bumps.
            </Text>
            <View
              style={[
                styles.pillInfo,
                { backgroundColor: "#F3F4F6", marginTop: 10 },
              ]}
            >
              <Text style={styles.muted}>
                Example: Allowance $100, spent $112 → over $12 → Slush reduces
                by $12
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* End of period */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#FDBA74" }]}>
                <RefreshCw size={16} color="#C2410C" />
              </View>
              <Text style={styles.cardTitle}>End of Period</Text>
            </View>
            <View style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.muted}>
                • If slush &gt; 0: choose to keep it or send to savings
                (default: keep)
              </Text>
              <Text style={styles.muted}>
                • If slush &lt; 0: auto-reset to $0 with fresh start
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Edge cases */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.row}>
              <View style={[styles.circle, { backgroundColor: "#F3F4F6" }]}>
                <Target size={16} color="#4B5563" />
              </View>
              <Text style={styles.cardTitle}>Edge Cases</Text>
            </View>
            <View style={{ gap: 6, marginTop: 8 }}>
              <Text style={styles.muted}>
                • No special handling for time zones/travel—slush smooths it
              </Text>
              <Text style={styles.muted}>
                • Rounding: nearest $1; remainder applied on last day (±$1)
              </Text>
              <Text style={styles.muted}>
                • Bills & ignored transactions don't count against daily spend
              </Text>
            </View>
          </CardContent>
        </Card>

        <Pressable
          onPress={() => router.back()}
          style={[styles.buttonPrimary, { marginBottom: 24 }]}
        >
          <Text style={styles.buttonPrimaryText}>Got it!</Text>
        </Pressable>
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
  backBtn: { padding: 8, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtle: { fontSize: 12, color: "#6B7280" },
  scroll: { padding: 16 },
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
  pillInfo: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
