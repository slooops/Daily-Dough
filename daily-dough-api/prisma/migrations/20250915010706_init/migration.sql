-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "access_token_enc" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "transaction_sync_state" (
    "item_id" TEXT NOT NULL PRIMARY KEY,
    "cursor" TEXT,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transaction_sync_state_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "mask" TEXT,
    "balances" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "merchant_name" TEXT,
    "amount" REAL NOT NULL,
    "iso_currency_code" TEXT,
    "category_primary" TEXT,
    "category_secondary" TEXT,
    "original_description" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "raw" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts" ("account_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ignored_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "transaction_id" TEXT,
    "merchant_pattern" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL,
    "amount_strategy" TEXT,
    "expected_day" INTEGER,
    "rrule" TEXT,
    "account_id" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "target_amount" REAL NOT NULL,
    "allocated_percent" INTEGER NOT NULL DEFAULT 0,
    "current_amount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "daily_budget_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "allowance" REAL NOT NULL,
    "spend_actual" REAL NOT NULL,
    "credits_actual" REAL NOT NULL,
    "remaining" REAL NOT NULL,
    "within_budget" BOOLEAN NOT NULL,
    "reason_exclusions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "streak_state" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_within_budget_date" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "slush_ledger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "start_balance" REAL NOT NULL,
    "daily_surplus" REAL NOT NULL,
    "slush_end_balance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "items_item_id_key" ON "items"("item_id");

-- CreateIndex
CREATE INDEX "transactions_item_id_date_idx" ON "transactions"("item_id", "date");

-- CreateIndex
CREATE INDEX "transactions_account_id_date_idx" ON "transactions"("account_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ignored_transactions_userId_transaction_id_key" ON "ignored_transactions"("userId", "transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_budget_results_userId_date_key" ON "daily_budget_results"("userId", "date");

-- CreateIndex
CREATE INDEX "slush_ledger_userId_date_idx" ON "slush_ledger"("userId", "date");
