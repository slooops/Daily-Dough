/**
 * Repository Layer Index
 * Central exports for all repository modules
 */

export * as itemsRepo from "./items";
export * as syncStateRepo from "./syncState";
export * as accountsRepo from "./accounts";
export * as transactionsRepo from "./transactions";
export * as ignoredRepo from "./ignored";
export * as dailyBudgetRepo from "./dailyBudget";
export * as streakRepo from "./streak";
export * as slushLedgerRepo from "./slushLedger";
export * as userProfileRepo from "./userProfile";
export * as billsRepo from "./bills";
export * as periodHistoryRepo from "./periodHistory";

// Re-export the database client for direct access when needed
export { db } from "../db";
