/**
 * Transaction Sync State Repository
 * Manages Plaid sync cursors and timestamps
 */

import { db } from "../db";
import type { TransactionSyncState } from "../../lib/generated/prisma";

export interface SyncStateInput {
  item_id: string;
  cursor?: string;
  lastSyncedAt?: Date;
}

/**
 * Get sync state for an item
 */
export async function get(
  item_id: string
): Promise<TransactionSyncState | null> {
  return await db.transactionSyncState.findUnique({
    where: { item_id },
  });
}

/**
 * Save/update sync state for an item
 */
export async function save(
  input: SyncStateInput
): Promise<TransactionSyncState> {
  return await db.transactionSyncState.upsert({
    where: { item_id: input.item_id },
    update: {
      cursor: input.cursor ?? undefined,
      lastSyncedAt: input.lastSyncedAt ?? new Date(),
    },
    create: {
      item_id: input.item_id,
      cursor: input.cursor ?? null,
      lastSyncedAt: input.lastSyncedAt ?? new Date(),
    },
  });
}

/**
 * Delete sync state for an item
 */
export async function deleteSyncState(item_id: string): Promise<void> {
  await db.transactionSyncState.delete({
    where: { item_id },
  });
}
