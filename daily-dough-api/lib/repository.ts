/**
 * In-memory repository layer for Daily Dough
 * This is a temporary implementation that will be replaced with a real database
 */

import { PlaidItem, Account, Transaction, SyncState } from "./types";

// In-memory storage
const items = new Map<string, PlaidItem>();
const accounts = new Map<string, Account>();
const transactions = new Map<string, Transaction>();
const syncStates = new Map<string, SyncState>();

// Helper function to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Item Repository Functions
 */
export async function saveItem(
  item: Omit<PlaidItem, "id" | "createdAt" | "updatedAt">
): Promise<PlaidItem> {
  const newItem: PlaidItem = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  items.set(newItem.id, newItem);
  console.log(`💾 Saved item: ${newItem.id} for user: ${newItem.userId}`);
  return newItem;
}

export async function getItemByUser(userId: string): Promise<PlaidItem | null> {
  for (const item of items.values()) {
    if (item.userId === userId) {
      console.log(`🔍 Found item: ${item.id} for user: ${userId}`);
      return item;
    }
  }
  console.log(`❌ No item found for user: ${userId}`);
  return null;
}

export async function getAllItems(): Promise<PlaidItem[]> {
  return Array.from(items.values());
}

/**
 * Account Repository Functions
 */
export async function saveAccounts(
  accountList: Omit<Account, "id" | "createdAt" | "updatedAt">[]
): Promise<Account[]> {
  const savedAccounts: Account[] = [];

  for (const accountData of accountList) {
    // Check if account already exists by plaidAccountId
    let existingAccount: Account | undefined;
    for (const account of accounts.values()) {
      if (account.plaidAccountId === accountData.plaidAccountId) {
        existingAccount = account;
        break;
      }
    }

    if (existingAccount) {
      // Update existing account
      const updatedAccount: Account = {
        ...existingAccount,
        ...accountData,
        updatedAt: new Date(),
      };
      accounts.set(updatedAccount.id, updatedAccount);
      savedAccounts.push(updatedAccount);
      console.log(
        `🔄 Updated account: ${updatedAccount.id} (${updatedAccount.name})`
      );
    } else {
      // Create new account
      const newAccount: Account = {
        ...accountData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      accounts.set(newAccount.id, newAccount);
      savedAccounts.push(newAccount);
      console.log(
        `💾 Saved new account: ${newAccount.id} (${newAccount.name})`
      );
    }
  }

  return savedAccounts;
}

export async function getAccounts(itemId?: string): Promise<Account[]> {
  if (itemId) {
    const filteredAccounts = Array.from(accounts.values()).filter(
      (account) => account.itemId === itemId
    );
    console.log(
      `🔍 Found ${filteredAccounts.length} accounts for item: ${itemId}`
    );
    return filteredAccounts;
  }

  const allAccounts = Array.from(accounts.values());
  console.log(`🔍 Found ${allAccounts.length} total accounts`);
  return allAccounts;
}

/**
 * Transaction Repository Functions
 */
export async function upsertTransactions(
  transactionList: Omit<Transaction, "id" | "createdAt" | "updatedAt">[]
): Promise<Transaction[]> {
  const savedTransactions: Transaction[] = [];

  for (const transactionData of transactionList) {
    // Check if transaction already exists by plaidTransactionId
    let existingTransaction: Transaction | undefined;
    for (const transaction of transactions.values()) {
      if (
        transaction.plaidTransactionId === transactionData.plaidTransactionId
      ) {
        existingTransaction = transaction;
        break;
      }
    }

    if (existingTransaction) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...transactionData,
        updatedAt: new Date(),
      };
      transactions.set(updatedTransaction.id, updatedTransaction);
      savedTransactions.push(updatedTransaction);
      console.log(
        `🔄 Updated transaction: ${updatedTransaction.id} (${updatedTransaction.merchant})`
      );
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        ...transactionData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      transactions.set(newTransaction.id, newTransaction);
      savedTransactions.push(newTransaction);
      console.log(
        `💾 Saved new transaction: ${newTransaction.id} (${newTransaction.merchant})`
      );
    }
  }

  console.log(`💾 Upserted ${savedTransactions.length} transactions`);
  return savedTransactions;
}

