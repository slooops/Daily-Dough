import { NextRequest, NextResponse } from "next/server";
import { ignoredRepo } from "@/server/repo";

/**
 * GET /api/ignored-rules?userId=demo
 * List all ignore rules for a user
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 },
    );
  }

  const rules = await ignoredRepo.listByUser(userId);
  return NextResponse.json({ success: true, rules });
}

/**
 * POST /api/ignored-rules
 * Add an ignore rule (by transaction_id or merchant_pattern)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, transaction_id, merchant_pattern } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    if (!transaction_id && !merchant_pattern) {
      return NextResponse.json(
        {
          success: false,
          error: "Must provide either transaction_id or merchant_pattern",
        },
        { status: 400 },
      );
    }

    if (transaction_id && merchant_pattern) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot specify both transaction_id and merchant_pattern",
        },
        { status: 400 },
      );
    }

    const rule = await ignoredRepo.addRule({
      userId,
      transaction_id: transaction_id || undefined,
      merchant_pattern: merchant_pattern || undefined,
    });

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    console.error("❌ Add ignore rule failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add rule", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/ignored-rules
 * Remove an ignore rule by id
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    await ignoredRepo.removeRule(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error("❌ Delete ignore rule failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete rule",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
