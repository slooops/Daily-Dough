import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
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

export default function ConnectAccountsScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<"plaid" | "teller">(
    "plaid"
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: "Chase Checking",
      logo: "🏦",
      provider: "Plaid",
      lastSynced: new Date().toISOString(),
      status: "idle" as const,
      accountType: "Checking",
      balance: 2847.32,
    },
    {
      id: 2,
      name: "Wells Fargo Savings",
      logo: "🏛️",
      provider: "Plaid",
      lastSynced: new Date().toISOString(),
      status: "idle" as const,
      accountType: "Savings",
      balance: 12459.68,
    },
  ]);

  const providers = [
    {
      id: "plaid" as const,
      name: "Plaid",
      logo: "🔗",
      description: "Most banks supported",
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

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.concat({
          id: Date.now(),
          name: "TD Bank Checking",
          logo: "🏢",
          provider: selectedProvider === "plaid" ? "Plaid" : "Teller",
          lastSynced: new Date().toISOString(),
          status: "idle" as const,
          accountType: "Checking",
          balance: 1523.45,
        })
      );
      setIsConnecting(false);
    }, 1500);
  };

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

        {/* Connect button */}
        <Pressable
          onPress={handleConnect}
          disabled={isConnecting}
          style={[styles.buttonPrimary, isConnecting && { opacity: 0.7 }]}
        >
          {isConnecting ? (
            <Loader2 size={16} color="#fff" />
          ) : (
            <Building2 size={16} color="#fff" />
          )}
          <Text style={[styles.buttonPrimaryText, { marginLeft: 6 }]}>
            {isConnecting
              ? `Connecting ${selectedProvider}...`
              : `Connect with ${selectedProvider}`}
          </Text>
        </Pressable>

        {/* Connected accounts */}
        {accounts.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <View style={[styles.row, { marginBottom: 16 }]}>
                <View style={[styles.circle, { backgroundColor: "#DCFCE7" }]}>
                  <Check size={16} color="#16A34A" />
                </View>
                <Text style={styles.cardTitle}>Connected Accounts</Text>
                <Badge variant="secondary" style={{ marginLeft: 6 }}>
                  {String(accounts.length)}
                </Badge>
              </View>
              {accounts.map((a, i) => (
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

        {/* Continue */}
        <Pressable
          onPress={() => router.back()}
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
