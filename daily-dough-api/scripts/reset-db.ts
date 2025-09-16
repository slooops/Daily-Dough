#!/usr/bin/env node
/**
 * scripts/reset-db.ts
 *
 * Hard reset of the development database:
 * 1. Delete the SQLite database file
 * 2. Run prisma migrate dev to recreate schema
 * 3. Seed with demo data
 *
 * DEVELOPMENT ONLY - Will not run in production
 */

import { execSync } from "child_process";
import { createInterface } from "readline";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "prisma/dev.db");

async function main() {
  console.log("🔥 DATABASE HARD RESET - Daily Dough Development");
  console.log("=".repeat(60));

  const startTime = Date.now();

  // Safety check: only allow in development
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ERROR: This script can only run in development mode");
    console.error("   Set NODE_ENV=development to continue");
    process.exit(1);
  }

  // Check if --yes flag is provided to skip confirmation
  const skipConfirmation = process.argv.includes("--yes");

  if (!skipConfirmation) {
    console.log(
      "\n⚠️  WARNING: This will completely destroy your current database!"
    );
    console.log(`   Database file: ${DB_PATH}`);
    console.log("   All data will be permanently lost.\n");

    const answer = await askConfirmation(
      "Are you sure you want to continue? (y/N): "
    );
    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("❌ Reset cancelled by user");
      process.exit(0);
    }
  }

  try {
    // Step 1: Delete existing database file
    console.log("\n🗑️  Step 1: Deleting existing database...");
    try {
      await fs.access(DB_PATH);
      await fs.unlink(DB_PATH);
      console.log(`   ✅ Deleted: ${DB_PATH}`);
    } catch (error) {
      console.log(`   ℹ️  Database file not found (this is okay): ${DB_PATH}`);
    }

    // Step 2: Run prisma migrate dev
    console.log("\n🔧 Step 2: Running database migrations...");
    execSync("npx prisma migrate dev --name reset", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "development" },
    });
    console.log("   ✅ Database schema created");

    // Step 3: Seed demo data
    console.log("\n🌱 Step 3: Seeding demo data...");
    execSync("npm run db:seed", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "development" },
    });
    console.log("   ✅ Demo data seeded");

    // Success summary
    const elapsed = Date.now() - startTime;
    console.log("\n" + "=".repeat(60));
    console.log(`🎉 Database reset completed successfully in ${elapsed}ms`);
    console.log("\n📱 Next steps:");
    console.log("   1. Start the API server: npm run dev");
    console.log("   2. Start the mobile app: npx expo start");
    console.log(
      "   3. Optional: Connect to Plaid sandbox via /api/plaid/sandbox-quicklink"
    );
    console.log(
      "\n💡 Demo data is already loaded, so the app will work immediately!"
    );
  } catch (error) {
    console.error("\n❌ Error during database reset:");
    console.error(error);
    process.exit(1);
  }
}

async function askConfirmation(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
