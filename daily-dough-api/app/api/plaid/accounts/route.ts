import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { getItemByUser, saveAccounts, getAccounts } from "@/lib/repository";
import { decrypt } from "@/lib/crypto";
import type { Account } from "@/lib/types";

/**
 * GET /api/plaid/accounts
 * Fetches accounts from Plaid, maps to app format, persists and returns them
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || "demo";
    const forceRefresh = url.searchParams.get("refresh") === "true";

    console.log(`🏦 Fetching accounts for user: ${userId}`);

    // Get stored item for user
    const item = await getItemByUser(userId);
    if (!item) {
      return NextResponse.json(
        { error: "No connected accounts found for user", userId },
        { status: 404 }
      );
    }

    console.log(`📋 Found item: ${item.id} (${item.institutionName})`);

    // Check if we have cached accounts (unless forcing refresh)
    if (!forceRefresh) {
      const cachedAccounts = await getAccounts(item.id);
      if (cachedAccounts.length > 0) {
        console.log(`💾 Returning ${cachedAccounts.length} cached accounts`);

        return NextResponse.json({
          success: true,
          accounts: cachedAccounts.map(mapAccountToResponse),
          cached: true,
          item_id: item.id,
          institution_name: item.institutionName,
        });
      }
    }

    // Decrypt access token
    const accessToken = decrypt(item.accessToken);

    // Fetch fresh accounts from Plaid
    console.log("📡 Fetching fresh accounts from Plaid...");
    const accountsResponse = await plaid.accountsGet({
      access_token: accessToken,
    });

    const plaidAccounts = accountsResponse.data.accounts;
    console.log(`📊 Retrieved ${plaidAccounts.length} accounts from Plaid`);

    // Map Plaid accounts to our app format
    const mappedAccounts = plaidAccounts.map(
      (plaidAccount): Omit<Account, "id" | "createdAt" | "updatedAt"> => ({
        itemId: item.id,
        plaidAccountId: plaidAccount.account_id,
        name: plaidAccount.name,
        type: mapPlaidAccountType(plaidAccount.type),
        subtype: plaidAccount.subtype || "other",
        balance: plaidAccount.balances.current || 0,
        isoCurrencyCode: plaidAccount.balances.iso_currency_code || "USD",
      })
    );

    // Save accounts to repository
    const savedAccounts = await saveAccounts(mappedAccounts);
    console.log(`💾 Saved ${savedAccounts.length} accounts to repository`);

    // Return clean account data
    return NextResponse.json({
      success: true,
      accounts: savedAccounts.map(mapAccountToResponse),
      cached: false,
      item_id: item.id,
      institution_name: item.institutionName,
      fetched_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Failed to fetch accounts:", error);

    if (error.response?.data) {
      console.error("📋 Plaid API Error Details:", error.response.data);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch accounts",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Map Plaid account type to our standardized types
 */
function mapPlaidAccountType(
  plaidType: string
): "depository" | "credit" | "loan" | "investment" | "other" {
  switch (plaidType.toLowerCase()) {
    case "depository":
      return "depository";
    case "credit":
      return "credit";
    case "loan":
      return "loan";
    case "investment":
      return "investment";
    default:
      return "other";
  }
}

/**
 * Map our internal Account to clean API response format
 */
function mapAccountToResponse(account: Account) {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    subtype: account.subtype,
    mask: account.plaidAccountId.slice(-4), // Last 4 characters as mask
    balances: {
      current: account.balance,
      currency: account.isoCurrencyCode,
    },
    plaid_account_id: account.plaidAccountId, // For internal use
    updated_at: account.updatedAt,
  };
}
