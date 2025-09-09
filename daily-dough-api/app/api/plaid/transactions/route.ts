/**
 * GET /api/plaid/transactions
 *
 * Phase C Tasks 8 & 9: Transaction sync and pagination
 *
 * Features:
 * - Syncs transactions from Plaid using /transactions/sync
 * - Handles added, modified, and removed transactions
 * - Supports pagination with ?since=<ISO date> and ?limit=<n>
 * - Returns last 90 days by default
 * - Idempotent - safe to call repeatedly
 */

import { NextRequest, NextResponse } from "next/server";
import { plaid } from "../../../../lib/plaid";
import {
  getItemByUser,
  getSyncState,
  saveSyncState,
  upsertTransactions,
  removeTransactions,
  getTransactionsSince,
  getAccounts,
} from "../../../../lib/repository";
import { decrypt } from "../../../../lib/crypto";
import { Transaction, GetTransactionsResponse } from "../../../../lib/types";
import {
  TransactionsSyncRequest,
  RemovedTransaction,
  Transaction as PlaidTransaction,
} from "plaid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sinceParam = searchParams.get("since");
    const limitParam = searchParams.get("limit");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Parse pagination parameters
    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    if (isNaN(limit) || limit < 1 || limit > 500) {
      return NextResponse.json(
        { success: false, error: "limit must be between 1 and 500" },
        { status: 400 }
      );
    }

    // Determine since date (default to 90 days ago)
    let sinceDate: string;
    if (sinceParam) {
      // Validate ISO date format
      const parsedDate = new Date(sinceParam);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "since parameter must be a valid ISO date" },
          { status: 400 }
        );
      }
      sinceDate = sinceParam.split("T")[0]; // Extract YYYY-MM-DD
    } else {
      // Default to 90 days ago
      const date90DaysAgo = new Date();
      date90DaysAgo.setDate(date90DaysAgo.getDate() - 90);
      sinceDate = date90DaysAgo.toISOString().split("T")[0];
    }

    console.log(
      `🔄 Fetching transactions for user: ${userId}, since: ${sinceDate}, limit: ${limit}`
    );

    // Get the user's item
    const item = await getItemByUser(userId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "No Plaid item found for user" },
        { status: 404 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(item.accessToken);

    // Get current sync state
    let syncState = await getSyncState(userId, item.id);
    let syncPerformed = false;

    // Perform sync if needed (always sync to ensure we have latest data)
    try {
      console.log("🔄 Starting transaction sync...");

      // Update sync state to 'syncing'
      syncState = await saveSyncState({
        userId,
        itemId: item.id,
        cursor: syncState?.cursor,
        transactionCount: syncState?.transactionCount || 0,
        status: "syncing",
      });

      let cursor = syncState.cursor;
      let hasMore = true;
      let totalAdded = 0;
      let totalModified = 0;
      let totalRemoved = 0;

      // Sync all pages until has_more is false
      while (hasMore) {
        console.log(`📄 Syncing page with cursor: ${cursor || "initial"}`);

        const syncRequest: TransactionsSyncRequest = {
          access_token: accessToken,
          ...(cursor && { cursor }),
        };

        const syncResponse = await plaid.transactionsSync(syncRequest);
        const { added, modified, removed, next_cursor, has_more } =
          syncResponse.data;

        console.log(
          `📊 Sync page results: ${added.length} added, ${modified.length} modified, ${removed.length} removed`
        );

        // Debug: Log raw Plaid transaction data to see what categories we get
        if (added.length > 0) {
          console.log(
            "🔍 Raw Plaid transaction sample:",
            JSON.stringify(
              added.slice(0, 2).map((tx) => ({
                transaction_id: tx.transaction_id,
                name: tx.name,
                merchant_name: tx.merchant_name,
                category: tx.category,
                category_id: tx.category_id,
                date: tx.date,
                amount: tx.amount,
              })),
              null,
              2
            )
          );
        }

        // Process added transactions
        if (added.length > 0) {
          const addedTransactions = await mapPlaidTransactionsToApp(
            added,
            item.id
          );
          await upsertTransactions(addedTransactions);
          totalAdded += added.length;
        }

        // Process modified transactions
        if (modified.length > 0) {
          const modifiedTransactions = await mapPlaidTransactionsToApp(
            modified,
            item.id
          );
          await upsertTransactions(modifiedTransactions);
          totalModified += modified.length;
        }

        // Process removed transactions
        if (removed.length > 0) {
          const removedIds = removed.map(
            (r: RemovedTransaction) => r.transaction_id
          );
          await removeTransactions(removedIds);
          totalRemoved += removed.length;
        }

        // Update for next iteration
        cursor = next_cursor;
        hasMore = has_more;
      }

      // Update sync state with success
      const totalTransactionCount =
        (syncState.transactionCount || 0) + totalAdded - totalRemoved;
      syncState = await saveSyncState({
        userId,
        itemId: item.id,
        cursor,
        transactionCount: totalTransactionCount,
        status: "idle",
      });

      syncPerformed = true;
      console.log(
        `✅ Sync completed: ${totalAdded} added, ${totalModified} modified, ${totalRemoved} removed`
      );
    } catch (syncError) {
      console.error("❌ Sync failed:", syncError);

      // Update sync state with error
      await saveSyncState({
        userId,
        itemId: item.id,
        cursor: syncState?.cursor,
        transactionCount: syncState?.transactionCount || 0,
        status: "error",
        error:
          syncError instanceof Error ? syncError.message : "Unknown sync error",
      });

      // Continue with existing data if sync fails
      console.log("⚠️ Sync failed, returning existing transactions");
    }

    // Get transactions from our store (post-sync)
    const transactions = await getTransactionsSince(sinceDate, item.id, limit);

    // Build response
    const response: GetTransactionsResponse = {
      transactions,
      total: transactions.length,
      cached: !syncPerformed,
      lastSyncAt: syncState?.lastSyncAt?.toISOString(),
    };

    // Add nextCursor for pagination if there might be more results
    if (transactions.length === limit) {
      // Use the date of the last transaction as the cursor for pagination
      const lastTransaction = transactions[transactions.length - 1];
      if (lastTransaction) {
        response.nextCursor = lastTransaction.date;
      }
    }

    console.log(
      `✅ Returning ${transactions.length} transactions (since ${sinceDate})`
    );

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("❌ Transaction fetch failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to map Plaid transactions to app format
 */
async function mapPlaidTransactionsToApp(
  plaidTransactions: PlaidTransaction[],
  itemId: string
): Promise<Omit<Transaction, "id" | "createdAt" | "updatedAt">[]> {
  // Get accounts for this item to map account IDs
  const accounts = await getAccounts(itemId);
  const accountMap = new Map(
    accounts.map((acc) => [acc.plaidAccountId, acc.id])
  );

  return plaidTransactions.map((tx, index) => {
    const appAccountId = accountMap.get(tx.account_id);
    if (!appAccountId) {
      throw new Error(
        `No account mapping found for Plaid account: ${tx.account_id}`
      );
    }

    // Debug: Log category processing for first few transactions
    if (index < 3) {
      console.log(`🔍 Processing transaction ${index}:`, {
        name: tx.name,
        merchant_name: tx.merchant_name,
        category: tx.category,
        category_type: Array.isArray(tx.category)
          ? "array"
          : typeof tx.category,
        category_length: tx.category?.length,
        category_first: tx.category?.[0],
        category_id: tx.category_id,
      });
    }

    // Determine transaction tag based on category and amount
    let tag: "spend" | "bill" | "ignored" | "refund" = "spend";

    if (tx.amount < 0) {
      tag = "refund"; // Negative amount = money coming in
    } else if (tx.category && tx.category.includes("Payment")) {
      tag = "bill";
    }
    // Default to 'spend' for regular outgoing transactions

    return {
      accountId: appAccountId,
      plaidTransactionId: tx.transaction_id,
      date: tx.date, // Already in YYYY-MM-DD format
      merchant: tx.merchant_name || tx.name || "Unknown Merchant",
      amount: -tx.amount, // Plaid: positive = outflow, App: negative = outflow
      category: tx.category?.[0] || "Other",
      subcategory: tx.category?.[1],
      tag,
    };
  });
}
