/**
 * User Profile Repository
 * Stores user financial baseline for the Allowance Engine
 */

import { db } from "../db";
import type { UserProfile } from "../../lib/generated/prisma";

export interface UserProfileInput {
  grossPaycheck: number;
  payCadence: "weekly" | "biweekly" | "semimonthly" | "monthly";
  monthlyRent: number;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
}

/**
 * Get profile for a user
 */
export async function get(userId: string): Promise<UserProfile | null> {
  return await db.userProfile.findUnique({
    where: { userId },
  });
}

/**
 * Create or update user profile
 */
export async function upsert(
  userId: string,
  data: UserProfileInput,
): Promise<UserProfile> {
  return await db.userProfile.upsert({
    where: { userId },
    update: {
      grossPaycheck: data.grossPaycheck,
      payCadence: data.payCadence,
      monthlyRent: data.monthlyRent,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
    },
    create: {
      userId,
      grossPaycheck: data.grossPaycheck,
      payCadence: data.payCadence,
      monthlyRent: data.monthlyRent,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
    },
  });
}
