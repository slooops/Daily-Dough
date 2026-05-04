/**
 * Allowance Engine Orchestrator
 *
 * Glues repositories to the pure engine functions.
 * Fetches data from DB, runs computation, persists results.
 */

import {
  userProfileRepo,
  billsRepo,
  transactionsRepo,
  ignoredRepo,
  dailyBudgetRepo,
  streakRepo,
  slushLedgerRepo,
} from "../repo";
import {
  computeExpectations,
  computePeriod,
  computeStreak,
  seedPeriod,
  type PeriodResult,
} from "../services/allowanceEngine";

/**
 * Run the full allowance computation for a user's current pay period.
 * Fetches all inputs from DB, runs the engine, persists results.
 *
 * @param carryOverFromPrev — carry-over from previous period (default 0)
 */
export async function computePeriodToDate(
  userId: string,
  carryOverFromPrev: number = 0,
): Promise<PeriodResult> {
  // 1. Fetch inputs
  const profile = await userProfileRepo.get(userId);
  if (!profile) {
    throw new Error("User profile not found. Complete onboarding first.");
  }

  const bills = await billsRepo.listByUser(userId);
  const ignoreRules = await ignoredRepo.listByUser(userId);

  // Build ignore lookup structures
  const ignoredTxIds = new Set<string>();
  const merchantPatterns: string[] = [];
  for (const rule of ignoreRules) {
    if (rule.transaction_id) ignoredTxIds.add(rule.transaction_id);
    if (rule.merchant_pattern) merchantPatterns.push(rule.merchant_pattern);
  }

  // 2. Fetch transactions for this period
  const transactions = await transactionsRepo.listByPeriod({
    userId,
    startDate: profile.periodStart,
    endDate: profile.periodEnd,
  });

  // 3. Run engine
  const expectations = computeExpectations(profile, bills);
  const seed = seedPeriod(profile, expectations, carryOverFromPrev);
  const days = computePeriod(
    profile,
    seed,
    transactions,
    ignoredTxIds,
    merchantPatterns,
  );
  const streak = computeStreak(days);

  // 4. Persist results
  for (const day of days) {
    await dailyBudgetRepo.upsertDailyResult({
      userId,
      date: day.date,
      allowance: day.allowanceToday,
      spend_actual: day.spendToday,
      credits_actual: day.creditsToday,
      remaining: day.allowanceToday - day.spendToday,
      within_budget: day.withinBudget,
    });

    await slushLedgerRepo.appendEntry(userId, {
      date: day.date,
      start_balance: day.slushBalance + day.spendToday - day.creditsToday, // balance before today's txns
      daily_surplus: Math.max(0, day.allowanceToday - day.spendToday),
      slush_end_balance: day.slushBalance,
    });
  }

  // 5. Update streak
  await streakRepo.set(userId, {
    current_streak: streak.current,
    longest_streak: streak.longest,
    last_within_budget_date:
      days.length > 0 && days[days.length - 1].withinBudget
        ? days[days.length - 1].date
        : undefined,
  });

  // 6. Return results
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayResult = days.find((d) => d.date === todayStr) ?? null;

  return {
    expectations,
    seed,
    days,
    today: todayResult,
    streak,
  };
}
