import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { itemsRepo } from "@/server/repo";
import { decrypt } from "@/lib/crypto";

/**
 * POST /api/plaid/sync-trigger
 * Fires the Plaid sandbox webhook and triggers initial transaction sync.
 * Called after the user has selected which accounts to import.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const uid = userId || "demo";

    const item = await itemsRepo.getByUser(uid);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "No Plaid item found" },
        { status: 404 },
      );
    }

    const accessToken = decrypt(item.access_token_enc);

    // Fire sandbox webhook so Plaid prepares transactions
    try {
      await plaid.sandboxItemFireWebhook({
        access_token: accessToken,
        webhook_code: "DEFAULT_UPDATE" as any,
      });
      console.log("🔥 Fired sandbox webhook for transaction sync");
    } catch (err) {
      console.warn("⚠️ Webhook fire failed (may be non-sandbox item):", err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Sync trigger failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
