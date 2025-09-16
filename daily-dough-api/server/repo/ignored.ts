/**
 * Ignored Transactions Repository
 * Manages user preferences for excluding transactions from calculations
 */

import { db } from "../db";
import type { IgnoredTransaction } from "../../lib/generated/prisma";

export interface IgnoreRuleInput {
  userId: string;
  transaction_id?: string;
  merchant_pattern?: string;
}

/**
 * List all ignore rules for a user
 */
export async function listByUser(
  userId: string
): Promise<IgnoredTransaction[]> {
  return await db.ignoredTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Add an ignore rule (transaction-specific or merchant pattern)
 */
export async function addRule(
  rule: IgnoreRuleInput
): Promise<IgnoredTransaction> {
  if (!rule.transaction_id && !rule.merchant_pattern) {
    throw new Error("Must specify either transaction_id or merchant_pattern");
  }

  if (rule.transaction_id && rule.merchant_pattern) {
    throw new Error("Cannot specify both transaction_id and merchant_pattern");
  }

  return await db.ignoredTransaction.create({
    data: {
      userId: rule.userId,
      transaction_id: rule.transaction_id ?? null,
      merchant_pattern: rule.merchant_pattern ?? null,
    },
  });
}

/**
 * Remove an ignore rule
 */
export async function removeRule(id: string): Promise<void> {
  await db.ignoredTransaction.delete({
    where: { id },
  });
}

/**
 * Check if a transaction should be ignored
 */
export async function shouldIgnoreTransaction(
  userId: string,
  transaction: {
    transaction_id: string;
    merchant_name?: string;
    name: string;
  }
): Promise<boolean> {
  const rules = await listByUser(userId);

  for (const rule of rules) {
    // Check specific transaction ID
    if (rule.transaction_id === transaction.transaction_id) {
      return true;
    }

    // Check merchant pattern
    if (rule.merchant_pattern) {
      const merchantToCheck = transaction.merchant_name || transaction.name;
      if (matchesPattern(merchantToCheck, rule.merchant_pattern)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Simple glob-style pattern matching
 */
function matchesPattern(text: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(text);
}

/**
 * Remove ignore rule by transaction ID
 */
export async function removeByTransactionId(
  userId: string,
  transaction_id: string
): Promise<void> {
  await db.ignoredTransaction.deleteMany({
    where: {
      userId,
      transaction_id,
    },
  });
}
