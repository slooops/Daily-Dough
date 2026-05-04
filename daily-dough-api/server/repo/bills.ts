/**
 * Bills Repository
 * Manages recurring bills that reduce the daily allowance
 */

import { db } from "../db";
import type { Bill } from "../../lib/generated/prisma";

export interface BillInput {
  userId: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
}

/**
 * List all active bills for a user
 */
export async function listByUser(userId: string): Promise<Bill[]> {
  return await db.bill.findMany({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Add a bill
 */
export async function add(bill: BillInput): Promise<Bill> {
  return await db.bill.create({
    data: {
      userId: bill.userId,
      name: bill.name,
      amount: bill.amount,
      amount_strategy: bill.frequency, // using amount_strategy column for frequency
      status: "active",
    },
  });
}

/**
 * Remove a bill
 */
export async function remove(id: string): Promise<void> {
  await db.bill.delete({
    where: { id },
  });
}

/**
 * Get a specific bill
 */
export async function getById(id: string): Promise<Bill | null> {
  return await db.bill.findUnique({
    where: { id },
  });
}
