-- CreateTable
CREATE TABLE "period_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "totalBudget" REAL NOT NULL,
    "totalSpend" REAL NOT NULL,
    "totalCredits" REAL NOT NULL,
    "slushEnd" REAL NOT NULL,
    "sentToBank" REAL NOT NULL,
    "carryOver" REAL NOT NULL,
    "streakLongest" INTEGER NOT NULL,
    "daysWithinBudget" INTEGER NOT NULL,
    "daysTotal" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "period_history_userId_periodStart_idx" ON "period_history"("userId", "periodStart");
