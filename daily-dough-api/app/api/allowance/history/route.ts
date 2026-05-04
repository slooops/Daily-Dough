import { NextRequest, NextResponse } from "next/server";
import { periodHistoryRepo } from "@/server/repo";

/**
 * GET /api/allowance/history?userId=demo
 * Returns all completed period summaries for a user.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 },
    );
  }

  const periods = await periodHistoryRepo.listByUser(userId);
  return NextResponse.json({ success: true, periods });
}
