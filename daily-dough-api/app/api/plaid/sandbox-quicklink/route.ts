import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { itemsRepo, accountsRepo } from "@/server/repo";
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

    const savedItem = await itemsRepo.upsertItem({
      userId: "demo",
      item_id: item_id,
      access_token_enc: encryptedAccessToken,
      institution_id: itemResponse.data.item.institution_id!,
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

    // Step 6: Save accounts with imported=false (user picks which to import)
    const accountsToSave = accountsResponse.data.accounts.map((acc) => ({
      account_id: acc.account_id,
      item_id: item_id,
      name: acc.name,
      type: acc.type,
      subtype: acc.subtype || undefined,
      mask: acc.mask || undefined,
      balances: acc.balances,
      raw: acc,
      imported: false,
    }));

    const savedAccounts = await accountsRepo.upsertMany(
      item_id,
      accountsToSave
    );
    console.log(`💾 Saved ${savedAccounts.length} accounts (all imported=false, awaiting user selection)`);

    return NextResponse.json({
      success: true,
      message: "Sandbox item created — select accounts to import",
      item_id: savedItem.id,
      institution_name: institutionName,
      accounts_count: accounts.length,
      accounts: accounts.map((a) => ({ ...a, imported: false })),
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
