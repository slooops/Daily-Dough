/**
 * Plaid Link Integration Service
 *
 * Phase E Tasks 12 & 13: Client integration
 * - Fetches link tokens from our API
 * - Handles Plaid Link success/exit
 * - Exchanges public tokens for access tokens
 */

const API_BASE_URL = "http://localhost:3000/api";

// Plaid Link SDK types (will be imported from react-native-plaid-link-sdk)
export interface LinkSuccess {
  publicToken: string;
  metadata: {
    institution: {
      name: string;
      institution_id: string;
    };
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      subtype: string;
    }>;
  };
}

export interface LinkExit {
  error?: {
    error_code: string;
    error_message: string;
    error_type: string;
  };
  metadata: any;
}

export interface PlaidLinkConfig {
  userId: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error?: any, metadata?: any) => void;
}

export interface LinkTokenResponse {
  success: boolean;
  link_token?: string;
  error?: string;
}

export interface ExchangeTokenResponse {
  success: boolean;
  item_id?: string;
  institution_name?: string;
  accounts?: any[];
  error?: string;
}

/**
 * Fetch a link token from our API (Task 12)
 */
export async function fetchLinkToken(userId: string): Promise<string> {
  try {
    console.log("🔗 Fetching link token for user:", userId);
    console.log("📡 API URL:", `${API_BASE_URL}/plaid/link-token`);

    const response = await fetch(`${API_BASE_URL}/plaid/link-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    console.log("📊 Response status:", response.status);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: LinkTokenResponse = await response.json();
    console.log("📊 Response data:", data);

    if (!data.link_token) {
      throw new Error(data.error || "No link token in response");
    }

    console.log(
      "✅ Link token received:",
      data.link_token?.substring(0, 20) + "..."
    );
    return data.link_token;
  } catch (error) {
    console.error("❌ Link token fetch failed:", error);
    throw error;
  }
}

/**
 * Exchange public token for access token (Task 13)
 */
export async function exchangePublicToken(
  publicToken: string,
  userId: string
): Promise<ExchangeTokenResponse> {
  try {
    console.log("🔄 Exchanging public token for user:", userId);

    const response = await fetch(`${API_BASE_URL}/plaid/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicToken,
        userId,
      }),
    });

    const data: ExchangeTokenResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to exchange token");
    }

    console.log("✅ Token exchange successful:", data.institution_name);
    return data;
  } catch (error) {
    console.error("❌ Token exchange failed:", error);
    throw error;
  }
}

/**
 * Mock Plaid Link flow for development/testing
 * In production, this would use react-native-plaid-link-sdk
 */
