#!/usr/bin/env node
/**
 * scripts/vacuum-sqlite.ts
 *
 * Optimizes SQLite database performance by:
 * 1. Running VACUUM to defragment and compact the database file
 * 2. Analyzing table statistics to optimize query planning
 * 3. Reporting file size before/after optimization
 *
 * Safe to run frequently on development databases.
 * DEVELOPMENT ONLY - Will not run in production
 */

import { PrismaClient } from "../lib/generated/prisma";
import * as fs from "fs";
import * as path from "path";

const DATABASE_PATH = path.resolve(__dirname, "../prisma/dev.db");

function formatBytes(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.warn(`⚠️  Could not read file size for ${filePath}`);
    return 0;
  }
}

async function main() {
  console.log("🧹 VACUUM SQLITE - Daily Dough Database Optimization");
  console.log("=".repeat(60));

  const startTime = Date.now();

  // Safety check: only allow in development
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ERROR: This script can only run in development mode");
    console.error("   Set NODE_ENV=development to continue");
    process.exit(1);
  }

  let prisma: PrismaClient | null = null;

  try {
    // Step 1: Check current database size
    console.log("\n📊 Step 1: Analyzing current database...");
    const sizeBefore = getFileSize(DATABASE_PATH);
    console.log(`   📁 Database file: ${DATABASE_PATH}`);
    console.log(`   📏 Current size: ${formatBytes(sizeBefore)}`);

    // Step 2: Connect to database
    console.log("\n🔌 Step 2: Connecting to database...");
    prisma = new PrismaClient({
      log: [], // Disable logging for cleaner output
    });
    await prisma.$connect();
    console.log("   ✅ Connected to database");

    // Step 3: Run VACUUM to defragment and compact
    console.log("\n🗜️  Step 3: Running VACUUM (defragmenting database)...");
    await prisma.$executeRawUnsafe("VACUUM;");
    console.log("   ✅ VACUUM completed");

    // Step 4: Analyze table statistics for query optimization
    console.log("\n📈 Step 4: Updating table statistics (ANALYZE)...");
    await prisma.$executeRawUnsafe("ANALYZE;");
    console.log("   ✅ Table statistics updated");

    // Step 5: Get updated file size
    console.log("\n📊 Step 5: Measuring optimization results...");

    // Disconnect to ensure all changes are written
    await prisma.$disconnect();
    prisma = null;

    const sizeAfter = getFileSize(DATABASE_PATH);
    const sizeDiff = sizeBefore - sizeAfter;
    const percentSaved = sizeBefore > 0 ? (sizeDiff / sizeBefore) * 100 : 0;

    console.log(`   📏 Size after: ${formatBytes(sizeAfter)}`);

    if (sizeDiff > 0) {
      console.log(
        `   💾 Space saved: ${formatBytes(sizeDiff)} (${percentSaved.toFixed(
          1
        )}%)`
      );
    } else if (sizeDiff < 0) {
      console.log(
        `   📈 Size increased: ${formatBytes(
          Math.abs(sizeDiff)
        )} (normal for some operations)`
      );
    } else {
      console.log("   📊 Size unchanged (database was already optimized)");
    }

    // Step 6: Additional database info
    console.log("\n🔍 Step 6: Getting database info...");

    // Reconnect for final stats
    prisma = new PrismaClient({ log: [] });
    await prisma.$connect();

    // Get table row counts
    const [itemCount, accountCount, transactionCount, syncStateCount] =
      await Promise.all([
        prisma.item.count(),
        prisma.account.count(),
        prisma.transaction.count(),
        prisma.transactionSyncState.count(),
      ]);

    console.log(`   📦 Items: ${itemCount}`);
    console.log(`   💳 Accounts: ${accountCount}`);
    console.log(`   💰 Transactions: ${transactionCount}`);
    console.log(`   🔄 Sync states: ${syncStateCount}`);

    // Success summary
    const elapsed = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log(`🎉 Database optimization completed in ${elapsed}ms`);

    if (sizeDiff > 0) {
      console.log(`💾 Reclaimed ${formatBytes(sizeDiff)} of disk space`);
    }

    console.log("\n💡 Benefits of VACUUM + ANALYZE:");
    console.log("   • Reduced file size and fragmentation");
    console.log("   • Improved query performance");
    console.log("   • Updated query planner statistics");
    console.log("   • Better cache locality");

    console.log("\n⏰ Recommended frequency:");
    console.log("   • Daily: After large transaction imports");
    console.log("   • Weekly: During regular development");
    console.log("   • As needed: When database feels slow");
  } catch (error) {
    console.error("\n❌ Error during database optimization:");
    console.error(error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
