/**
 * Transactions Repository
 * Handles Plaid transaction storage with idempotent sync support
 */

import { db } from "../db";
import type { Transaction } from "../../lib/generated/prisma";

export interface TransactionInput {
  transaction_id: string;
  account_id: string;
  item_id: string;
  date: string; // ISO date string
  name: string;
  merchant_name?: string;
  amount: number; // Signed: negative = expense, positive = income
  iso_currency_code?: string;
  category_primary?: string;
  category_secondary?: string;
  original_description?: string;
  pending?: boolean;
  raw: object; // Full Plaid response
}

export interface TransactionBatch {
  added: TransactionInput[];
  modified: TransactionInput[];
}

export interface TransactionListOptions {
  userId?: string;
  item_id?: string;
  account_id?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  includeRemoved?: boolean;
}

/**
 * Upsert a batch of transactions (added + modified)
 * This is the core sync operation for Plaid transactions
 * Optimized with bulk operations instead of individual upserts
 */
export async function upsertBatch(batch: TransactionBatch): Promise<{
  addedCount: number;
  modifiedCount: number;
}> {
  const allTransactions = [...batch.added, ...batch.modified];

  console.log(
    `🔄 Processing ${allTransactions.length} transactions with optimized bulk operations`
  );

  // STEP 1: Find existing transactions
  const existingIds = await db.transaction.findMany({
    select: { transaction_id: true },
    where: {
      transaction_id: {
        in: allTransactions.map((t) => t.transaction_id),
      },
    },
  });

  const existingIdSet = new Set(existingIds.map((t) => t.transaction_id));

  // STEP 2: Separate into creates vs updates
  const toCreate = allTransactions.filter(
    (t) => !existingIdSet.has(t.transaction_id)
  );
  const toUpdate = allTransactions.filter((t) =>
    existingIdSet.has(t.transaction_id)
  );

  console.log(
    `📊 Bulk operation: ${toCreate.length} creates, ${toUpdate.length} updates`
  );

  await db.$transaction(
    async (tx) => {
      // STEP 3: Bulk create new transactions
      if (toCreate.length > 0) {
        await tx.transaction.createMany({
          data: toCreate.map((transaction) => ({
            transaction_id: transaction.transaction_id,
            account_id: transaction.account_id,
            item_id: transaction.item_id,
            date: transaction.date,
            name: transaction.name,
            merchant_name: transaction.merchant_name ?? null,
            amount: transaction.amount,
            iso_currency_code: transaction.iso_currency_code ?? null,
            category_primary: transaction.category_primary ?? null,
            category_secondary: transaction.category_secondary ?? null,
            original_description: transaction.original_description ?? null,
            pending: transaction.pending ?? false,
            status: "active",
            raw: JSON.stringify(transaction.raw),
          })),
        });
      }

      // STEP 4: Bulk update existing transactions (if any)
      for (const transaction of toUpdate) {
        await tx.transaction.update({
          where: { transaction_id: transaction.transaction_id },
          data: {
            account_id: transaction.account_id,
            item_id: transaction.item_id,
            date: transaction.date,
            name: transaction.name,
            merchant_name: transaction.merchant_name ?? null,
            amount: transaction.amount,
            iso_currency_code: transaction.iso_currency_code ?? null,
            category_primary: transaction.category_primary ?? null,
            category_secondary: transaction.category_secondary ?? null,
            original_description: transaction.original_description ?? null,
            pending: transaction.pending ?? false,
            status: "active",
            raw: JSON.stringify(transaction.raw),
            updatedAt: new Date(),
          },
        });
      }
    },
    {
      timeout: 10000, // 10 second timeout should be plenty for bulk operations
    }
  );

  // Count results based on original batch categorization
  const addedCount =
    batch.added.filter((t) =>
      toCreate.find((c) => c.transaction_id === t.transaction_id)
    ).length +
    batch.added.filter((t) =>
      toUpdate.find((u) => u.transaction_id === t.transaction_id)
    ).length;
  const modifiedCount =
    batch.modified.filter((t) =>
      toCreate.find((c) => c.transaction_id === t.transaction_id)
    ).length +
    batch.modified.filter((t) =>
      toUpdate.find((u) => u.transaction_id === t.transaction_id)
    ).length;

  console.log(
    `✅ Bulk processing complete: ${toCreate.length} created, ${toUpdate.length} updated`
  );

  return { addedCount, modifiedCount };
}

/**
 * Mark transactions as removed (soft delete)
 */
export async function applyRemoved(transaction_ids: string[]): Promise<number> {
  if (transaction_ids.length === 0) return 0;

  const result = await db.transaction.updateMany({
    where: {
      transaction_id: { in: transaction_ids },
    },
    data: {
      status: "removed",
      updatedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * List transactions with filtering and pagination
 */
export async function listByPeriod(
  options: TransactionListOptions
): Promise<Transaction[]> {
  const where: any = {};

  if (options.userId) {
    // Join through item to filter by userId
    where.item = { userId: options.userId };
  }
  if (options.item_id) {
    where.item_id = options.item_id;
  }
  if (options.account_id) {
    where.account_id = options.account_id;
  }
  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      where.date.gte = options.startDate;
    }
    if (options.endDate) {
      where.date.lte = options.endDate;
    }
  }
  if (!options.includeRemoved) {
    where.status = "active";
  }

  return await db.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: options.limit,
    skip: options.offset,
  });
}

/**
 * Get transaction counts for an item
 */
export async function getCountsByItem(item_id: string): Promise<{
  total: number;
  active: number;
  removed: number;
}> {
  const [total, active, removed] = await Promise.all([
    db.transaction.count({ where: { item_id } }),
    db.transaction.count({ where: { item_id, status: "active" } }),
    db.transaction.count({ where: { item_id, status: "removed" } }),
  ]);

  return { total, active, removed };
}

/**
 * Get transactions by IDs
 */
export async function getByIds(
  transaction_ids: string[]
): Promise<Transaction[]> {
  return await db.transaction.findMany({
    where: {
      transaction_id: { in: transaction_ids },
    },
  });
}

/**
 * Delete all transactions for an item (hard delete)
 */
export async function deleteByItem(item_id: string): Promise<void> {
  await db.transaction.deleteMany({
    where: { item_id },
  });
}
