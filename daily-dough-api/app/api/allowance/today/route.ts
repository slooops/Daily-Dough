import { NextRequest, NextResponse } from "next/server";
import { computePeriodToDate } from "@/server/services/computePeriodToDate";

/**
 * GET /api/allowance/today?userId=demo
 * Returns today's allowance, spend, slush, and streak.
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

    if (!result.today) {
      return NextResponse.json({
        success: true,
        message: "Today is outside the current pay period",
        expectations: result.expectations,
        seed: result.seed,
        streak: result.streak,
        today: null,
      });
    }

    return NextResponse.json({
      success: true,
      today: result.today,
      seed: {
        expectedPeriodBudget: result.seed.expectedPeriodBudget,
        baseGrantPerDay: result.seed.baseGrantPerDay,
        daysInPeriod: result.seed.daysInPeriod,
      },
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
