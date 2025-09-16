#!/usr/bin/env node
/**
 * scripts/cleanup-db.ts
 * 
 * Soft cleanup of development database:
 * 1. Clears all user data tables while preserving schema
 * 2. Runs VACUUM to reclaim disk space and optimize performance
 * 3. Optionally reseeds demo data for immediate app functionality
 * 
 * Safe alternative to full reset - preserves migrations and schema.
 * DEVELOPMENT ONLY - Will not run in production
 */

import { PrismaClient } from '../lib/generated/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

const DB_PATH = path.resolve(__dirname, '../prisma/dev.db');

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(0)} ${sizes[i]}`;
}

async function main() {
  console.log('🧹 DATABASE CLEANUP - Daily Dough Development');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();

  // Safety check: only allow in development
  if (process.env.NODE_ENV !== 'development') {
    console.error('❌ ERROR: This script can only run in development mode');
    console.error('   Set NODE_ENV=development to continue');
    process.exit(1);
  }

  // Check for --seed flag
  const shouldSeed = process.argv.includes('--seed');

  let prisma: PrismaClient | null = null;

  try {
    // Step 0: Get initial file size
    const beforeStats = await fs.stat(DB_PATH);
    const beforeSize = beforeStats.size;
    console.log(`📊 Database size before cleanup: ${formatBytes(beforeSize)}`);

    // Step 1: Connect to database
    console.log('\n🔌 Step 1: Connecting to database...');
    prisma = new PrismaClient({
      log: [], // Disable logging for cleaner output
    });
    await prisma.$connect();
    console.log('   ✅ Connected to database');

    // Step 2: Clear all user data tables (in dependency order)
    console.log('\n🗑️  Step 2: Truncating data tables...');
    
    // Define cleanup operations using proper Prisma models
    const cleanupOperations = [
      { name: 'daily_budget_results', operation: () => prisma!.dailyBudgetResult.deleteMany() },
      { name: 'streak_state', operation: () => prisma!.streakState.deleteMany() },
      { name: 'slush_ledger', operation: () => prisma!.slushLedger.deleteMany() },
      { name: 'ignored_transactions', operation: () => prisma!.ignoredTransaction.deleteMany() },
      { name: 'transactions', operation: () => prisma!.transaction.deleteMany() },
      { name: 'transaction_sync_state', operation: () => prisma!.transactionSyncState.deleteMany() },
      { name: 'accounts', operation: () => prisma!.account.deleteMany() },
      { name: 'items', operation: () => prisma!.item.deleteMany() },
    ];

    let totalDeleted = 0;

    for (const { name, operation } of cleanupOperations) {
      try {
        const result = await operation();
        const deletedCount = result.count;
        console.log(`   ✅ ${name}: ${deletedCount} rows deleted`);
        totalDeleted += deletedCount;
      } catch (error) {
        console.log(`   ⚠️  ${name}: Could not delete (${error instanceof Error ? error.message : 'unknown error'})`);
      }
    }

    console.log(`   📊 Total rows deleted: ${totalDeleted}`);

    // Step 3: Run VACUUM to reclaim disk space
    console.log('\n💨 Step 3: Running VACUUM to reclaim disk space...');
    await prisma.$queryRaw`PRAGMA vacuum`;
    console.log('   ✅ VACUUM completed');

    // Disconnect
    await prisma.$disconnect();
    prisma = null;

    // Step 4: Check file size after cleanup
    const afterStats = await fs.stat(DB_PATH);
    const afterSize = afterStats.size;
    const spaceReclaimed = beforeSize - afterSize;
    
    console.log(`📊 Database size after cleanup: ${formatBytes(afterSize)}`);
    if (spaceReclaimed > 0) {
      console.log(`💾 Space reclaimed: ${formatBytes(spaceReclaimed)}`);
    } else {
      console.log('💾 No additional space reclaimed (database was already compact)');
    }

    // Step 5: Optional reseeding
    if (shouldSeed) {
      console.log('\n🌱 Step 5: Reseeding demo data...');
      execSync('npm run db:seed', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
      });
    }

    // Success summary
    const elapsed = Date.now() - startTime;
    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Database cleanup completed successfully in ${elapsed}ms`);
    
    if (totalDeleted > 0) {
      console.log(`🗑️  Removed ${totalDeleted} records from database`);
    }

    if (shouldSeed) {
      console.log('🌱 Demo data has been reseeded for immediate app functionality');
    } else {
      console.log('\n💡 Tip: Use --seed flag to reseed demo data after cleanup');
      console.log('   Example: npm run db:cleanup -- --seed');
    }

  } catch (error) {
    console.error('\n❌ Error during database cleanup:');
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
    console.error('Fatal error:', error);
    process.exit(1);
  });
}