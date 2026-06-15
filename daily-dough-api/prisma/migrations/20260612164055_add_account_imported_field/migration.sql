-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "account_id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "mask" TEXT,
    "balances" TEXT NOT NULL,
    "imported" BOOLEAN NOT NULL DEFAULT true,
    "raw" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("account_id", "balances", "item_id", "mask", "name", "raw", "subtype", "type", "updatedAt") SELECT "account_id", "balances", "item_id", "mask", "name", "raw", "subtype", "type", "updatedAt" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
