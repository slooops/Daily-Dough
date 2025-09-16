/**
 * Slush Ledger Repository
 * Tracks daily slush fund balance changes for analytics
 */

import { db } from "../db";
import type { SlushLedger } from "../../lib/generated/prisma";

export interface SlushEntryInput {
  userId: string;
  date: string; // ISO date string
  start_balance: number;
  daily_surplus: number; // max(0, remaining) for analytics
  slush_end_balance: number;
}

/**
 * Append a new slush ledger entry
 */
export async function appendEntry(
  userId: string,
  entry: Omit<SlushEntryInput, "userId">
): Promise<SlushLedger> {
  return await db.slushLedger.create({
    data: {
      userId,
      date: entry.date,
      start_balance: entry.start_balance,
      daily_surplus: entry.daily_surplus,
      slush_end_balance: entry.slush_end_balance,
    },
  });
}

/**
 * Get the latest slush ledger entry for a user
 */
export async function latest(userId: string): Promise<SlushLedger | null> {
  return await db.slushLedger.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

/**
 * Get slush ledger entries for a date range
 */
export async function getForPeriod(
  userId: string,
  startDate: string,
  endDate: string
): Promise<SlushLedger[]> {
  return await db.slushLedger.findMany({
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
 * Get slush balance for a specific date
 */
export async function getBalanceForDate(
  userId: string,
  date: string
): Promise<number | null> {
  const entry = await db.slushLedger.findFirst({
    where: {
      userId,
      date: { lte: date },
    },
    orderBy: { date: "desc" },
  });

  return entry?.slush_end_balance ?? null;
}

/**
 * Calculate total surplus over a period
 */
export async function getTotalSurplus(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const result = await db.slushLedger.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      daily_surplus: true,
    },
  });

  return result._sum.daily_surplus ?? 0;
}
