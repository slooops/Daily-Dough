import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaid";
import { sql } from "@vercel/postgres";
import { decrypt } from "@/lib/crypto";

export async function GET() {
  try {
    const row = await sql`
      SELECT access_token_enc FROM user_items WHERE user_id='me'
    `;

    if (!row.rows.length) {
      return NextResponse.json({ transactions: [] });
    }

    const access_token = decrypt(row.rows[0].access_token_enc);

    // MVP: pull last 14–30 days; upgrade to /transactions/sync later
    const start = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);

    const { data } = await plaid.transactionsGet({
      access_token,
      start_date: start,
      end_date: end,
      options: { count: 100, offset: 0 },
    });

    const txs = data.transactions.map((t) => ({
      id: t.transaction_id,
      date: t.date,
      merchant: t.merchant_name || t.name,
      amount: Math.abs(t.amount), // display absolute
      rawAmount: t.amount, // sign: negative=outflow at Plaid
      tag: t.amount < 0 ? "spend" : "refund",
    }));

    return NextResponse.json({
      transactions: txs,
      lastSynced: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
