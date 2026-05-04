/**
 * Allowance Engine
 *
 * The core business logic of Daily Dough. Computes how much a user
 * can safely spend each day based on their income, fixed costs, and
 * actual spending history.
 *
 * Amount convention (Plaid standard):
 *   positive = expense (money leaving account)
 *   negative = income/credit (money entering account)
 */

import type {
  UserProfile,
  Bill,
  Transaction,
} from "../../lib/generated/prisma";

// ── Types ──────────────────────────────────────────────────────────

export interface Expectations {
  annualIncomeExpected: number;
  annualRentExpected: number;
  annualBillsExpected: number;
  dailyIncomeExpected: number;
  dailyFixedExpected: number;
  baseDailyAllowance: number;
}

export interface PeriodSeed {
  daysInPeriod: number;
  expectedPeriodBudget: number;
  slushBalance: number;
  baseGrantPerDay: number;
}

export interface DayResult {
  date: string;
  allowanceToday: number;
  spendToday: number;
  creditsToday: number;
  slushBalance: number;
  withinBudget: boolean;
  noSpendDay: boolean;
  carryover: number;
}

export interface PeriodResult {
  expectations: Expectations;
  seed: PeriodSeed;
  days: DayResult[];
  today: DayResult | null;
  streak: { current: number; longest: number };
}

// ── Helpers ────────────────────────────────────────────────────────

function paychecksPerYear(cadence: string): number {
  switch (cadence) {
    case "weekly":
      return 52;
    case "biweekly":
      return 26;
    case "semimonthly":
      return 24;
    case "monthly":
      return 12;
    default:
      return 26; // safe default
  }
}

/** Count calendar days between two ISO date strings (inclusive). */
function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

/** Generate array of ISO date strings from start to end (inclusive). */
function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Today as ISO date string in local time. */
function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// ── Engine Functions ───────────────────────────────────────────────

/**
 * Step 1: Compute annualized expectations from user profile + bills.
 */
export function computeExpectations(
  profile: UserProfile,
  bills: Bill[],
): Expectations {
  const annualIncomeExpected =
    profile.grossPaycheck * paychecksPerYear(profile.payCadence);
  const annualRentExpected = profile.monthlyRent * 12;
  const annualBillsExpected = bills.reduce((sum, bill) => {
    const amount = bill.amount ?? 0;
    // amount_strategy stores the frequency: "monthly" or "yearly"
    const freq = bill.amount_strategy ?? "monthly";
    return sum + amount * (freq === "monthly" ? 12 : 1);
  }, 0);

  const dailyIncomeExpected = annualIncomeExpected / 365;
  const dailyFixedExpected = (annualRentExpected + annualBillsExpected) / 365;
  const baseDailyAllowance = dailyIncomeExpected - dailyFixedExpected;

  return {
    annualIncomeExpected,
    annualRentExpected,
    annualBillsExpected,
    dailyIncomeExpected,
    dailyFixedExpected,
    baseDailyAllowance,
  };
}

/**
 * Step 2: Seed a pay period with budget parameters.
 */
export function seedPeriod(
  profile: UserProfile,
  expectations: Expectations,
  carryOverFromPrev: number = 0,
): PeriodSeed {
  const daysInPeriod = daysBetween(profile.periodStart, profile.periodEnd);
  const expectedPeriodBudget = expectations.baseDailyAllowance * daysInPeriod;
  const slushBalance = carryOverFromPrev + expectedPeriodBudget;
  const baseGrantPerDay = expectedPeriodBudget / daysInPeriod;

  return { daysInPeriod, expectedPeriodBudget, slushBalance, baseGrantPerDay };
}

/**
 * Check whether a transaction should be ignored.
 * Matches on transaction_id or merchant_pattern (case-insensitive substring).
 */
function isIgnored(
  tx: Transaction,
  ignoredIds: Set<string>,
  merchantPatterns: string[],
): boolean {
  if (ignoredIds.has(tx.transaction_id)) return true;
  const merchantToCheck = (tx.merchant_name || tx.name).toLowerCase();
  return merchantPatterns.some((p) =>
    merchantToCheck.includes(p.toLowerCase()),
  );
}

/**
 * Step 3: Walk through each day of the period, computing allowance,
 * spend, credits, slush, and carryover day-by-day.
 *
 * Processes from periodStart through min(periodEnd, today).
 */
export function computePeriod(
  profile: UserProfile,
  seed: PeriodSeed,
  transactions: Transaction[],
  ignoredTxIds: Set<string>,
  merchantPatterns: string[],
): DayResult[] {
  const today = todayISO();
  const endDate = profile.periodEnd < today ? profile.periodEnd : today;
  const dates = dateRange(profile.periodStart, endDate);

  // Group transactions by date
  const txByDate = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (isIgnored(tx, ignoredTxIds, merchantPatterns)) continue;
    if (tx.status === "removed") continue;
    const d = tx.date.slice(0, 10);
    if (!txByDate.has(d)) txByDate.set(d, []);
    txByDate.get(d)!.push(tx);
  }

  const results: DayResult[] = [];
  let carryover = 0;
  let slush = seed.slushBalance;

  for (const date of dates) {
    const dayTxns = txByDate.get(date) || [];

    const allowanceToday = seed.baseGrantPerDay + carryover;

    // Plaid convention: positive = expense, negative = income/credit
    let spendToday = 0;
    let creditsToday = 0;
    for (const tx of dayTxns) {
      if (tx.amount > 0) {
        spendToday += tx.amount;
      } else {
        creditsToday += Math.abs(tx.amount);
      }
    }

    slush = slush - spendToday + creditsToday;
    const withinBudget = spendToday <= allowanceToday;
    const noSpendDay = spendToday === 0;
    carryover = allowanceToday - spendToday;

    results.push({
      date,
      allowanceToday,
      spendToday,
      creditsToday,
      slushBalance: slush,
      withinBudget,
      noSpendDay,
      carryover,
    });
  }

  return results;
}

/**
 * Compute streak from day results (sequential within-budget days ending today).
 */
export function computeStreak(days: DayResult[]): {
  current: number;
  longest: number;
} {
  let current = 0;
  let longest = 0;
  let streak = 0;

  for (const day of days) {
    if (day.withinBudget) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 0;
    }
  }
  current = streak; // streak at end = current streak

  return { current, longest };
}
