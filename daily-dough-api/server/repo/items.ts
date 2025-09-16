/**
 * Items Repository
 * Handles Plaid item storage and retrieval with encrypted access tokens
 */

import { db } from "../db";
import type { Item } from "../../lib/generated/prisma";

export interface ItemInput {
  userId: string;
  item_id: string;
  access_token_enc: string;
  institution_id: string;
}

export interface ItemWithRelations extends Item {
  accounts?: any[];
  transactions?: any[];
}

/**
 * Upsert a Plaid item (create or update if exists)
 */
export async function upsertItem(input: ItemInput): Promise<Item> {
  return await db.item.upsert({
    where: { item_id: input.item_id },
    update: {
      access_token_enc: input.access_token_enc,
      institution_id: input.institution_id,
      updatedAt: new Date(),
    },
    create: {
      userId: input.userId,
      item_id: input.item_id,
      access_token_enc: input.access_token_enc,
      institution_id: input.institution_id,
    },
  });
}

/**
 * Get item by user ID (assumes one item per user for now)
 */
export async function getByUser(userId: string): Promise<Item | null> {
  return await db.item.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Get most recent if multiple
  });
}

/**
 * Get item by Plaid item_id
 */
export async function getByItemId(item_id: string): Promise<Item | null> {
  return await db.item.findUnique({
    where: { item_id },
  });
}

/**
 * Get all items (for admin/debug purposes)
 */
export async function getAllItems(): Promise<Item[]> {
  return await db.item.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete an item and all related data
 */
export async function deleteItem(item_id: string): Promise<void> {
  await db.item.delete({
    where: { item_id },
  });
}
