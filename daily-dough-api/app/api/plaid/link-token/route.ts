import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

/**
 * POST /api/plaid/link-token
 * Creates a Plaid Link token for connecting bank accounts
 */
export async function POST(request: Request) {
  try {
    // Parse request body for optional user ID (default to 'me' for MVP)
    let userId = "me";
    try {
      const body = await request.json();
      if (body?.userId) {
        userId = body.userId;
      }
    } catch (e) {
      // If no body or invalid JSON, use default
    }

    console.log(`🔗 Creating link token for user: ${userId}`);

    // Get the base URL for webhook - use localhost for development, production URL for prod
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com" // Replace with actual domain
      : "http://localhost:3001";

    const webhookUrl = `${baseUrl}/api/plaid/webhook`;

    const linkTokenRequest = {
      user: { client_user_id: userId },
      client_name: "Daily Dough",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en" as const,
      webhook: webhookUrl,
    };

    console.log("📡 Link token request:", {
      user: linkTokenRequest.user,
      products: linkTokenRequest.products,
      country_codes: linkTokenRequest.country_codes,
      webhook: webhookUrl,
    });

    const resp = await plaid.linkTokenCreate(linkTokenRequest);

    console.log("✅ Link token created successfully");
    console.log("📅 Token expires at:", resp.data.expiration);

    return NextResponse.json({
      link_token: resp.data.link_token,
      expiration: resp.data.expiration,
      request_id: resp.data.request_id,
    });
  } catch (error: any) {
    console.error("❌ Error creating link token:", error);

    // Log more details for debugging
    if (error.response?.data) {
      console.error("📋 Plaid API Error Details:", error.response.data);
    }

    return NextResponse.json(
      {
        error: "Failed to create link token",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
