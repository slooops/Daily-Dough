import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Building2,
  Check,
  ChevronLeft,
  Eye,
  Loader2,
  Lock,
  Shield,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { SyncStatus } from "../components/SyncStatus.native";
import {
  usePlaidLink,
  fetchUserAccounts,
  ExchangeTokenResponse,
} from "../services/plaidService";

export default function ConnectAccountsScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<"plaid" | "teller">(
    "plaid"
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  // User ID for this demo - in a real app, this would come from authentication
  const userId = "demo";

  // Initialize Plaid Link (Phase E Tasks 12 & 13)
  const { openPlaidLink } = usePlaidLink({
    userId,
    onSuccess: async (publicToken: string, metadata: any) => {
      console.log("🎉 Plaid Link successful!", metadata);
      setConnectionStatus("✅ Bank connected successfully!");
      setIsConnecting(false);

      // Refresh accounts after successful connection (Task 14)
      await refreshAccounts();

      // Alert.alert(
      //   "Success!",
      //   `Connected to ${
      //     metadata.exchangeResult?.institution_name || "your bank"
      //   } successfully.`,
      //   [{ text: "OK" }]
      // );
    },
    onExit: (error?: any, metadata?: any) => {
      console.log("👋 Plaid Link exit:", { error, metadata });
      setIsConnecting(false);

      if (error) {
        setConnectionStatus("❌ Connection failed");
        Alert.alert(
          "Connection Failed",
          error.error_message ||
            "Unable to connect to your bank. Please try again.",
          [{ text: "OK" }]
        );
      } else {
        setConnectionStatus("Connection cancelled by user");
      }
    },
  });

  // Load existing accounts and transactions on component mount (Task 14)
  useEffect(() => {
    // Only fetch if we might have existing connections
    // Don't fetch on initial load to avoid errors
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    // Try to load existing accounts silently, don't show errors
    try {
      await refreshAccounts();
    } catch (error) {
      // Silently fail - user hasn't connected anything yet
      console.log("No existing connections found, user needs to connect first");
    }
  };

  // Refresh accounts from API
  const refreshAccounts = async () => {
    try {
      setIsLoading(true);
      const userAccounts = await fetchUserAccounts(userId);

      // Transform API accounts to UI format
      const transformedAccounts = userAccounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        logo: getAccountLogo(account.type),
        provider: "Plaid",
        lastSynced: account.updated_at || new Date().toISOString(),
        status: "idle" as const,
        accountType: capitalizeFirst(account.subtype || account.type),
        balance: account.balances?.current || 0,
      }));

      setAccounts(transformedAccounts);
      setConnectionStatus(
        transformedAccounts.length > 0
          ? `${transformedAccounts.length} account${
              transformedAccounts.length !== 1 ? "s" : ""
            } connected`
          : "No accounts connected"
      );
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setConnectionStatus("No accounts connected");
      setAccounts([]); // Clear any stale data
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getAccountLogo = (type: string) => {
    switch (type?.toLowerCase()) {
      case "depository":
        return "🏦";
      case "credit":
        return "💳";
      case "loan":
        return "🏠";
      case "investment":
        return "📈";
      default:
        return "🏦";
    }
  };

  const capitalizeFirst = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

  const providers = [
    {
      id: "plaid" as const,
      name: "Plaid",
      logo: "🔗",
      description: "Most banks supported (Live)",
      isDefault: true,
    },
    {
      id: "teller" as const,
      name: "Teller",
      logo: "🏚️",
      description: "Coming soon",
      isDefault: false,
    },
  ];

  // Handle bank connection (Phase E Tasks 12 & 13)
  const handleConnect = async () => {
    if (selectedProvider === "teller") {
      Alert.alert("Coming Soon", "Teller integration is not yet available.", [
        { text: "OK" },
      ]);
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionStatus("🔄 Opening Plaid Link...");

      // This will:
      // 1. Fetch link token from API (Task 12)
      // 2. Open Plaid Link UI (Task 12)
      // 3. Exchange public token on success (Task 13)
      await openPlaidLink();
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionStatus("❌ Connection failed");
      setIsConnecting(false);

      Alert.alert(
        "Connection Error",
        "Unable to start bank connection. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/settings");
            }
          }}
          style={styles.backBtn}
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#111827" />
        </Pressable>
        <View>
          <Text style={styles.title}>Connect your accounts</Text>
          <Text style={styles.subtle}>Secure bank connection</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Intro */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.circleXL, { backgroundColor: "#2563EB" }]}>
                <Building2 size={32} color="#fff" />
              </View>
              <Text style={[styles.itemTitle, { fontSize: 18, marginTop: 8 }]}>
                Connect your bank safely
              </Text>
              <Text
                style={[styles.muted, { textAlign: "center", marginTop: 6 }]}
              >
                Securely link your bank account to start tracking spending. We
                use bank-grade encryption via Plaid/Teller.
              </Text>
              <View style={[styles.pillInfo, { marginTop: 12 }]}>
                <Shield size={14} color="#1D4ED8" />
                <Text
                  style={[
                    styles.muted,
                    { color: "#1D4ED8", fontWeight: "600" },
                  ]}
                >
                  {" "}
                  256-bit SSL encryption
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Providers */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
              Choose your provider
            </Text>
            {providers.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setSelectedProvider(p.id)}
                style={[
                  styles.providerRow,
                  selectedProvider === p.id && styles.providerRowSelected,
                ]}
              >
                <View style={styles.row}>
                  <View style={styles.providerLogo}>
                    <Text style={{ fontSize: 16 }}>{p.logo}</Text>
                  </View>
                  <View>
                    <View style={styles.row}>
                      <Text style={styles.itemTitle}>{p.name}</Text>
                      {p.isDefault && (
                        <Badge
                          variant="secondary"
                          textStyle={{ fontSize: 10 }}
                          style={{ marginLeft: 6 }}
                        >
                          Recommended
                        </Badge>
                      )}
                    </View>
                    <Text style={styles.muted}>{p.description}</Text>
                  </View>
                </View>
                {selectedProvider === p.id && (
                  <Check size={18} color="#3B82F6" />
                )}
              </Pressable>
            ))}
          </CardContent>
        </Card>

        {/* Connection status */}
        {connectionStatus && (
          <Card style={{ marginBottom: 16, backgroundColor: "#F8FAFC" }}>
            <CardContent style={{ paddingVertical: 12 }}>
              <Text
                style={[styles.muted, { textAlign: "center", fontSize: 13 }]}
              >
                {connectionStatus}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Connect button */}
        <Pressable
          onPress={handleConnect}
          disabled={isConnecting || selectedProvider === "teller"}
          style={[
            styles.buttonPrimary,
            (isConnecting || selectedProvider === "teller") && { opacity: 0.7 },
          ]}
        >
          {isConnecting ? (
            <Loader2 size={16} color="#fff" />
          ) : (
            <Building2 size={16} color="#fff" />
          )}
          <Text style={[styles.buttonPrimaryText, { marginLeft: 6 }]}>
            {isConnecting
              ? `Connecting via ${selectedProvider}...`
              : selectedProvider === "teller"
              ? "Coming Soon"
              : `Connect with ${selectedProvider}`}
          </Text>
        </Pressable>

        {/* Connected accounts */}
        {(accounts.length > 0 || isLoading) && (
          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <View style={[styles.row, { marginBottom: 16 }]}>
                <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
                  {isLoading ? (
                    <Loader2 size={16} color="#16A34A" />
                  ) : (
                    <Check size={16} color="#16A34A" />
                  )}
                </View>
                <Text style={styles.cardTitle}>
                  {isLoading ? "Loading Accounts..." : "Connected Accounts"}
                </Text>
                {accounts.length > 0 && (
                  <Badge variant="secondary" style={{ marginLeft: 6 }}>
                    {String(accounts.length)}
                  </Badge>
                )}
              </View>
              {isLoading ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Loader2 size={24} color="#6B7280" />
                  <Text style={[styles.muted, { marginTop: 8 }]}>
                    Loading your accounts...
                  </Text>
                </View>
              ) : accounts.length > 0 ? (
                accounts.map((a, i) => (
                  <View key={a.id}>
                    <View style={styles.rowBetween}>
                      <View style={styles.row}>
                        <View style={styles.accountLogo}>
                          <Text style={{ fontSize: 16 }}>{a.logo}</Text>
                        </View>
                        <View>
                          <Text style={styles.itemTitle}>{a.name}</Text>
                          <View style={styles.row}>
                            <Text style={styles.muted}>{a.accountType}</Text>
                            <Text style={[styles.muted, { marginLeft: 6 }]}>
                              •
                            </Text>
                            <Text style={[styles.muted, { fontWeight: "600" }]}>
                              ${Math.abs(a.balance).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <SyncStatus status={a.status} lastSynced={a.lastSynced} />
                    </View>
                    {i < accounts.length - 1 && <Separator />}
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={[styles.muted, { textAlign: "center" }]}>
                    No accounts connected yet.{"\n"}
                    Connect a bank account to get started.
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Privacy note */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent>
            <View style={styles.row}>
              <Lock size={18} color="#16A34A" />
              <Text style={[styles.itemTitle, { color: "#166534" }]}>
                Your privacy is protected
              </Text>
            </View>
            <Text style={[styles.muted, { marginTop: 6 }]}>
              Read-only access. Credentials are never shared. Tokens stored
              on-device.
            </Text>
          </CardContent>
        </Card>

        {/* Continue */}
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/settings");
            }
          }}
          style={[styles.buttonSecondary, { marginBottom: 24 }]}
        >
          <Eye size={16} color="#111827" />
          <Text style={[styles.buttonSecondaryText, { marginLeft: 6 }]}>
            Continue Setup
          </Text>
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
  cardTitle: { fontWeight: "600", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  circleXL: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pillInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },
  providerRow: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  providerRowSelected: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" },
  providerLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  accountLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  muted: { fontSize: 12, color: "#6B7280" },
  buttonPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonSecondaryText: { fontWeight: "600", color: "#111827" },
});
