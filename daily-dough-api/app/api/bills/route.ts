import { NextRequest, NextResponse } from "next/server";
import { billsRepo } from "@/server/repo";

/**
 * GET /api/bills?userId=demo
 * List all active bills for a user
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 },
    );
  }

  const bills = await billsRepo.listByUser(userId);
  return NextResponse.json({ success: true, bills });
}

/**
 * POST /api/bills
 * Add a recurring bill
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, amount, frequency } = body;

    if (!userId || !name || amount == null || !frequency) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, name, amount, frequency",
        },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    const validFrequencies = ["monthly", "yearly"];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: `frequency must be one of: ${validFrequencies.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const bill = await billsRepo.add({ userId, name, amount, frequency });
    return NextResponse.json({ success: true, bill });
  } catch (error: any) {
    console.error("❌ Add bill failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add bill", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bills
 * Remove a bill by id
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

    const bill = await billsRepo.getById(id);
    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Bill not found" },
        { status: 404 },
      );
    }

    await billsRepo.remove(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    console.error("❌ Delete bill failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bill",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
