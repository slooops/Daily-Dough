/**
 * Streak State Repository
 * Manages user streak tracking for within-budget days
 */

import { db } from "../db";
import type { StreakState } from "../../lib/generated/prisma";

export interface StreakStateInput {
  userId: string;
  current_streak: number;
  longest_streak: number;
  last_within_budget_date?: string;
}

/**
 * Get streak state for a user
 */
export async function get(userId: string): Promise<StreakState | null> {
  return await db.streakState.findUnique({
    where: { userId },
  });
}

/**
 * Set/update streak state for a user
 */
export async function set(
  userId: string,
  state: Omit<StreakStateInput, "userId">
): Promise<StreakState> {
  return await db.streakState.upsert({
    where: { userId },
    update: {
      current_streak: state.current_streak,
      longest_streak: state.longest_streak,
      last_within_budget_date: state.last_within_budget_date ?? null,
      updatedAt: new Date(),
    },
    create: {
      userId,
      current_streak: state.current_streak,
      longest_streak: state.longest_streak,
      last_within_budget_date: state.last_within_budget_date ?? null,
    },
  });
}

/**
 * Increment current streak and update longest if needed
 */
export async function incrementStreak(
  userId: string,
  date: string
): Promise<StreakState> {
  const current = await get(userId);

  const newCurrentStreak = (current?.current_streak ?? 0) + 1;
  const newLongestStreak = Math.max(
    newCurrentStreak,
    current?.longest_streak ?? 0
  );

  return await set(userId, {
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_within_budget_date: date,
  });
}

/**
 * Reset current streak (when budget exceeded)
 */
export async function resetStreak(userId: string): Promise<StreakState> {
  const current = await get(userId);

  return await set(userId, {
    current_streak: 0,
    longest_streak: current?.longest_streak ?? 0,
    last_within_budget_date: current?.last_within_budget_date ?? undefined,
  });
}

/**
 * Get all streak states (for admin/analytics)
 */
export async function getAllStreaks(): Promise<StreakState[]> {
  return await db.streakState.findMany({
    orderBy: { current_streak: "desc" },
  });
}
