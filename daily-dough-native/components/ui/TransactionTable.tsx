import React from "react";
import { View, Text, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Badge } from "./Badge";
import { SyncStatus } from "../SyncStatus.native";
import { glass, glassColors } from "../../styles/theme";
import { typography, spacing, borderRadius } from "../../styles/common";

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

  // New fields for account table support
  emoji?: string; // For emoji logos (e.g., "🏦", "💳")
  balance?: number; // For account balances
  accountType?: string; // For account type (e.g., "Checking", "Credit")
  provider?: string; // For provider name (e.g., "Plaid")
  syncStatus?: {
    status: "syncing" | "idle" | "initializing";
    lastSynced: string;
  };
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
    if (item.tag === "ignored") return glassColors.textMuted;
    if (item.tag === "bill") return glassColors.success;
    if (item.amount !== undefined) {
      return item.amount < 0 ? glassColors.success : glassColors.danger;
    }
    return glassColors.danger;
  };

  const formatAmount = (amount: number, tag?: string) => {
    const prefix = amount > 0 ? "" : "+";
    const abs = Math.abs(amount);
    return `${prefix}$${abs.toFixed(2)}`;
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
        error,
      );
      return "Invalid Date";
    }
  };

  return (
    <View style={[styles.glassContainer, style]}>
      {/* Header */}
      <View style={styles.header}>
        {headerIcon && (
          <View
            style={[
              styles.circle,
              { backgroundColor: "rgba(14,165,233,0.10)" },
            ]}
          >
            {headerIcon}
          </View>
        )}
        <Text style={styles.heading}>{title}</Text>
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
              <View style={styles.leftContent}>
                {/* Render emoji logo for account tables OR icon for transaction tables */}
                {item.emoji ? (
                  <View style={styles.emojiLogo}>
                    <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                  </View>
                ) : (
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
                )}

                <View style={styles.textContent}>
                  <View style={styles.topRow}>
                    <Text
                      style={[typography.bodyMedium, styles.merchantText]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.merchant}
                    </Text>
                    {item.badge && (
                      <Badge
                        variant={item.badge.variant || "secondary"}
                        style={{ marginLeft: spacing.xs, flexShrink: 0 }}
                      >
                        {item.badge.text}
                      </Badge>
                    )}
                  </View>
                  <View style={styles.bottomRow}>
                    {/* For account tables, show provider • balance */}
                    {item.provider && item.balance !== undefined ? (
                      <>
                        <Text style={typography.caption}>{item.provider}</Text>
                        <Text style={[typography.caption, { marginLeft: 4 }]}>
                          •
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            {
                              fontWeight: "600",
                              color: item.balance >= 0 ? "#16A34A" : "#DC2626",
                            },
                          ]}
                        >
                          ${item.balance.toLocaleString()}
                        </Text>
                      </>
                    ) : (
                      /* For transaction tables, show date and subtitle */
                      <>
                        <Text style={typography.caption}>
                          {formatDate(item.date)}
                        </Text>
                        {item.subtitle && (
                          <Text
                            style={[
                              typography.caption,
                              { marginLeft: spacing.sm },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            • {item.subtitle}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Right side: Amount OR SyncStatus */}
              <View style={styles.row}>
                {item.syncStatus ? (
                  /* For account tables, show sync status */
                  <SyncStatus
                    status={item.syncStatus.status}
                    lastSynced={item.syncStatus.lastSynced}
                  />
                ) : (
                  /* For transaction tables, show amount */
                  item.amount !== undefined && (
                    <Text
                      style={[
                        typography.value,
                        { color: getAmountColor(item) },
                      ]}
                    >
                      {formatAmount(item.amount, item.tag)}
                    </Text>
                  )
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
            {i < data.length - 1 && <View style={styles.separator} />}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: glass.radius,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: glass.borderWidth,
    borderColor: glass.borderColor,
    overflow: "hidden",
    marginBottom: spacing.lg,
    shadowColor: glass.shadow.color,
    shadowOffset: glass.shadow.offset,
    shadowRadius: glass.shadow.radius,
    shadowOpacity: glass.shadow.opacity,
    elevation: 4,
  },
  header: {
    padding: spacing.xxl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: glassColors.separator,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: glassColors.text,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: glassColors.separator,
    marginHorizontal: spacing.xxl,
  },
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
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1, // Allow this to take available space
    minWidth: 0, // Important for text truncation to work
  },
  textContent: {
    flex: 1, // Take remaining space after icon
    minWidth: 0, // Important for text truncation
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  merchantText: {
    flex: 0.99, // More aggressive truncation - take only 99% of available space
    minWidth: 0, // Required for ellipsis to work properly
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // Don't let the icon shrink
  },
  emojiLogo: {
    width: 40,
    height: 40,
    borderRadius: glass.radius,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // Don't let the emoji shrink
  },
});
