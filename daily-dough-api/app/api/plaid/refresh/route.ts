/**
 * POST /api/plaid/refresh
 *
 * Phase G Task 18: Manual refresh endpoint with database persistence
 *
 * Features:
 * - Triggers server-side sync logic using saved cursor
 * - Returns sync statistics and next cursor
 * - Uses idempotent database operations
 * - Useful for manual refresh during local development
 */

import { NextRequest, NextResponse } from "next/server";
import { plaid } from "../../../../lib/plaid";
import { decrypt } from "../../../../lib/crypto";
import {
  itemsRepo,
  syncStateRepo,
  transactionsRepo,
} from "../../../../server/repo";
import {
  TransactionsSyncRequest,
  RemovedTransaction,
  Transaction as PlaidTransaction,
} from "plaid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required in request body" },
        { status: 400 }
      );
    }

    console.log(`🔄 Manual refresh requested for user: ${userId}`);

    // Get the user's item
    const item = await itemsRepo.getByUser(userId);
    if (!item) {
      console.log(`❌ No item found for user: ${userId}`);
      return NextResponse.json(
        { success: false, error: "No Plaid item found for user" },
        { status: 404 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(item.access_token_enc);

    // Get current sync state
    const syncState = await syncStateRepo.get(item.item_id);
    let cursor = syncState?.cursor || "";
    let hasMore = true;
    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    try {
      // Sync all pages until has_more is false
      while (hasMore) {
        console.log(`📄 Manual sync page with cursor: ${cursor || "initial"}`);

        const syncRequest: TransactionsSyncRequest = {
          access_token: accessToken,
          ...(cursor && { cursor }),
        };

        const syncResponse = await plaid.transactionsSync(syncRequest);
        const { added, modified, removed, next_cursor, has_more } =
          syncResponse.data;

        console.log(
          `📊 Manual sync page results: ${added.length} added, ${modified.length} modified, ${removed.length} removed`
        );

        // Process this page without wrapping in a transaction (let repo handle it)
        // Convert and upsert transactions
        if (added.length > 0 || modified.length > 0) {
          const addedFormatted = added.map((tx) =>
            formatPlaidTransactionForDb(tx, item.item_id)
          );
          const modifiedFormatted = modified.map((tx) =>
            formatPlaidTransactionForDb(tx, item.item_id)
          );

          const batchResult = await transactionsRepo.upsertBatch({
            added: addedFormatted,
            modified: modifiedFormatted,
          });

          totalAdded += batchResult.addedCount;
          totalModified += batchResult.modifiedCount;
        }

        // Handle removed transactions
        if (removed.length > 0) {
          const removedIds = removed.map(
            (r: RemovedTransaction) => r.transaction_id
          );
          const removedCount = await transactionsRepo.applyRemoved(removedIds);
          totalRemoved += removedCount;
        }

        // Update for next iteration
        cursor = next_cursor;
        hasMore = has_more;
      }

      // Update sync state with success
      await syncStateRepo.save({
        item_id: item.item_id,
        cursor,
        lastSyncedAt: new Date(),
      });

      console.log(
        `✅ Manual refresh completed: ${totalAdded} added, ${totalModified} modified, ${totalRemoved} removed`
      );

      return NextResponse.json({
        success: true,
        synced: true,
        newCount: totalAdded + totalModified,
        nextCursor: cursor,
        stats: {
          added: totalAdded,
          modified: totalModified,
          removed: totalRemoved,
        },
        lastSyncAt: new Date().toISOString(),
      });
    } catch (syncError) {
      console.error("❌ Manual sync failed:", syncError);

      return NextResponse.json(
        {
          success: false,
          synced: false,
          error: "Sync failed",
          details:
            syncError instanceof Error ? syncError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Manual refresh failed:", error);
    return NextResponse.json(
      {
        success: false,
        synced: false,
        error: "Failed to process refresh request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Convert Plaid transaction to database format
 */
function formatPlaidTransactionForDb(
  plaidTx: PlaidTransaction,
  item_id: string
): transactionsRepo.TransactionInput {
  return {
    transaction_id: plaidTx.transaction_id,
    account_id: plaidTx.account_id,
    item_id: item_id,
    date: plaidTx.date,
    name: plaidTx.name,
    merchant_name: plaidTx.merchant_name ?? undefined,
    amount: plaidTx.amount, // Keep signed: negative = expense, positive = income
    iso_currency_code: plaidTx.iso_currency_code ?? undefined,
    category_primary: plaidTx.category?.[0] ?? undefined,
    category_secondary: plaidTx.category?.[1] ?? undefined,
    original_description: plaidTx.original_description ?? undefined,
    pending: plaidTx.pending,
    raw: plaidTx,
  };
}
