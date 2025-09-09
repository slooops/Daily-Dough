import React from "react";
import { View, Text, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { typography, spacing, colors, borderRadius } from "../../styles/common";

export interface TransactionTableItem {
  id: string;
  merchant: string;
  date: string;
  amount?: number;
  tag?: string;
  amountColor?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive";
  };
  icon?: React.ReactElement;
  iconBackgroundColor?: string;
  onPress?: () => void;
  actionButton?: {
    icon: React.ReactElement;
    onPress: () => void;
    backgroundColor?: string;
  };
  subtitle?: string; // For secondary text like rule type
}

export interface TransactionTableProps {
  title: string;
  data: TransactionTableItem[];
  headerIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function TransactionTable({
  title,
  data,
  headerIcon,
  style,
}: TransactionTableProps) {
  const getAmountColor = (item: TransactionTableItem) => {
    if (item.tag === "bill") return "#16A34A"; // Green for bills (positive)
    if (item.tag === "ignored") return "#6B7280"; // Gray for ignored
    return "#DC2626"; // Red for spending
  };

  const formatAmount = (amount: number, tag?: string) => {
    const abs = Math.abs(amount);
    if (tag === "bill") return `$${abs.toFixed(2)}`;
    return `$${abs.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No Date";

    try {
      // Handle both ISO dates and YYYY-MM-DD format safely
      const dateStr = dateString.includes("T")
        ? dateString
        : dateString + "T12:00:00";
      const date = new Date(dateStr);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format in TransactionTable: ${dateString}`);
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.warn(
        `Date parsing error in TransactionTable: ${dateString}`,
        error
      );
      return "Invalid Date";
    }
  };

  return (
    <Card style={{ marginBottom: spacing.lg, ...style }}>
      <CardContent style={{ padding: 0 }}>
        {/* Header */}
        <View
          style={{
            padding: spacing.xxl,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          {headerIcon && (
            <View style={[styles.circle, { backgroundColor: "#DBEAFE" }]}>
              {headerIcon}
            </View>
          )}
          <Text style={typography.heading}>{title}</Text>
        </View>

        {/* Transaction Items */}
        {data.length === 0 ? (
          <View style={{ padding: spacing.xxl, alignItems: "center" }}>
            <Text style={typography.caption}>No transactions to show</Text>
          </View>
        ) : (
          data.map((item, i) => (
            <View key={item.id}>
              <Pressable
                onPress={item.onPress}
                style={[
                  styles.rowBetween,
                  {
                    paddingHorizontal: spacing.xxl,
                    paddingVertical: spacing.lg,
                    opacity: item.onPress ? 1 : 0.9,
                  },
                ]}
                disabled={!item.onPress}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor: item.iconBackgroundColor || "#F3F4F6",
                      },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <View>
                    <View style={styles.row}>
                      <Text style={typography.bodyMedium}>{item.merchant}</Text>
                      {item.badge && (
                        <Badge
                          variant={item.badge.variant || "secondary"}
                          style={{ marginLeft: spacing.xs }}
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </View>
                    <View style={styles.row}>
                      <Text style={typography.caption}>
                        {formatDate(item.date)}
                      </Text>
                      {item.subtitle && (
                        <Text
                          style={[
                            typography.caption,
                            { marginLeft: spacing.sm },
                          ]}
                        >
                          • {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  {item.amount !== undefined && (
                    <Text
                      style={[
                        typography.value,
                        { color: getAmountColor(item) },
                      ]}
                    >
                      {formatAmount(item.amount, item.tag)}
                    </Text>
                  )}
                  {item.actionButton && (
                    <Pressable
                      onPress={item.actionButton.onPress}
                      style={{
                        marginLeft: spacing.sm,
                        padding: spacing.sm,
                        borderRadius: borderRadius.pill,
                        backgroundColor:
                          item.actionButton.backgroundColor || "#FEF2F2",
                      }}
                    >
                      {item.actionButton.icon}
                    </Pressable>
                  )}
                </View>
              </Pressable>
              {i < data.length - 1 && (
                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                    marginHorizontal: spacing.xxl,
                  }}
                />
              )}
            </View>
          ))
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
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
});