async function openPlaidLinkFlow(
  linkToken: string,
  callbacks: {
    onSuccess: (success: LinkSuccess) => void;
    onExit: (exit: LinkExit) => void;
  }
) {
  console.log(
    "🔗 Mock Plaid Link flow with token:",
    linkToken.substring(0, 20) + "..."
  );

  // For development, simulate Plaid Link success by using sandbox quicklink
  try {
    console.log("📡 Calling sandbox quicklink...");
    const response = await fetch(`${API_BASE_URL}/plaid/sandbox-quicklink`);
    console.log("📊 Sandbox response status:", response.status);

    const data = await response.json();
    console.log("📊 Sandbox response data:", data);

    if (data.success && data.item_id) {
      // The sandbox-quicklink endpoint creates the connection directly
      // Simulate successful Plaid Link flow with mock public token
      const mockSuccess: LinkSuccess = {
        publicToken: "mock-public-token-" + Date.now(), // Mock token for flow
        metadata: {
          institution: {
            name: data.institution_name || "First Platypus Bank",
            institution_id: data.institution_id || "ins_109508",
          },
          accounts: data.accounts?.slice(0, 3).map((acc: any, i: number) => ({
            id: `mock_${i}`,
            name: acc.name,
            type: acc.type,
            subtype: acc.subtype,
          })) || [
            {
              id: "mock_account_1",
              name: "Test Checking",
              type: "depository",
              subtype: "checking",
            },
          ],
        },
      };

      console.log("✅ Mock Plaid Link success with sandbox data");
      callbacks.onSuccess(mockSuccess);
    } else {
      throw new Error(`Sandbox failed: ${data.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("❌ Sandbox link flow failed:", error);
    const mockExit: LinkExit = {
      error: {
        error_code: "SANDBOX_ERROR",
        error_message: error instanceof Error ? error.message : "Unknown error",
        error_type: "API_ERROR",
      },
      metadata: {},
    };

    callbacks.onExit(mockExit);
  }
}

/**
 * Hook for Plaid Link integration (Tasks 12 & 13)
 */
export function usePlaidLink(config: PlaidLinkConfig) {
  const { userId, onSuccess, onExit } = config;

  const openPlaidLink = async () => {
    try {
      // Step 1: Fetch link token (Task 12)
      const linkToken = await fetchLinkToken(userId);

      // Step 2: Open Plaid Link (Task 12)
      console.log("🚀 Opening Plaid Link...");

      // For development, we'll use sandbox quick link for testing
      // In production, this would use the actual react-native-plaid-link-sdk
      await openPlaidLinkFlow(linkToken, {
        onSuccess: async (success: LinkSuccess) => {
          try {
            console.log("🎉 Plaid Link success:", success);

            // For sandbox/mock flow, the connection is already created
            // In production, this would exchange the real public token
            if (success.publicToken.startsWith("mock-")) {
              console.log(
                "✅ Sandbox connection already created, skipping exchange"
              );
              // Mock exchange result for consistent API
              const mockExchangeResult = {
                success: true,
                institution_name: success.metadata.institution.name,
                userId: userId,
                itemId: "sandbox-item-" + Date.now(),
                accounts: success.metadata.accounts,
              };

              onSuccess(success.publicToken, {
                ...success,
                exchangeResult: mockExchangeResult,
              });
            } else {
              // Real Plaid Link flow - exchange the public token
              const exchangeResult = await exchangePublicToken(
                success.publicToken,
                userId
              );

              console.log("✅ Full Link flow completed:", exchangeResult);
              onSuccess(success.publicToken, {
                ...success,
                exchangeResult,
              });
            }
          } catch (error) {
            console.error("❌ Token exchange failed:", error);
            onExit?.(error, success);
          }
        },
        onExit: (exit: LinkExit) => {
          console.log("👋 Plaid Link exit:", exit);
          onExit?.(exit.error, exit);
        },
      });
    } catch (error) {
      console.error("❌ Plaid Link failed to open:", error);
      onExit?.(error);
    }
  };

  return {
    openPlaidLink,
  };
}

/**
 * Fetch user accounts after successful linking
 */
export async function fetchUserAccounts(userId: string): Promise<any[]> {
  try {
    console.log("📊 Fetching accounts for user:", userId);

    const response = await fetch(
      `${API_BASE_URL}/plaid/accounts?userId=${userId}`
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch accounts");
    }

    console.log("✅ Accounts fetched:", data.accounts?.length);
    return data.accounts || [];
  } catch (error) {
    console.error("❌ Account fetch failed:", error);
    throw error;
  }
}

/**
 * Fetch user transactions after successful linking
 */
export async function fetchUserTransactions(
  userId: string,
  options: { limit?: number; since?: string } = {}
): Promise<any[]> {
  try {
    console.log("💳 Fetching transactions for user:", userId);

    const params = new URLSearchParams();
    params.set("userId", userId);
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.since) params.set("since", options.since);

    const response = await fetch(
      `${API_BASE_URL}/plaid/transactions?${params}`
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch transactions");
    }

    console.log("✅ Transactions fetched:", data.transactions?.length);
    return data.transactions || [];
  } catch (error) {
    console.error("❌ Transaction fetch failed:", error);
    throw error;
  }
}
