/**
 * Accounts Repository
 * Manages Plaid account data storage and retrieval
 */

import { db } from "../db";
import type { Account } from "../../lib/generated/prisma";

export interface AccountInput {
  account_id: string;
  item_id: string;
  name: string;
  type: string;
  subtype?: string;
  mask?: string;
  balances: object;
  raw: object;
  imported?: boolean;
}

/**
 * Upsert multiple accounts for an item
 */
export async function upsertMany(
  item_id: string,
  accounts: AccountInput[]
): Promise<Account[]> {
  const results: Account[] = [];

  for (const account of accounts) {
    const result = await db.account.upsert({
      where: { account_id: account.account_id },
      update: {
        name: account.name,
        type: account.type,
        subtype: account.subtype ?? null,
        mask: account.mask ?? null,
        balances: JSON.stringify(account.balances),
        raw: JSON.stringify(account.raw),
        updatedAt: new Date(),
      },
      create: {
        account_id: account.account_id,
        item_id: account.item_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype ?? null,
        mask: account.mask ?? null,
        balances: JSON.stringify(account.balances),
        raw: JSON.stringify(account.raw),
        imported: account.imported ?? true,
      },
    });
    results.push(result);
  }

  return results;
}

/**
 * List all accounts for an item
 */
export async function listByItem(item_id: string): Promise<Account[]> {
  return await db.account.findMany({
    where: { item_id },
    orderBy: { account_id: "asc" },
  });
}

/**
 * Get a single account by ID
 */
export async function getById(account_id: string): Promise<Account | null> {
  return await db.account.findUnique({
    where: { account_id },
  });
}

/**
 * Update the imported flag for a single account
 */
export async function updateImported(
  account_id: string,
  imported: boolean
): Promise<Account> {
  return await db.account.update({
    where: { account_id },
    data: { imported },
  });
}

/**
 * List only imported accounts for an item
 */
export async function listImportedByItem(item_id: string): Promise<Account[]> {
  return await db.account.findMany({
    where: { item_id, imported: true },
    orderBy: { account_id: "asc" },
  });
}

/**
 * Delete a single account and its transactions (cascade handles transactions)
 */
export async function deleteOne(account_id: string): Promise<void> {
  await db.account.delete({
    where: { account_id },
  });
}

/**
 * Delete all accounts for an item
 */
export async function deleteByItem(item_id: string): Promise<void> {
  await db.account.deleteMany({
    where: { item_id },
  });
}
