import { logger } from "../utils/logger";

const API_BASE_URL = "http://localhost:3000/api";

export interface IgnoreRule {
  id: string;
  userId: string;
  transaction_id: string | null;
  merchant_pattern: string | null;
  createdAt: string;
}

export async function fetchIgnoreRules(userId: string): Promise<IgnoreRule[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ignored-rules?userId=${encodeURIComponent(userId)}`,
    );
    const data = await response.json();
    if (data.success) return data.rules;
    logger.error("fetchIgnoreRules failed", data.error, {
      component: "ignoredService",
    });
    return [];
  } catch (error) {
    logger.error("fetchIgnoreRules network error", error, {
      component: "ignoredService",
    });
    return [];
  }
}

export async function addIgnoreRule(
  userId: string,
  rule: { transaction_id?: string; merchant_pattern?: string },
): Promise<IgnoreRule | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/ignored-rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...rule }),
    });
    const data = await response.json();
    if (data.success) return data.rule;
    logger.error("addIgnoreRule failed", data.error, {
      component: "ignoredService",
    });
    return null;
  } catch (error) {
    logger.error("addIgnoreRule network error", error, {
      component: "ignoredService",
    });
    return null;
  }
}

export async function deleteIgnoreRule(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/ignored-rules`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    logger.error("deleteIgnoreRule network error", error, {
      component: "ignoredService",
    });
    return false;
  }
}
