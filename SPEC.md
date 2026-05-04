# Daily Dough — Specifications

## Allowance Engine

The Allowance Engine is the core business logic. It decides how much a user can safely spend each day based on income, fixed expenses, and actual transactions.

### Inputs

- `grossPaycheck` (number) — gross pay per check
- `payCadence` (enum: `weekly` | `biweekly` | `semimonthly` | `monthly`)
- `monthlyRent` (number)
- `bills` (array of `{ name, amount, frequency: "monthly" | "yearly" }`)
- `periodStart`, `periodEnd` (ISO dates)
- `transactions` (from Plaid sync — amount-signed, date-sorted)
- `ignoredTransactions` (rules: by `transaction_id` exact match or `merchant_pattern` substring)

### Step 1 — Expectations (Annualized)

```
paychecksPerYear: weekly=52, biweekly=26, semimonthly=24, monthly=12

annualIncomeExpected  = grossPaycheck × paychecksPerYear(cadence)
annualRentExpected    = monthlyRent × 12
annualBillsExpected   = Σ(bill.amount × (monthly ? 12 : 1))
dailyIncomeExpected   = annualIncomeExpected / 365
dailyFixedExpected    = (annualRentExpected + annualBillsExpected) / 365
baseDailyAllowance    = dailyIncomeExpected − dailyFixedExpected
```

### Step 2 — Seed Each Pay Period

```
daysInPeriod        = (periodEnd − periodStart) + 1
expectedPeriodBudget = baseDailyAllowance × daysInPeriod
slushBalance        = carryOverFromPreviousPeriod + expectedPeriodBudget
baseGrantPerDay     = expectedPeriodBudget / daysInPeriod
carryover           = 0
```

### Step 3 — Daily Computation (walk each day chronologically)

```
allowanceToday = baseGrantPerDay + carryover       (unclamped — can go negative)

Filter out ignored transactions (by transaction_id set OR merchant_pattern substring)

spendToday   = Σ(amount) for positive txns          (Plaid: positive = expense)
creditsToday = |Σ(amount)| for negative txns         (Plaid: negative = income/credit)

slushBalance = slushBalance − spendToday + creditsToday

withinBudget = (spendToday ≤ allowanceToday)
noSpendDay   = (spendToday == 0)

carryover    = allowanceToday − spendToday           (feeds into next day)
```

### Step 4 — Streak Tracking

- **Current streak**: consecutive `withinBudget` days ending at today
- **Longest streak**: max consecutive `withinBudget` days in current period

### Step 5 — End of Period

```
User chooses carryOverToNext where 0 ≤ carryOverToNext ≤ slushBalance
sentToBank = slushBalance − carryOverToNext

Next period starts with:
  slushBalance = carryOverToNext + nextExpectedPeriodBudget
  carryover    = 0
```

### Key Rules

- Refunds (negative amounts in Plaid / credits) **increase** slush
- Ignored transactions are excluded from **all** math and streaks
- Overspend drives carryover negative → shrinks future daily grants
- Underspend grows carryover → increases future daily grants
- Negative slush **may** carry into the next period (not clamped)

### Implementation Files

| File                                     | Purpose                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `server/services/allowanceEngine.ts`     | Pure functions: `computeExpectations`, `seedPeriod`, `computePeriod`, `computeStreak` |
| `server/services/computePeriodToDate.ts` | Orchestrator: fetches data from repos → runs engine → persists results                |

---

## UI ↔ Engine Variable Mapping

| Component                   | Engine Variable                                       | Notes                                               |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| **DailyDial** center amount | `allowanceToday − spendToday`                         | Can go negative; shows "over" state                 |
| **DailyDial** ring progress | `spendToday / allowanceToday`                         | 0–1 clamped for ring fill                           |
| **DailyDial** ring color    | State-based                                           | Teal (normal), Amber (≤20% left), Red (over budget) |
| **SlushPill**               | `slushBalance`                                        | Green tint positive, red tint negative              |
| **StreakBadge** blue        | `streak.current`                                      | Consecutive within-budget days                      |
| **StreakBadge** orange      | `streak.longest`                                      | Best streak this period                             |
| **Progress bar**            | `periodBudget − remainingThisPeriod` / `periodBudget` | Period spending progress                            |

---

## Transaction Amount Conventions

Plaid uses a specific sign convention that we preserve throughout:

| Plaid Amount | Meaning              | UI Color | Effect on Slush |
| ------------ | -------------------- | -------- | --------------- |
| Positive     | Expense (money out)  | Red      | Decreases       |
| Negative     | Income/credit/refund | Green    | Increases       |

**Critical**: Never use `Math.abs()` on transaction amounts for display or computation. Signs carry meaning.

---

## Ignored Transaction Rules

Ignored transactions are removed from all engine math. Two rule types:

1. **By transaction_id** — exact match, ignores one specific transaction
2. **By merchant_pattern** — substring match against `merchant_name`, ignores all matching

Default rules to seed for demo:

- Payroll deposits (prevents income from being counted as "credit")
- Internal transfers between accounts
- Modeled fixed bills (rent, recurring bills already accounted for in expectations)

**Double-counting warning**: If a bill is in the `bills` table (modeled in expectations), AND its transaction appears in actual spend, the engine would count it twice. The transaction must be ignored.

---

## Liquid Glass Design System

### Design Tokens (`styles/theme.ts`)

```
glass.background      = rgba(255, 255, 255, 0.60)     // Primary translucent surface
glass.blur            = 24                              // BlurView intensity
glass.borderColor     = rgba(255, 255, 255, 0.35)      // Subtle glass border
glass.borderWidth     = 0.5
glass.radius          = 22                              // Standard corner radius
glass.radiusSmall     = 14                              // Buttons, inputs
glass.radiusPill      = 999                             // Pills, badges
```

### Gradient Presets

```
gradients.teal   = [#0EA5E9, #06B6D4]    // Normal state (DailyDial)
gradients.green  = [#10B981, #34D399]     // Success / within budget
gradients.amber  = [#F59E0B, #FBBF24]    // Warning / low budget
gradients.red    = [#EF4444, #F87171]     // Over budget / danger
```

### Glass Components

| Component     | File                            | Purpose                                                      |
| ------------- | ------------------------------- | ------------------------------------------------------------ |
| `GlassCard`   | `components/ui/GlassCard.tsx`   | BlurView card with intensity variants (light/medium/heavy)   |
| `GlassButton` | `components/ui/GlassButton.tsx` | Pressable with haptics (primary/secondary/ghost)             |
| `GlassPill`   | `components/ui/GlassPill.tsx`   | Tinted pill for badges/labels (neutral/green/red/amber/blue) |

### Color Palette

```
Accent:       #0EA5E9 (sky blue)
Success:      #10B981 (emerald)
Warning:      #F59E0B (amber)
Danger:       #EF4444 (red)
Text:         #1E293B (slate 800)
TextSecondary: #64748B (slate 500)
TextMuted:    #94A3B8 (slate 400)
```

---

## In-App Purchase Model

| Tier     | Access                                               | Price    |
| -------- | ---------------------------------------------------- | -------- |
| **Free** | Onboarding, demo data, see what the app does         | $0       |
| **Paid** | Connect real bank (Plaid), full engine, all features | $0.99/mo |

**Economics**: Plaid ~$0.30/user/mo + Apple 30% cut ($0.30) = $0.60 cost → $0.39 profit/user.

**Product ID**: `com.slooops.dailydough.monthly`  
**Library**: `react-native-iap` with StoreKit 2  
**Gate point**: Before Plaid Link — check subscription, show paywall if inactive.

---

_Last Updated: May 3, 2026_
