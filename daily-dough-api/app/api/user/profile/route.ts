import { NextRequest, NextResponse } from "next/server";
import { userProfileRepo } from "@/server/repo";

/**
 * GET /api/user/profile?userId=demo
 * Returns the user's financial profile (paycheck, rent, period dates)
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId is required" },
      { status: 400 },
    );
  }

  const profile = await userProfileRepo.get(userId);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "No profile found", hasProfile: false },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, profile });
}

/**
 * POST /api/user/profile
 * Create or update user financial profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      grossPaycheck,
      payCadence,
      monthlyRent,
      periodStart,
      periodEnd,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (
      grossPaycheck == null ||
      !payCadence ||
      monthlyRent == null ||
      !periodStart ||
      !periodEnd
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: grossPaycheck, payCadence, monthlyRent, periodStart, periodEnd",
        },
        { status: 400 },
      );
    }

    const validCadences = ["weekly", "biweekly", "semimonthly", "monthly"];
    if (!validCadences.includes(payCadence)) {
      return NextResponse.json(
        {
          success: false,
          error: `payCadence must be one of: ${validCadences.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (typeof grossPaycheck !== "number" || grossPaycheck <= 0) {
      return NextResponse.json(
        { success: false, error: "grossPaycheck must be a positive number" },
        { status: 400 },
      );
    }

    if (typeof monthlyRent !== "number" || monthlyRent < 0) {
      return NextResponse.json(
        { success: false, error: "monthlyRent must be a non-negative number" },
        { status: 400 },
      );
    }

    const profile = await userProfileRepo.upsert(userId, {
      grossPaycheck,
      payCadence,
      monthlyRent,
      periodStart,
      periodEnd,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    console.error("❌ Profile update failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        details: message,
      },
      { status: 500 },
    );
  }
}
