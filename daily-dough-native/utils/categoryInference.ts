/**
 * Infer a transaction category from merchant name when Plaid category is missing/generic.
 */
export const inferCategoryFromMerchant = (
  merchant: string,
  originalCategory: string,
): string => {
  if (
    originalCategory &&
    originalCategory !== "Other" &&
    originalCategory !== ""
  ) {
    return originalCategory;
  }

  const m = merchant.toLowerCase();

  // Income
  if (
    m.includes("ach electronic credit") ||
    m.includes("gusto pay") ||
    m.includes("payroll") ||
    m.includes("salary") ||
    m.includes("deposit") ||
    m.includes("direct dep") ||
    m.includes("wage")
  )
    return "Income";

  // Financial services
  if (
    m.includes("cd deposit") ||
    m.includes("interest") ||
    m.includes("bank fee") ||
    m.includes("overdraft") ||
    m.includes("atm fee")
  )
    return "Financial";

  // Recreation/Fitness
  if (
    m.includes("climbing") ||
    m.includes("gym") ||
    m.includes("fitness") ||
    m.includes("yoga") ||
    m.includes("crossfit") ||
    m.includes("pilates") ||
    m.includes("sports") ||
    m.includes("tennis") ||
    m.includes("golf") ||
    m.includes("swim") ||
    m.includes("martial arts")
  )
    return "Recreation";

  // Grocery
  if (
    m.includes("grocery") ||
    m.includes("supermarket") ||
    m.includes("safeway") ||
    m.includes("whole foods") ||
    m.includes("trader joe") ||
    m.includes("kroger") ||
    m.includes("wegmans")
  )
    return "Grocery";

  // Restaurants/Food
  if (
    m.includes("restaurant") ||
    m.includes("coffee") ||
    m.includes("starbucks") ||
    m.includes("mcdonald") ||
    m.includes("pizza") ||
    m.includes("food") ||
    m.includes("cafe") ||
    m.includes("diner") ||
    m.includes("bistro")
  )
    return "Food";

  // Transportation
  if (
    m.includes("uber") ||
    m.includes("lyft") ||
    m.includes("taxi") ||
    m.includes("gas") ||
    m.includes("shell") ||
    m.includes("chevron") ||
    m.includes("parking") ||
    m.includes("metro") ||
    m.includes("transit")
  )
    return "Transportation";

  // Travel
  if (
    m.includes("airline") ||
    m.includes("hotel") ||
    m.includes("airbnb") ||
    m.includes("expedia") ||
    m.includes("booking") ||
    m.includes("flight")
  )
    return "Travel";

  // Shopping
  if (
    m.includes("amazon") ||
    m.includes("target") ||
    m.includes("walmart") ||
    m.includes("store") ||
    m.includes("shop") ||
    m.includes("retail")
  )
    return "Shopping";

  // Subscriptions
  if (
    m.includes("netflix") ||
    m.includes("spotify") ||
    m.includes("subscription") ||
    m.includes("monthly") ||
    m.includes("annual")
  )
    return "Subscriptions";

  // Entertainment
  if (
    m.includes("movie") ||
    m.includes("theater") ||
    m.includes("cinema") ||
    m.includes("concert") ||
    m.includes("ticket")
  )
    return "Entertainment";

  // Healthcare
  if (
    m.includes("pharmacy") ||
    m.includes("doctor") ||
    m.includes("medical") ||
    m.includes("clinic") ||
    m.includes("hospital")
  )
    return "Healthcare";

  // Personal Care
  if (
    m.includes("salon") ||
    m.includes("spa") ||
    m.includes("barber") ||
    m.includes("beauty") ||
    m.includes("cosmetic")
  )
    return "Personal Care";

  return "Other";
};
