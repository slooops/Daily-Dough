/**
 * Map Plaid personal_finance_category primary values to display names.
 * Falls back to merchant-name heuristics when category is missing.
 */

const PLAID_CATEGORY_MAP: Record<string, string> = {
  INCOME: "Income",
  TRANSFER_IN: "Income",
  TRANSFER_OUT: "Transfer",
  LOAN_PAYMENTS: "Bills",
  BANK_FEES: "Financial",
  ENTERTAINMENT: "Entertainment",
  FOOD_AND_DRINK: "Food",
  GENERAL_MERCHANDISE: "Shopping",
  HOME_IMPROVEMENT: "Shopping",
  MEDICAL: "Healthcare",
  PERSONAL_CARE: "Personal Care",
  GENERAL_SERVICES: "Services",
  GOVERNMENT_AND_NON_PROFIT: "Services",
  TRANSPORTATION: "Transportation",
  TRAVEL: "Travel",
  RENT_AND_UTILITIES: "Bills",
  RECREATION: "Recreation",
};

export const inferCategoryFromMerchant = (
  merchant: string,
  originalCategory: string,
): string => {
  // If we have a Plaid personal_finance_category, map it to a display name
  if (originalCategory && typeof originalCategory === "string") {
    const mapped = PLAID_CATEGORY_MAP[originalCategory];
    if (mapped) return mapped;

    // If it's already a nice display name (not uppercase/underscore), pass through
    if (
      originalCategory !== "Other" &&
      originalCategory !== "" &&
      !originalCategory.includes("_")
    ) {
      return originalCategory;
    }
  }

  // Fall back to merchant-name heuristics
  const m = merchant.toLowerCase();

  if (
    m.includes("payroll") ||
    m.includes("salary") ||
    m.includes("deposit") ||
    m.includes("direct dep") ||
    m.includes("gusto pay")
  )
    return "Income";

  if (m.includes("interest") || m.includes("bank fee") || m.includes("atm fee"))
    return "Financial";

  if (
    m.includes("climbing") ||
    m.includes("gym") ||
    m.includes("fitness") ||
    m.includes("yoga") ||
    m.includes("crossfit")
  )
    return "Recreation";

  if (
    m.includes("grocery") ||
    m.includes("whole foods") ||
    m.includes("trader joe") ||
    m.includes("kroger") ||
    m.includes("safeway")
  )
    return "Grocery";

  if (
    m.includes("restaurant") ||
    m.includes("coffee") ||
    m.includes("starbucks") ||
    m.includes("mcdonald") ||
    m.includes("pizza") ||
    m.includes("cafe") ||
    m.includes("food")
  )
    return "Food";

  if (
    m.includes("uber") ||
    m.includes("lyft") ||
    m.includes("taxi") ||
    m.includes("gas") ||
    m.includes("shell") ||
    m.includes("chevron") ||
    m.includes("parking")
  )
    return "Transportation";

  if (
    m.includes("airline") ||
    m.includes("hotel") ||
    m.includes("airbnb") ||
    m.includes("flight")
  )
    return "Travel";

  if (
    m.includes("amazon") ||
    m.includes("target") ||
    m.includes("walmart") ||
    m.includes("store") ||
    m.includes("shop")
  )
    return "Shopping";

  if (m.includes("netflix") || m.includes("spotify") || m.includes("subscription"))
    return "Subscriptions";

  if (m.includes("pharmacy") || m.includes("doctor") || m.includes("medical"))
    return "Healthcare";

  return "Other";
};
