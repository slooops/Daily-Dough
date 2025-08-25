import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { sql } from "@vercel/postgres";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();

    if (!public_token) {
      return NextResponse.json(
        { error: "public_token is required" },
        { status: 400 }
      );
    }

    const { data } = await plaid.itemPublicTokenExchange({ public_token });
    const enc = encrypt(data.access_token);

    await sql`
      INSERT INTO user_items (user_id, access_token_enc)
      VALUES ('me', ${enc})
      ON CONFLICT (user_id) 
      DO UPDATE SET access_token_enc = excluded.access_token_enc
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json(
      { error: "Failed to exchange public token" },
      { status: 500 }
    );
  }
}
