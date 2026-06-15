import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { Products } from "plaid";

/**
 * GET /api/plaid/sandbox-public-token
 * Creates a sandbox public token for testing exchange flow
 * Returns only the public token (not exchanged)
 */
export async function GET() {
  try {
    console.log("🧪 Creating sandbox public token for testing...");

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
    console.log("✅ Created sandbox public token for testing");

    return NextResponse.json({
      success: true,
      public_token,
      message: "Sandbox public token created - use with /api/plaid/exchange",
      institution_id: "ins_109508",
      note: "This simulates what Plaid Link would return",
    });
  } catch (error: unknown) {
    console.error("❌ Sandbox public token creation failed:", error);

    const plaidError = error as { response?: { data?: unknown } };
    const details = plaidError.response?.data || (error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: "Sandbox public token creation failed",
        details,
      },
      { status: 500 }
    );
  }
}
