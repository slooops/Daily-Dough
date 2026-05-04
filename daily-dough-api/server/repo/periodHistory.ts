/**
 * Period History Repository
 * Stores completed pay period summaries for review
 */

import { db } from "../db";
import type { PeriodHistory } from "../../lib/generated/prisma";

export interface PeriodHistoryInput {
  userId: string;
  periodStart: string;
  periodEnd: string;
  totalBudget: number;
  totalSpend: number;
  totalCredits: number;
  slushEnd: number;
  sentToBank: number;
  carryOver: number;
  streakLongest: number;
  daysWithinBudget: number;
  daysTotal: number;
}

export async function create(data: PeriodHistoryInput): Promise<PeriodHistory> {
  return await db.periodHistory.create({ data });
}

export async function listByUser(userId: string): Promise<PeriodHistory[]> {
  return await db.periodHistory.findMany({
    where: { userId },
    orderBy: { periodStart: "desc" },
  });
}

export async function getLatest(userId: string): Promise<PeriodHistory | null> {
  return await db.periodHistory.findFirst({
    where: { userId },
    orderBy: { periodStart: "desc" },
  });
}
