import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { encrypt } from "@/lib/crypto";
import { itemsRepo, accountsRepo } from "@/server/repo";
import { CountryCode } from "plaid";

/**
 * POST /api/plaid/exchange
 * Exchange a public_token for an access_token and store the item
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { public_token, userId } = body;

    if (!public_token) {
      return NextResponse.json(
        { error: "public_token is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Exchanging public token...");

    // Exchange public_token for access_token
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    console.log(`✅ Token exchange successful - Item ID: ${item_id}`);

    // Get item details for better logging
    const itemResponse = await plaid.itemGet({
      access_token,
    });

    const institution = itemResponse.data.item.institution_id
      ? await plaid.institutionsGetById({
          institution_id: itemResponse.data.item.institution_id,
          country_codes: [CountryCode.Us],
        })
      : null;

    const institutionName =
      institution?.data.institution.name || "Unknown Bank";

    console.log(`🏦 Connected to: ${institutionName}`);

    // Encrypt access token before storage
    const encryptedAccessToken = encrypt(access_token);

    // Store item using repository
    const savedItem = await itemsRepo.upsertItem({
      userId,
      item_id,
      access_token_enc: encryptedAccessToken,
      institution_id: itemResponse.data.item.institution_id || "unknown",
    });

    console.log(`💾 Stored item for user ${userId}: ${savedItem.id}`);

    // Get and store account details
    const accountsResponse = await plaid.accountsGet({
      access_token,
    });

    const accountsToStore = accountsResponse.data.accounts.map((acc) => ({
      account_id: acc.account_id,
      item_id: item_id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype || "",
      mask: acc.mask || "",
      balances: acc.balances,
      raw: acc,
    }));

    // Store accounts
    await accountsRepo.upsertMany(item_id, accountsToStore);

    const accounts = accountsResponse.data.accounts.map((acc) => ({
      id: acc.account_id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype,
      balance: acc.balances.current || 0,
    }));

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      userId,
      itemId: savedItem.id,
      item_id: savedItem.item_id, // Use actual Plaid item_id
      institution_name: institutionName,
      accounts,
      message: "Token exchange successful",
    });
  } catch (error: any) {
    console.error("❌ Token exchange failed:", error);

    if (error.response?.data) {
      console.error("📋 Plaid API Error Details:", error.response.data);
    }

    return NextResponse.json(
      {
        error: "Token exchange failed",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
