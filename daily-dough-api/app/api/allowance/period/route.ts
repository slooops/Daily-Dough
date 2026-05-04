import { NextRequest, NextResponse } from "next/server";
import { computePeriodToDate } from "@/server/services/computePeriodToDate";

/**
 * GET /api/allowance/period?userId=demo
 * Returns the full day-by-day allowance breakdown for the current pay period.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 },
    );
  }

  try {
    const result = await computePeriodToDate(userId);

    return NextResponse.json({
      success: true,
      expectations: result.expectations,
      seed: result.seed,
      days: result.days,
      streak: result.streak,
    });
  } catch (error: any) {
    const status = error.message?.includes("profile not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status },
    );
  }
}
