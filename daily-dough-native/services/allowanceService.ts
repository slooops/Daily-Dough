/**
 * Allowance Engine Service
 * Fetches computed allowance data from the API
 */

import { logger } from "../utils/logger";

const API_BASE_URL = "http://localhost:3000/api";

export interface AllowanceTodayResponse {
  success: boolean;
  today: {
    date: string;
    allowanceToday: number;
    spendToday: number;
    creditsToday: number;
    slushBalance: number;
    withinBudget: boolean;
    noSpendDay: boolean;
    carryover: number;
  } | null;
  seed?: {
    expectedPeriodBudget: number;
    baseGrantPerDay: number;
    daysInPeriod: number;
  };
  streak?: {
    current: number;
    longest: number;
  };
  error?: string;
}

export async function fetchAllowanceToday(
  userId: string,
): Promise<AllowanceTodayResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/allowance/today?userId=${encodeURIComponent(userId)}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Failed to fetch allowance", error, {
      component: "allowanceService",
      action: "fetchAllowanceToday",
    });
    return { success: false, today: null, error: "Network error" };
  }
}

export async function fetchAllowancePeriod(userId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/allowance/period?userId=${encodeURIComponent(userId)}`,
    );
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch period data", error, {
      component: "allowanceService",
      action: "fetchAllowancePeriod",
    });
    return { success: false, error: "Network error" };
  }
}

export async function recomputeAllowance(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/allowance/recompute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    logger.error("Failed to recompute", error, {
      component: "allowanceService",
      action: "recomputeAllowance",
    });
    return { success: false, error: "Network error" };
  }
}

export async function endPeriod(userId: string, carryOver: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/allowance/end-period`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, carryOver }),
    });
    return await response.json();
  } catch (error) {
    logger.error("Failed to end period", error, {
      component: "allowanceService",
      action: "endPeriod",
    });
    return { success: false, error: "Network error" };
  }
}

export async function fetchPeriodHistory(userId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/allowance/history?userId=${encodeURIComponent(userId)}`,
    );
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch period history", error, {
      component: "allowanceService",
      action: "fetchPeriodHistory",
    });
    return { success: false, periods: [] };
  }
}