export async function getTransactions(
  accountId?: string,
  limit?: number
): Promise<Transaction[]> {
  let filteredTransactions = Array.from(transactions.values());

  if (accountId) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.accountId === accountId
    );
  }

  // Sort by date (most recent first)
  filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }

  console.log(
    `🔍 Found ${filteredTransactions.length} transactions${
      accountId ? ` for account: ${accountId}` : ""
    }`
  );
  return filteredTransactions;
}

export async function getTransactionsSince(
  sinceDate: string,
  itemId?: string,
  limit?: number
): Promise<Transaction[]> {
  let filteredTransactions = Array.from(transactions.values());

  // Filter by item if provided
  if (itemId) {
    // First get accounts for this item
    const itemAccounts = await getAccounts(itemId);
    const accountIds = new Set(itemAccounts.map((acc) => acc.id));

    filteredTransactions = filteredTransactions.filter((transaction) =>
      accountIds.has(transaction.accountId)
    );
  }

  // Filter by date (transactions on or after the since date)
  filteredTransactions = filteredTransactions.filter(
    (transaction) => transaction.date >= sinceDate
  );

  // Sort by date (most recent first)
  filteredTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }

  console.log(
    `🔍 Found ${filteredTransactions.length} transactions since ${sinceDate}${
      itemId ? ` for item: ${itemId}` : ""
    }`
  );
  return filteredTransactions;
}

export async function removeTransactions(
  plaidTransactionIds: string[]
): Promise<number> {
  let removedCount = 0;

  for (const plaidTransactionId of plaidTransactionIds) {
    for (const [id, transaction] of transactions.entries()) {
      if (transaction.plaidTransactionId === plaidTransactionId) {
        transactions.delete(id);
        removedCount++;
        console.log(`🗑️ Removed transaction: ${id} (${transaction.merchant})`);
        break;
      }
    }
  }

  console.log(`🗑️ Removed ${removedCount} transactions`);
  return removedCount;
}

/**
 * Sync State Repository Functions
 */
export async function saveSyncState(
  syncState: Omit<SyncState, "lastSyncAt"> & { lastSyncAt?: Date }
): Promise<SyncState> {
  const key = `${syncState.userId}-${syncState.itemId}`;

  const newSyncState: SyncState = {
    ...syncState,
    lastSyncAt: syncState.lastSyncAt || new Date(),
  };

  syncStates.set(key, newSyncState);
  console.log(
    `💾 Saved sync state for user: ${syncState.userId}, item: ${syncState.itemId}, status: ${syncState.status}`
  );
  return newSyncState;
}

export async function getSyncState(
  userId: string,
  itemId: string
): Promise<SyncState | null> {
  const key = `${userId}-${itemId}`;
  const syncState = syncStates.get(key);

  if (syncState) {
    console.log(
      `🔍 Found sync state for user: ${userId}, item: ${itemId}, status: ${syncState.status}`
    );
    return syncState;
  }

  console.log(`❌ No sync state found for user: ${userId}, item: ${itemId}`);
  return null;
}

export async function getSyncStateByItemId(
  itemId: string
): Promise<SyncState | null> {
  for (const syncState of syncStates.values()) {
    if (syncState.itemId === itemId) {
      console.log(
        `🔍 Found sync state for item: ${itemId}, user: ${syncState.userId}, status: ${syncState.status}`
      );
      return syncState;
    }
  }

  console.log(`❌ No sync state found for item: ${itemId}`);
  return null;
}

export async function getItemById(itemId: string): Promise<PlaidItem | null> {
  const item = items.get(itemId);

  if (item) {
    console.log(`🔍 Found item: ${itemId} for user: ${item.userId}`);
    return item;
  }

  console.log(`❌ No item found with id: ${itemId}`);
  return null;
}

/**
 * Utility functions for debugging and testing
 */
export async function clearAllData(): Promise<void> {
  items.clear();
  accounts.clear();
  transactions.clear();
  syncStates.clear();
  console.log("🗑️ Cleared all in-memory data");
}

export async function getDataSummary(): Promise<{
  items: number;
  accounts: number;
  transactions: number;
  syncStates: number;
}> {
  const summary = {
    items: items.size,
    accounts: accounts.size,
    transactions: transactions.size,
    syncStates: syncStates.size,
  };

  console.log("📊 Data Summary:", summary);
  return summary;
}
