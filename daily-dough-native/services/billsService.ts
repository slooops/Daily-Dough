import { logger } from "../utils/logger";

const API_BASE_URL = "http://localhost:3000/api";

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number | null;
  amount_strategy: string | null; // "monthly" | "yearly"
  status: string;
  createdAt: string;
}

export async function fetchBills(userId: string): Promise<Bill[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bills?userId=${encodeURIComponent(userId)}`,
    );
    const data = await response.json();
    if (data.success) return data.bills;
    logger.error("fetchBills failed", data.error, {
      component: "billsService",
    });
    return [];
  } catch (error) {
    logger.error("fetchBills network error", error, {
      component: "billsService",
    });
    return [];
  }
}

export async function addBill(
  userId: string,
  name: string,
  amount: number,
  frequency: "monthly" | "yearly",
): Promise<Bill | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, amount, frequency }),
    });
    const data = await response.json();
    if (data.success) return data.bill;
    logger.error("addBill failed", data.error, { component: "billsService" });
    return null;
  } catch (error) {
    logger.error("addBill network error", error, { component: "billsService" });
    return null;
  }
}

export async function deleteBill(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/bills`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    logger.error("deleteBill network error", error, {
      component: "billsService",
    });
    return false;
  }
}
