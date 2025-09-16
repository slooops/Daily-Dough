import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { itemsRepo, accountsRepo } from "@/server/repo";
import { decrypt } from "@/lib/crypto";

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
    const item = await itemsRepo.getByUser(userId);
    if (!item) {
      return NextResponse.json(
        { error: "No connected accounts found for user", userId },
        { status: 404 }
      );
    }

    console.log(
      `📋 Found item: ${item.id} (institution: ${item.institution_id})`
    );

    // Check if we have cached accounts (unless forcing refresh)
    if (!forceRefresh) {
      const cachedAccounts = await accountsRepo.listByItem(item.item_id);
      if (cachedAccounts.length > 0) {
        console.log(`💾 Returning ${cachedAccounts.length} cached accounts`);

        return NextResponse.json({
          success: true,
          accounts: cachedAccounts.map(mapAccountToResponse),
          cached: true,
          item_id: item.item_id,
          institution_id: item.institution_id,
        });
      }
    }

    // Decrypt access token
    const accessToken = decrypt(item.access_token_enc);

    // Fetch fresh accounts from Plaid
    console.log("📡 Fetching fresh accounts from Plaid...");
    const accountsResponse = await plaid.accountsGet({
      access_token: accessToken,
    });

    const plaidAccounts = accountsResponse.data.accounts;
    console.log(`📊 Retrieved ${plaidAccounts.length} accounts from Plaid`);

    // Map Plaid accounts to database format
    const accountsToStore = plaidAccounts.map((plaidAccount) => ({
      account_id: plaidAccount.account_id,
      item_id: item.item_id,
      name: plaidAccount.name,
      type: plaidAccount.type,
      subtype: plaidAccount.subtype || "",
      mask: plaidAccount.mask || "",
      balances: plaidAccount.balances,
      raw: plaidAccount,
    }));

    // Save/update accounts in repository
    const savedAccounts = await accountsRepo.upsertMany(
      item.item_id,
      accountsToStore
    );
    console.log(`💾 Saved ${savedAccounts.length} accounts to repository`);

    // Return clean account data
    return NextResponse.json({
      success: true,
      accounts: savedAccounts.map(mapAccountToResponse),
      cached: false,
      item_id: item.item_id,
      institution_id: item.institution_id,
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
 * Map database Account to clean API response format
 */
function mapAccountToResponse(account: any) {
  const balances =
    typeof account.balances === "string"
      ? JSON.parse(account.balances)
      : account.balances;

  return {
    id: account.account_id,
    name: account.name,
    type: account.type,
    subtype: account.subtype,
    mask: account.mask || account.account_id.slice(-4), // Last 4 characters as mask
    balances: {
      current: balances?.current || 0,
      currency: balances?.iso_currency_code || "USD",
    },
    plaid_account_id: account.account_id,
    updated_at: account.updatedAt,
  };
}
