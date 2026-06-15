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
  FlaskConical,
  Loader2,
  Lock,
  Pause,
  Play,
  Shield,
  Trash2,
} from "lucide-react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { glass } from "../styles/theme";
import {
  usePlaidLink,
  fetchUserAccounts,
  toggleAccountImported,
  deleteAccount,
  triggerSync,
  ExchangeTokenResponse,
} from "../services/plaidService";

export default function ConnectAccountsScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<"plaid" | "teller">(
    "plaid",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
          [{ text: "OK" }],
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
        imported: account.imported ?? true,
      }));

      setAccounts(transformedAccounts);
      setConnectionStatus(
        transformedAccounts.length > 0
          ? `${transformedAccounts.length} account${
              transformedAccounts.length !== 1 ? "s" : ""
            } connected`
          : "No accounts connected",
      );
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setConnectionStatus("No accounts connected");
      setAccounts([]); // Clear any stale data
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleImported = async (accountId: string, newValue: boolean) => {
    try {
      await toggleAccountImported(accountId, newValue);
      setAccounts((prev) => {
        const updated = prev.map((a) =>
          a.id === accountId ? { ...a, imported: newValue } : a,
        );
        const importedCount = updated.filter((a) => a.imported).length;
        console.log(`🔄 Toggled ${accountId} → imported=${newValue} | ${importedCount}/${updated.length} accounts imported`);
        return updated;
      });
    } catch (error) {
      console.error("Failed to toggle account:", error);
    }
  };

  const handleDeleteAccount = (account: any) => {
    Alert.alert(
      "Delete Account",
      `Remove "${account.name}" and all its transactions? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(account.id);
              setAccounts((prev) => prev.filter((a) => a.id !== account.id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
    );
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
      logo: "🛠️",
      description: "Coming soon maybe...",
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
        [{ text: "OK" }],
      );
    }
  };

  const handleLoadDemoData = async () => {
    try {
      setIsLoadingDemo(true);
      setConnectionStatus("Loading demo data from Plaid sandbox...");

      const response = await fetch("http://localhost:3000/api/plaid/sandbox-quicklink");
      const data = await response.json();

      if (data.success) {
        setConnectionStatus(`Demo data loaded from ${data.institution_name}`);
        await refreshAccounts();
      } else {
        throw new Error(data.error || "Failed to load demo data");
      }
    } catch (error) {
      console.error("Demo data load failed:", error);
      setConnectionStatus("Failed to load demo data");
      Alert.alert(
        "Demo Data Error",
        "Could not load demo data. Make sure the API server is running.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoadingDemo(false);
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

        {/* Demo data button */}
        <Pressable
          onPress={handleLoadDemoData}
          disabled={isLoadingDemo}
          style={[
            styles.buttonSecondary,
            { marginBottom: 16, borderColor: "#8B5CF6", borderStyle: "dashed" },
            isLoadingDemo && { opacity: 0.7 },
          ]}
        >
          {isLoadingDemo ? (
            <Loader2 size={16} color="#8B5CF6" />
          ) : (
            <FlaskConical size={16} color="#8B5CF6" />
          )}
          <Text style={[styles.buttonSecondaryText, { marginLeft: 6, color: "#8B5CF6" }]}>
            {isLoadingDemo ? "Loading Demo Data..." : "Load Demo Data"}
          </Text>
        </Pressable>

        {/* Connected accounts with import toggles */}
        {(accounts.length > 0 || isLoading) && (
          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <Text style={[styles.cardTitle, { marginBottom: 4 }]}>
                {isLoading ? "Loading Accounts..." : "Your Accounts"}
              </Text>
              <Text style={[styles.muted, { marginBottom: 12 }]}>
                Toggle which accounts to import transactions from
              </Text>
              {accounts.map((account, index) => (
                <View key={account.id}>
                  {index > 0 && <Separator style={{ marginVertical: 8 }} />}
                  <View style={styles.accountRow}>
                    <View style={styles.accountLogo}>
                      <Text style={{ fontSize: 20 }}>{account.logo}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{account.name}</Text>
                      <Text style={styles.muted}>
                        {account.accountType} · ${account.balance.toLocaleString()}
                        {!account.imported && " · Paused"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        onPress={() => handleToggleImported(account.id, !account.imported)}
                        style={[
                          styles.actionBtn,
                          account.imported
                            ? { backgroundColor: "#FEF3C7" }
                            : { backgroundColor: "#DBEAFE" },
                        ]}
                      >
                        {account.imported ? (
                          <Pause size={16} color="#D97706" />
                        ) : (
                          <Play size={16} color="#2563EB" />
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteAccount(account)}
                        style={[styles.actionBtn, { backgroundColor: "#FEE2E2" }]}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
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

        {/* Start importing — only show when accounts exist and at least one is imported */}
        {accounts.length > 0 && (
          <Pressable
            onPress={async () => {
              const importedCount = accounts.filter((a) => a.imported).length;
              if (importedCount === 0) {
                Alert.alert("No Accounts Selected", "Toggle on at least one account to import.");
                return;
              }
              setIsSyncing(true);
              try {
                await triggerSync(userId);
                router.replace("/");
              } catch (error) {
                console.error("Sync trigger failed:", error);
                Alert.alert("Sync Error", "Failed to start syncing. Try again.");
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            style={[
              styles.buttonPrimary,
              { backgroundColor: "#16A34A", marginBottom: 24 },
              isSyncing && { opacity: 0.7 },
            ]}
          >
            {isSyncing ? (
              <Loader2 size={16} color="#fff" />
            ) : (
              <Check size={16} color="#fff" />
            )}
            <Text style={[styles.buttonPrimaryText, { marginLeft: 6 }]}>
              {isSyncing
                ? "Starting sync..."
                : `Start Importing (${accounts.filter((a) => a.imported).length} accounts)`}
            </Text>
          </Pressable>
        )}
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
  backBtn: { padding: 8, borderRadius: glass.radius },
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
    borderRadius: glass.radiusLarge,
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
    borderRadius: glass.radiusLarge,
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
    borderRadius: glass.radiusLarge,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonSecondaryText: { fontWeight: "600", color: "#111827" },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
