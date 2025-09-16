/**
 * Daily Budget Results Repository
 * Stores daily allowance calculations from the Allowance Engine
 */

import { db } from "../db";
import type { DailyBudgetResult } from "../../lib/generated/prisma";

export interface DailyResultInput {
  userId: string;
  date: string; // ISO date string
  allowance: number;
  spend_actual: number;
  credits_actual: number;
  remaining: number;
  within_budget: boolean;
  reason_exclusions?: string[]; // Array of ignored tx ids/merchants
}

/**
 * Upsert a daily budget result
 */
export async function upsertDailyResult(
  result: DailyResultInput
): Promise<DailyBudgetResult> {
  return await db.dailyBudgetResult.upsert({
    where: {
      userId_date: {
        userId: result.userId,
        date: result.date,
      },
    },
    update: {
      allowance: result.allowance,
      spend_actual: result.spend_actual,
      credits_actual: result.credits_actual,
      remaining: result.remaining,
      within_budget: result.within_budget,
      reason_exclusions: result.reason_exclusions
        ? JSON.stringify(result.reason_exclusions)
        : null,
    },
    create: {
      userId: result.userId,
      date: result.date,
      allowance: result.allowance,
      spend_actual: result.spend_actual,
      credits_actual: result.credits_actual,
      remaining: result.remaining,
      within_budget: result.within_budget,
      reason_exclusions: result.reason_exclusions
        ? JSON.stringify(result.reason_exclusions)
        : null,
    },
  });
}

/**
 * Get daily result for a specific date
 */
export async function getForDate(
  userId: string,
  date: string
): Promise<DailyBudgetResult | null> {
  return await db.dailyBudgetResult.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });
}

/**
 * Get daily results for a date range
 */
export async function getForPeriod(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyBudgetResult[]> {
  return await db.dailyBudgetResult.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });
}

/**
 * Get latest daily result for a user
 */
export async function getLatest(
  userId: string
): Promise<DailyBudgetResult | null> {
  return await db.dailyBudgetResult.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

/**
 * Count within-budget days in a period
 */
export async function countWithinBudgetDays(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  return await db.dailyBudgetResult.count({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      within_budget: true,
    },
  });
}
