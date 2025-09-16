/**
 * Database client singleton for Daily Dough
 * Ensures a single Prisma client instance across the application
 */

import { PrismaClient } from "../lib/generated/prisma";

declare global {
  // Allow global variable for dev hot reloading
  var __prisma: PrismaClient | undefined;
}

export const db =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"] // Reduced logging: removed "query" to reduce noise
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
