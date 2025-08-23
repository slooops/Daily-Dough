import React from "react";
import { View } from "react-native";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react-native";
import { Badge } from "./ui/Badge";

export function SyncStatus({
  status,
  lastSynced,
  compact = false,
}: {
  status: "idle" | "syncing" | "error";
  lastSynced?: string;
  compact?: boolean;
}) {
  const icon =
    status === "syncing" ? (
      <RefreshCw size={12} />
    ) : status === "error" ? (
      <AlertCircle size={12} />
    ) : (
      <CheckCircle size={12} />
    );
  const variant =
    status === "syncing"
      ? "default"
      : status === "error"
      ? "destructive"
      : "secondary";
  const text = compact
    ? ""
    : status === "syncing"
    ? "Syncing..."
    : status === "error"
    ? "Error"
    : lastSynced
    ? `Last synced ${new Date(lastSynced).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "Synced";

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Badge variant={variant as any}>
        {icon}
        {!compact ? ` ${text}` : ""}
      </Badge>
    </View>
  );
}
