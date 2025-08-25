import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

export async function POST() {
  try {
    // For MVP, hardcode user_id = 'me'
    const resp = await plaid.linkTokenCreate({
      user: { client_user_id: "me" },
      client_name: "Daily Dough",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      redirect_uri: "daily-dough://plaid-oauth",
    });

    return NextResponse.json({ link_token: resp.data.link_token });
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
