#!/usr/bin/env node
/**
 * scripts/seed-demo.ts
 *
 * Seeds the development database with minimal demo data:
 * 1. Creates a demo user (stub)
 * 2. Creates a demo Plaid item with placeholder encrypted token
 * 3. Creates sample accounts and transactions for immediate app functionality
 * 4. Optionally creates real sandbox item with --sandbox flag
 *
 * DEVELOPMENT ONLY - Will not run in production
 */

import { PrismaClient } from "../lib/generated/prisma";
import { encrypt } from "../lib/crypto";

const DEMO_USER_ID = "demo";
const DEMO_ITEM_ID = "item_demo_sandbox_12345";
const DEMO_INSTITUTION_ID = "ins_109508"; // Plaid sandbox institution

// Sample transaction data that matches our enhanced categories
const SAMPLE_TRANSACTIONS = [
  {
    transaction_id: "demo_tx_payroll_001",
    account_id: "demo_account_checking",
    name: "ACH Electronic Credit GUSTO PAY 123456",
    merchant_name: null,
    amount: -5850.0, // Negative = credit/income in Plaid
    category_primary: "Payroll",
    category_secondary: null,
    date: new Date("2025-09-15"),
  },
  {
    transaction_id: "demo_tx_climbing_001",
    account_id: "demo_account_checking",
    name: "Touchstone Climbing",
    merchant_name: "Touchstone Climbing",
    amount: 78.5, // Positive = debit/expense
    category_primary: "Recreation",
    category_secondary: "Fitness",
    date: new Date("2025-09-14"),
  },
  {
    transaction_id: "demo_tx_grocery_001",
    account_id: "demo_account_checking",
    name: "Whole Foods Market",
    merchant_name: "Whole Foods Market",
    amount: 127.43,
    category_primary: "Food and Drink",
    category_secondary: "Groceries",
    date: new Date("2025-09-13"),
  },
  {
    transaction_id: "demo_tx_coffee_001",
    account_id: "demo_account_checking",
    name: "Blue Bottle Coffee",
    merchant_name: "Blue Bottle Coffee",
    amount: 4.75,
    category_primary: "Food and Drink",
    category_secondary: "Coffee Shop",
    date: new Date("2025-09-13"),
  },
  {
    transaction_id: "demo_tx_transport_001",
    account_id: "demo_account_checking",
    name: "Uber Trip",
    merchant_name: "Uber",
    amount: 23.15,
    category_primary: "Transportation",
    category_secondary: "Ride Share",
    date: new Date("2025-09-12"),
  },
];

const SAMPLE_ACCOUNTS = [
  {
    account_id: "demo_account_checking",
    name: "Demo Checking",
    type: "depository",
    subtype: "checking",
    mask: "1234",
    balances: { current: 2450.32, available: 2450.32, currency: "USD" },
  },
  {
    account_id: "demo_account_savings",
    name: "Demo Savings",
    type: "depository",
    subtype: "savings",
    mask: "5678",
    balances: { current: 15750.0, available: 15750.0, currency: "USD" },
  },
];

