import { NextRequest, NextResponse } from "next/server";
import { computePeriodToDate } from "@/server/services/computePeriodToDate";
import { userProfileRepo, periodHistoryRepo } from "@/server/repo";

/**
 * POST /api/allowance/end-period
 * Finalize current period: store history, advance dates, carry over slush.
 *
 * Body: { userId, carryOver }
 *   carryOver: amount to carry into next period (0 ≤ carryOver ≤ slushEnd)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, carryOver } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    if (typeof carryOver !== "number" || carryOver < 0) {
      return NextResponse.json(
        { success: false, error: "carryOver must be a non-negative number" },
        { status: 400 },
      );
    }

    // 1. Compute final period state
    const result = await computePeriodToDate(userId);
    const profile = await userProfileRepo.get(userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 },
      );
    }

    // Get final slush balance from last day
    const lastDay = result.days[result.days.length - 1];
    const slushEnd = lastDay?.slushBalance ?? 0;

    // Validate carryOver doesn't exceed slush
    const clampedCarryOver = Math.min(
      Math.max(0, carryOver),
      Math.max(0, slushEnd),
    );
    const sentToBank = Math.max(0, slushEnd - clampedCarryOver);

    // 2. Compute summary stats
    const totalSpend = result.days.reduce((s, d) => s + d.spendToday, 0);
    const totalCredits = result.days.reduce((s, d) => s + d.creditsToday, 0);
    const daysWithinBudget = result.days.filter((d) => d.withinBudget).length;

    // 3. Store period history
    await periodHistoryRepo.create({
      userId,
      periodStart: profile.periodStart,
      periodEnd: profile.periodEnd,
      totalBudget: result.seed.expectedPeriodBudget,
      totalSpend,
      totalCredits,
      slushEnd,
      sentToBank,
      carryOver: clampedCarryOver,
      streakLongest: result.streak.longest,
      daysWithinBudget,
      daysTotal: result.days.length,
    });

    // 4. Advance period dates
    const oldEnd = new Date(profile.periodEnd + "T00:00:00");
    const periodLength =
      Math.round(
        (new Date(profile.periodEnd + "T00:00:00").getTime() -
          new Date(profile.periodStart + "T00:00:00").getTime()) /
          86_400_000,
      ) + 1;

    const newStart = new Date(oldEnd.getTime() + 86_400_000); // day after old end
    const newEnd = new Date(
      newStart.getTime() + (periodLength - 1) * 86_400_000,
    );

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    await userProfileRepo.upsert(userId, {
      grossPaycheck: profile.grossPaycheck,
      payCadence: profile.payCadence as any,
      monthlyRent: profile.monthlyRent,
      periodStart: fmt(newStart),
      periodEnd: fmt(newEnd),
    });

    return NextResponse.json({
      success: true,
      summary: {
        periodStart: profile.periodStart,
        periodEnd: profile.periodEnd,
        slushEnd,
        sentToBank,
        carryOver: clampedCarryOver,
        totalSpend,
        totalCredits,
        daysWithinBudget,
        daysTotal: result.days.length,
        streakLongest: result.streak.longest,
      },
      newPeriod: {
        periodStart: fmt(newStart),
        periodEnd: fmt(newEnd),
      },
    });
  } catch (error: any) {
    console.error("❌ End period failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to end period", details: error.message },
      { status: 500 },
    );
  }
}
