import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { Products } from "plaid";

/**
 * GET /api/plaid/sandbox-data
 * Creates test data including a public token for testing exchange
 */
export async function GET() {
  try {
    console.log("🧪 Creating sandbox test data...");

    // Create a fresh sandbox public token
    const sandboxResponse = await plaid.sandboxPublicTokenCreate({
      institution_id: "ins_109508", // Chase (sandbox)
      initial_products: [Products.Transactions],
    });

    const { public_token } = sandboxResponse.data;

    // Also get some sample data for context
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token,
    });

    const { access_token } = exchangeResponse.data;

    const accountsResponse = await plaid.accountsGet({
      access_token,
    });

    const transactionsResponse = await plaid.transactionsGet({
      access_token,
      start_date: "2025-08-01",
      end_date: "2025-09-08",
      options: { count: 10 },
    });

    return NextResponse.json({
      success: true,
      message: "Sandbox test data created",
      public_token,
      dataType: "sandbox",
      data: {
        accounts: accountsResponse.data.accounts.map((acc) => ({
          id: acc.account_id,
          name: acc.name,
          type: acc.type,
          balance: acc.balances.current,
        })),
        transactions: transactionsResponse.data.transactions.map((tx) => ({
          id: tx.transaction_id,
          merchant: tx.merchant_name || tx.name,
          amount: tx.amount,
          date: tx.date,
          category: tx.category?.[0] || "Other",
        })),
      },
    });
  } catch (error: any) {
    console.error("❌ Sandbox data creation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create sandbox data",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
