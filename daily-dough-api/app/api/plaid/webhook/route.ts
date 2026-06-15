/**
 * POST /api/plaid/webhook
 *
 * Phase D Tasks 10 & 11: Webhook handling and verification
 * Updated for Phase G: Uses database repository layer
 *
 * Features:
 * - Accepts Plaid webhook events with signature verification
 * - Triggers background transaction sync for TRANSACTIONS events
 * - Handles ITEM and AUTH webhooks appropriately
 * - Logs all webhook events for monitoring
 * - Returns 200 for successful processing
 */

import { NextRequest, NextResponse } from "next/server";
import { plaid } from "../../../../lib/plaid";
import { webhookConfig } from "../../../../lib/config";
import {
  syncStateRepo,
  itemsRepo,
  transactionsRepo,
} from "../../../../server/repo";
import { decrypt } from "../../../../lib/crypto";
import {
  TransactionsSyncRequest,
  RemovedTransaction,
  Transaction as PlaidTransaction,
} from "plaid";
import { createHmac } from "crypto";

/**
 * Verify Plaid webhook signature (Task 11)
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Plaid uses HMAC-SHA256 with the webhook secret
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    // Compare signatures (timing-safe comparison)
    const providedSignature = signature.replace("sha256=", "");

    if (expectedSignature.length !== providedSignature.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      result |=
        expectedSignature.charCodeAt(i) ^ providedSignature.charCodeAt(i);
    }

    return result === 0;
  } catch (error) {
    console.error("❌ Signature verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Webhook signature verification (Task 11)
    if (webhookConfig.verificationEnabled && webhookConfig.secret) {
      const signature = request.headers.get("plaid-verification");

      if (!verifyWebhookSignature(rawBody, signature, webhookConfig.secret)) {
        console.error("❌ Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      console.log("✅ Webhook signature verified");
    } else {
      console.log("⚠️ Webhook signature verification disabled");
    }

    // Log webhook event (Task 10)
    const webhookInfo = {
      webhook_type: body.webhook_type,
      webhook_code: body.webhook_code,
      item_id: body.item_id,
      timestamp: new Date().toISOString(),
      environment: body.environment || "unknown",
    };

    console.log("🪝 Plaid webhook received:", webhookInfo);

    // Handle different webhook types (Task 10)
    switch (body.webhook_type) {
      case "TRANSACTIONS":
        return await handleTransactionsWebhook(body);
      case "ITEM":
        return await handleItemWebhook(body);
      case "AUTH":
        return await handleAuthWebhook(body);
      default:
        console.log(`🤷 Unknown webhook type: ${body.webhook_type}`);
        return NextResponse.json({ status: "received" }, { status: 200 });
    }
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle TRANSACTIONS webhooks with background sync (Task 10)
 * Updated to use database repository layer
 */
async function handleTransactionsWebhook(body: Record<string, unknown>) {
  const webhook_code = body.webhook_code as string;
  const item_id = body.item_id as string;

  console.log(
    `💳 Processing transactions webhook - ${webhook_code} for item: ${item_id}`
  );

  try {
    // Get the item from database
    const item = await itemsRepo.getByItemId(item_id);
    if (!item) {
      console.error(`❌ Item not found: ${item_id}`);
      return NextResponse.json({ status: "item_not_found" }, { status: 200 });
    }

    switch (webhook_code) {
      case "INITIAL_UPDATE":
        console.log("📥 Triggering initial transaction sync");
        await performBackgroundSync(item);
        break;
      case "HISTORICAL_UPDATE":
        console.log("📚 Triggering historical transaction sync");
        await performBackgroundSync(item);
        break;
      case "DEFAULT_UPDATE":
        console.log("🔄 Triggering incremental transaction sync");
        await performBackgroundSync(item);
        break;
      case "TRANSACTIONS_REMOVED":
        console.log("🗑️ Handling removed transactions");
        await performBackgroundSync(item);
        break;
      default:
        console.log(`🤷 Unknown transaction webhook code: ${webhook_code}`);
        break;
    }

    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error) {
    console.error("❌ Transaction webhook processing failed:", error);
    return NextResponse.json({ status: "error" }, { status: 200 }); // Still return 200 to Plaid
  }
}

/**
 * Perform background transaction sync using database repository layer
 * Same logic as refresh endpoint but triggered by webhook
 */
async function performBackgroundSync(item: { item_id: string; access_token_enc: string }) {
  try {
    console.log(`🔄 Starting background sync for item: ${item.item_id}`);

    const accessToken = decrypt(item.access_token_enc);
    const syncState = await syncStateRepo.get(item.item_id);
    let cursor = syncState?.cursor || "";
    let hasMore = true;
    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    // Sync all pages until has_more is false (same logic as refresh endpoint)
    while (hasMore) {
      console.log(
        `📄 Background sync page with cursor: ${cursor || "initial"}`
      );

      const syncRequest: TransactionsSyncRequest = {
        access_token: accessToken,
        ...(cursor && { cursor }),
      };

      const syncResponse = await plaid.transactionsSync(syncRequest);
      const { added, modified, removed, next_cursor, has_more } =
        syncResponse.data;

      console.log(
        `📊 Background sync results: ${added.length} added, ${modified.length} modified, ${removed.length} removed`
      );

      // Process transactions using repository layer
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
      `✅ Background sync completed for ${item.item_id}: ${totalAdded} added, ${totalModified} modified, ${totalRemoved} removed`
    );
  } catch (error) {
    console.error(`❌ Background sync failed for ${item.item_id}:`, error);
    // Note: We don't have error tracking in sync state yet, but the error is logged
  }
}

/**
 * Convert Plaid transaction to database format (same as refresh endpoint)
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

/**
 * Handle ITEM webhooks
 */
async function handleItemWebhook(body: Record<string, unknown>) {
  const { webhook_code, item_id, error } = body;

  console.log(`🏦 Item webhook - ${webhook_code} for item: ${item_id}`);

  switch (webhook_code) {
    case "ERROR":
      console.error("🚨 Item error:", error);
      // TODO: Update item status, notify user for re-authentication
      break;
    case "PENDING_EXPIRATION":
      console.log("⏰ Item access will expire soon");
      // TODO: Notify user to re-authenticate before expiration
      break;
    case "USER_PERMISSION_REVOKED":
      console.log("🚫 User revoked access");
      // TODO: Disable item, stop syncing, notify user
      break;
    case "WEBHOOK_UPDATE_ACKNOWLEDGED":
      console.log("✅ Webhook update acknowledged");
      break;
  }

  return NextResponse.json({ status: "processed" }, { status: 200 });
}

/**
 * Handle AUTH webhooks
 */
async function handleAuthWebhook(body: Record<string, unknown>) {
  const { webhook_code, item_id } = body;

  console.log(`🔐 Auth webhook - ${webhook_code} for item: ${item_id}`);

  switch (webhook_code) {
    case "AUTOMATICALLY_VERIFIED":
      console.log("✅ Account automatically verified");
      break;
    case "VERIFICATION_EXPIRED":
      console.log("⏳ Account verification expired");
      // TODO: Prompt user to re-verify their account
      break;
  }

  return NextResponse.json({ status: "processed" }, { status: 200 });
}

// GET endpoint for webhook verification (some services require this)
export async function GET() {
  return NextResponse.json({
    message: "Daily Dough Plaid Webhook Endpoint",
    status: "active",
    verification_enabled: webhookConfig.verificationEnabled,
    timestamp: new Date().toISOString(),
  });
}
