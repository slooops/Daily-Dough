import { NextRequest, NextResponse } from "next/server";
import { computePeriodToDate } from "@/server/services/computePeriodToDate";

/**
 * POST /api/allowance/recompute
 * Force a full recomputation of the allowance engine.
 * Useful after ignore rule changes or profile updates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    const result = await computePeriodToDate(userId);

    return NextResponse.json({
      success: true,
      message: "Recomputation complete",
      daysComputed: result.days.length,
      today: result.today,
      streak: result.streak,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("profile not found") ? 404 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status },
    );
  }
}
