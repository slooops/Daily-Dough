import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { saveItem } from "@/lib/repository";
import { encrypt } from "@/lib/crypto";
import { Products, CountryCode } from "plaid";

/**
 * GET /api/plaid/sandbox-quicklink
 * Creates a sandbox item without going through Plaid Link UI
 * For development/testing purposes only
 */
export async function GET() {
  try {
    console.log("🧪 Creating sandbox quicklink item...");

    // Step 1: Create sandbox public token
    const sandboxResponse = await plaid.sandboxPublicTokenCreate({
      institution_id: "ins_109508", // Chase (sandbox)
      initial_products: [Products.Transactions],
      options: {
        webhook: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api/plaid/webhook`
          : "http://localhost:3000/api/plaid/webhook",
      },
    });

    const { public_token } = sandboxResponse.data;
    console.log("📝 Created sandbox public token");

    // Step 2: Exchange public token for access token
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;
    console.log(`✅ Exchange successful - Item ID: ${item_id}`);

    // Step 3: Get item and institution details
    const itemResponse = await plaid.itemGet({
      access_token,
    });

    const institutionResponse = await plaid.institutionsGetById({
      institution_id: itemResponse.data.item.institution_id!,
      country_codes: [CountryCode.Us],
    });

    const institutionName = institutionResponse.data.institution.name;
    console.log(`🏦 Connected to: ${institutionName} (Sandbox)`);

    // Step 4: Encrypt and store access token
    const encryptedAccessToken = encrypt(access_token);

    const savedItem = await saveItem({
      userId: "demo",
      accessToken: encryptedAccessToken,
      institutionId: itemResponse.data.item.institution_id!,
      institutionName: `${institutionName} (Sandbox)`,
    });

    console.log(`💾 Stored sandbox item: ${savedItem.id}`);

    // Step 5: Get accounts for additional context
    const accountsResponse = await plaid.accountsGet({
      access_token,
    });

    const accounts = accountsResponse.data.accounts.map((acc) => ({
      id: acc.account_id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype,
      balance: acc.balances.current,
    }));

    console.log(`📊 Found ${accounts.length} accounts`);

    return NextResponse.json({
      success: true,
      message: "Sandbox item created successfully",
      item_id: savedItem.id,
      institution_name: institutionName,
      accounts_count: accounts.length,
      accounts: accounts.slice(0, 3), // Show first 3 accounts
      note: "This is a sandbox item for development/testing",
    });
  } catch (error: any) {
    console.error("❌ Sandbox quicklink failed:", error);

    if (error.response?.data) {
      console.error("📋 Plaid API Error Details:", error.response.data);
    }

    return NextResponse.json(
      {
        error: "Sandbox quicklink failed",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
