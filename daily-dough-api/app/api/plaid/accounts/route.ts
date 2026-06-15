import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { itemsRepo, accountsRepo, transactionsRepo, syncStateRepo } from "@/server/repo";
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
    const importedOnly = url.searchParams.get("imported_only") === "true";

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
      const cachedAccounts = importedOnly
        ? await accountsRepo.listImportedByItem(item.item_id)
        : await accountsRepo.listByItem(item.item_id);
      if (cachedAccounts.length > 0) {
        console.log(`💾 Returning ${cachedAccounts.length} cached accounts (imported_only=${importedOnly})`);

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
 * PATCH /api/plaid/accounts
 * Toggle the imported flag for an account
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { account_id, imported } = body;

    if (!account_id || typeof imported !== "boolean") {
      return NextResponse.json(
        { error: "account_id and imported (boolean) are required" },
        { status: 400 }
      );
    }

    const updated = await accountsRepo.updateImported(account_id, imported);

    // Log the current imported count
    const item = await accountsRepo.getById(account_id);
    if (item) {
      const importedAccounts = await accountsRepo.listImportedByItem(updated.item_id);
      const allAccounts = await accountsRepo.listByItem(updated.item_id);
      console.log(`🔄 Account ${account_id} imported=${imported} | ${importedAccounts.length}/${allAccounts.length} accounts now imported`);
    }

    return NextResponse.json({
      success: true,
      account: mapAccountToResponse(updated),
    });
  } catch (error: any) {
    console.error("Failed to update account:", error);
    return NextResponse.json(
      { error: "Failed to update account", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plaid/accounts
 * - With ?account_id=X → delete a single account and its transactions
 * - With ?userId=X (no account_id) → disconnect ALL accounts for a user
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("account_id");
    const userId = url.searchParams.get("userId") || "demo";

    // Single account delete
    if (accountId) {
      console.log(`🗑️ Deleting single account: ${accountId}`);

      // Delete transactions for this account first, then the account (cascade should handle it but be explicit)
      await transactionsRepo.deleteByAccount(accountId);
      await accountsRepo.deleteOne(accountId);

      console.log(`✅ Deleted account ${accountId} and its transactions`);
      return NextResponse.json({
        success: true,
        message: `Account ${accountId} deleted`,
      });
    }

    // Delete all accounts for user
    console.log(`🗑️ Disconnecting all accounts for user: ${userId}`);

    const item = await itemsRepo.getByUser(userId);
    if (!item) {
      return NextResponse.json(
        { success: true, message: "No accounts to disconnect" },
      );
    }

    await transactionsRepo.deleteByItem(item.item_id);
    console.log(`🗑️ Deleted transactions for item ${item.item_id}`);

    try {
      await syncStateRepo.deleteSyncState(item.item_id);
      console.log(`🗑️ Deleted sync state`);
    } catch {
      // No sync state to delete
    }

    await accountsRepo.deleteByItem(item.item_id);
    console.log(`🗑️ Deleted accounts`);

    await itemsRepo.deleteItem(item.item_id);
    console.log(`🗑️ Deleted item`);

    try {
      const accessToken = decrypt(item.access_token_enc);
      await plaid.itemRemove({ access_token: accessToken });
      console.log(`🗑️ Removed Plaid item access`);
    } catch (err) {
      console.warn(`⚠️ Could not remove Plaid item (may already be removed):`, err);
    }

    console.log(`✅ All accounts disconnected for user: ${userId}`);
    return NextResponse.json({
      success: true,
      message: "All accounts disconnected",
    });
  } catch (error: any) {
    console.error("❌ Failed to delete account(s):", error);
    return NextResponse.json(
      { error: "Failed to delete account(s)", details: error.message },
      { status: 500 },
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
    mask: account.mask || account.account_id.slice(-4),
    imported: account.imported ?? true,
    balances: {
      current: balances?.current || 0,
      currency: balances?.iso_currency_code || "USD",
    },
    plaid_account_id: account.account_id,
    updated_at: account.updatedAt,
  };
}
