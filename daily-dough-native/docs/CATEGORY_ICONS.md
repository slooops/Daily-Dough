# Category Icons & Colors Reference

This document shows all available category icons and their corresponding colors used throughout the Daily Dough app.

## Transaction Categories

### 🏠 Housing

- **Icon**: Home
- **Color**: Purple (#7C3AED)
- **Background**: Light Purple (#EDE9FE)
- **Examples**: Rent, Mortgage, Property Tax

### ⚡ Utilities

- **Icon**: Zap
- **Color**: Orange (#EA580C)
- **Background**: Light Orange (#FFEDD5)
- **Examples**: Electricity, Gas, Water, Internet

### 🚗 Transportation

- **Icon**: Car
- **Color**: Sky Blue (#0EA5E9)
- **Background**: Light Blue (#E0F2FE)
- **Examples**: Gas, Car Payment, Public Transit, Uber

### ☕ Food

- **Icon**: Coffee
- **Color**: Amber (#F59E0B)
- **Background**: Light Amber (#FEF3C7)
- **Examples**: Restaurants, Groceries, Coffee, Delivery

### 🛍️ Shopping

- **Icon**: ShoppingBag
- **Color**: Pink (#EC4899)
- **Background**: Light Pink (#FCE7F3)
- **Examples**: Clothing, Electronics, Home Goods

### 📡 Subscriptions

- **Icon**: Wifi
- **Color**: Violet (#8B5CF6)
- **Background**: Light Violet (#EDE9FE)
- **Examples**: Netflix, Spotify, SaaS tools, Magazines

### ❤️ Healthcare

- **Icon**: Heart
- **Color**: Red (#EF4444)
- **Background**: Light Red (#FEE2E2)
- **Examples**: Doctor visits, Pharmacy, Insurance

### 🎓 Education

- **Icon**: GraduationCap
- **Color**: Green (#059669)
- **Background**: Light Green (#D1FAE5)
- **Examples**: Tuition, Books, Courses, Training

### ✈️ Travel

- **Icon**: Plane
- **Color**: Cyan (#0891B2)
- **Background**: Light Cyan (#CFFAFE)
- **Examples**: Flights, Hotels, Vacation expenses

### 🎁 Entertainment

- **Icon**: Gift
- **Color**: Red (#DC2626)
- **Background**: Light Red (#FEE2E2)
- **Examples**: Movies, Games, Events, Hobbies

## Financial Transaction Types

### 💳 Credit Card Payment

- **Icon**: CreditCard
- **Color**: Streak Blue (#1D4ED8)
- **Background**: Light Blue (#DBEAFE)
- **Examples**: Credit card payments, Balance transfers

### 🔄 Internal Transfer

- **Icon**: ArrowRightLeft
- **Color**: Green (#16A34A)
- **Background**: Light Green (#DCFCE7)
- **Examples**: Savings transfers, Account moves

### 📤 Transfer

- **Icon**: ArrowRightLeft
- **Color**: Gray (#6B7280)
- **Background**: Light Gray (#F3F4F6)
- **Examples**: External transfers, Venmo, PayPal

### 🧾 Bills

- **Icon**: Receipt
- **Color**: Streak Orange (#C2410C)
- **Background**: Light Orange (#FFEDD5)
- **Examples**: Flagged bill transactions

### 💰 Other/Default

- **Icon**: DollarSign
- **Color**: Gray (#6B7280)
- **Background**: Light Gray (#F9FAFB)
- **Examples**: Uncategorized transactions

## Usage in Code

```typescript
import {
  getCategoryIcon,
  getCategoryBackgroundColor,
} from "../utils/categoryIcons";

// Get icon and background color for a category
const icon = getCategoryIcon("Food");
const backgroundColor = getCategoryBackgroundColor("Food");

// Use in TransactionTable
const transactionData = {
  icon: getCategoryIcon(transaction.category),
  iconBackgroundColor: getCategoryBackgroundColor(transaction.category),
  // ... other properties
};
```

## Design System Benefits

- **Consistency**: All transaction tables use the same icon and color scheme
- **Scalability**: Easy to add new categories or update existing ones
- **Maintainability**: Single source of truth for category styling
- **Accessibility**: High contrast color combinations for better readability