async function main() {
  console.log("🌱 SEEDING DEMO DATA - Daily Dough Development");
  console.log("=".repeat(60));

  const startTime = Date.now();

  // Safety check: only allow in development
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ERROR: This script can only run in development mode");
    console.error("   Set NODE_ENV=development to continue");
    process.exit(1);
  }

  // Check flags
  const useSandbox = process.argv.includes("--sandbox");

  let prisma: PrismaClient | null = null;

  try {
    // Step 1: Connect to database
    console.log("\n🔌 Step 1: Connecting to database...");
    prisma = new PrismaClient({
      log: [], // Disable logging for cleaner output
    });
    await prisma.$connect();
    console.log("   ✅ Connected to database");

    // Step 2: Create demo item with placeholder token
    console.log("\n🏦 Step 2: Creating demo Plaid item...");

    // Create placeholder encrypted token (not a real token)
    const placeholderToken = "demo_access_token_placeholder_for_development";
    const encryptedToken = encrypt(placeholderToken);

    await prisma.item.upsert({
      where: { item_id: DEMO_ITEM_ID },
      update: {
        updatedAt: new Date(),
      },
      create: {
        userId: DEMO_USER_ID,
        item_id: DEMO_ITEM_ID,
        access_token_enc: encryptedToken,
        institution_id: DEMO_INSTITUTION_ID,
      },
    });

    console.log(`   ✅ Demo item created: ${DEMO_ITEM_ID}`);

    // Step 3: Create demo accounts
    console.log("\n💳 Step 3: Creating demo accounts...");

    for (const account of SAMPLE_ACCOUNTS) {
      await prisma.account.upsert({
        where: { account_id: account.account_id },
        update: {
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: JSON.stringify(account.balances),
          updatedAt: new Date(),
        },
        create: {
          account_id: account.account_id,
          item_id: DEMO_ITEM_ID,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: JSON.stringify(account.balances),
          raw: JSON.stringify(account),
        },
      });
    }

    console.log(`   ✅ Created ${SAMPLE_ACCOUNTS.length} demo accounts`);

    // Step 4: Create demo transactions
    console.log("\n💰 Step 4: Creating demo transactions...");

    for (const transaction of SAMPLE_TRANSACTIONS) {
      await prisma.transaction.upsert({
        where: { transaction_id: transaction.transaction_id },
        update: {
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          amount: transaction.amount,
          category_primary: transaction.category_primary,
          category_secondary: transaction.category_secondary,
          date: transaction.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
          updatedAt: new Date(),
        },
        create: {
          transaction_id: transaction.transaction_id,
          account_id: transaction.account_id,
          item_id: DEMO_ITEM_ID,
          date: transaction.date.toISOString().split("T")[0],
          name: transaction.name,
          merchant_name: transaction.merchant_name,
          amount: transaction.amount,
          iso_currency_code: "USD",
          category_primary: transaction.category_primary,
          category_secondary: transaction.category_secondary,
          original_description: transaction.name,
          pending: false,
          status: "active",
          raw: JSON.stringify(transaction),
        },
      });
    }

    console.log(
      `   ✅ Created ${SAMPLE_TRANSACTIONS.length} demo transactions`
    );

    // Step 5: Create sync state
    console.log("\n🔄 Step 5: Creating sync state...");

    await prisma.transactionSyncState.upsert({
      where: { item_id: DEMO_ITEM_ID },
      update: {
        cursor: "demo_cursor_placeholder",
        lastSyncedAt: new Date(),
      },
      create: {
        item_id: DEMO_ITEM_ID,
        cursor: "demo_cursor_placeholder",
        lastSyncedAt: new Date(),
      },
    });

    console.log("   ✅ Sync state created");

    // Step 6: Optional sandbox integration
    if (useSandbox) {
      console.log("\n🔬 Step 6: Creating real sandbox item...");
      console.log("   ⚠️  Sandbox integration not yet implemented");
      console.log("   💡 Use /api/plaid/sandbox-quicklink endpoint manually");
    }

    // Disconnect
    await prisma.$disconnect();
    prisma = null;

    // Success summary
    const elapsed = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log(`🎉 Demo data seeding completed successfully in ${elapsed}ms`);
    console.log("\n📱 Demo data includes:");
    console.log(`   • ${SAMPLE_ACCOUNTS.length} accounts (checking, savings)`);
    console.log(
      `   • ${SAMPLE_TRANSACTIONS.length} transactions (payroll, climbing, grocery, coffee, uber)`
    );
    console.log(
      "   • Categories: Income, Recreation, Grocery, Food, Transportation"
    );
    console.log("\n💡 The app will now load immediately with realistic data!");

    if (!useSandbox) {
      console.log("\n🔬 Want live sandbox data? Use --sandbox flag or call:");
      console.log(
        "   curl -X POST http://localhost:3000/api/plaid/sandbox-quicklink"
      );
    }
  } catch (error) {
    console.error("\n❌ Error during demo data seeding:");
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
