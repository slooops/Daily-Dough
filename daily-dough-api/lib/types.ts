/**
 * Type definitions for the Daily Dough data models
 */

export interface PlaidItem {
  id: string;
  userId: string;
  accessToken: string;
  institutionId: string;
  institutionName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  itemId: string;
  plaidAccountId: string;
  name: string;
  type: "depository" | "credit" | "loan" | "investment" | "other";
  subtype: string;
  balance: number;
  isoCurrencyCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  plaidTransactionId: string;
  date: string; // YYYY-MM-DD format
  merchant: string;
  amount: number; // Positive = inflow, Negative = outflow
  category: string;
  subcategory?: string;
  tag: "spend" | "bill" | "ignored" | "refund";
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncState {
  userId: string;
  itemId: string;
  cursor?: string; // For incremental sync
  lastSyncAt: Date;
  transactionCount: number;
  status: "idle" | "syncing" | "error";
  error?: string;
}

// Request/Response types for API endpoints
export interface CreateItemRequest {
  publicToken: string;
  userId: string;
}

export interface SyncTransactionsRequest {
  itemId: string;
  cursor?: string;
}

export interface SyncTransactionsResponse {
  transactions: Transaction[];
  accounts: Account[];
  cursor?: string;
  hasMore: boolean;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  nextCursor?: string;
  total: number;
  cached: boolean;
  lastSyncAt?: string;
}
