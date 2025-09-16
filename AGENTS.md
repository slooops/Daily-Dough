# Daily Dough AI Agent Context

## Project Overview

Daily Dough is a personal finance app that helps users visualize daily spending habits through a unique "Daily Dial" interface. The app tracks expenses, calculates "slush fund" money, and gamifies financial awareness through streak tracking.

**Core Concept**: Instead of traditional monthly budgeting, Daily Dough shows users their daily spending allowance based on their pay period and bills, encouraging mindful daily spending decisions.

## Allowance Engine (Business Logic Context)

All development in Daily Dough is in service of the **Allowance Engine**: the logic that decides how much a user can safely spend each day. The API exists to fetch recent transactions to feed this engine.

### Core Flow

1. **Expectations (annualized)**

   - `annualIncomeExpected = grossPaycheck * paychecksPerYear(cadence)` (biweekly=26, monthly=12)
   - `annualRentExpected = monthlyRent * 12`
   - `annualBillsExpected = sum(bill.amount*12 if monthly; bill.amount if yearly)`
   - `dailyIncomeExpected = annualIncomeExpected / 365`
   - `dailyFixedExpected = (annualRentExpected + annualBillsExpected) / 365`
   - `baseDailyAllowance = dailyIncomeExpected - dailyFixedExpected`

2. **Seed each pay period**

   - `daysInPeriod = (periodEnd - periodStart) + 1`
   - `expectedPeriodBudget = baseDailyAllowance * daysInPeriod`
   - `slushBalance = carryOverFromPreviousPeriod + expectedPeriodBudget`
   - `carryover = 0` (can go positive or negative; stacks underspend or pulls forward overspend)

3. **Daily grant & allowance (carryover accrues; negatives allowed)**

   - `baseGrantPerDay = expectedPeriodBudget / daysInPeriod`
   - `allowanceToday = baseGrantPerDay + carryover` (unclamped; the dial can go negative)

4. **Process actual transactions (non-ignored, signed)**

   - `spendToday = sum(amount)` for negative tx
   - `creditsToday = sum(amount)` for positive tx (refunds/gifts increase slush)
   - `slushBalance = slushBalance - spendToday + creditsToday`

5. **Streak & no-spend**

   - `withinBudgetToday = (spendToday <= allowanceToday)`
   - If `spendToday == 0`, mark as a no-spend day.

6. **End-of-day carryover update**

   - `carryover = allowanceToday - spendToday`
   - (underspend grows carryover; overspend makes it negative, shrinking future daily grants)

7. **End of period**
   - User selects `carryOverToNext` with `0 ≤ carryOverToNext ≤ slushBalance` (negative slush may carry too)
   - `sentToBank = slushBalance - carryOverToNext`
   - Next period starts with `slushBalance = carryOverToNext + nextExpectedPeriodBudget` and `carryover = 0`

**In short:**

```
AT START OF PERIOD:
  carryOverToNext = carryOverPrev
  slushBalance = carryOverPrev + expectedPeriodBudget
  carryOverToNext = 0 (reset it for next end of period)
  carryover = 0

EACH DAY:
  baseGrantPerDay = expectedPeriodBudget / daysInPeriod
  allowanceToday  = baseGrantPerDay + carryover

  spendToday      = sum(negative tx amounts, non-ignored)
  creditsToday    = sum(positive tx amounts, non-ignored)
  slushBalance    = slushBalance - spendToday + creditsToday

  withinBudget    = (spendToday <= allowanceToday)
  noSpendDay      = (spendToday == 0)

  carryover       = allowanceToday - spendToday
  record daily_budget_results + update streak_state

END OF PERIOD:
  choose carryOverToNext (0..slushBalance), set slush for next period, reset carryover=0
```

### Notes

- Refunds (positive tx) increase slush.
- Ignored transactions are removed from all math and streaks (payroll, modeled fixed bills, transfers).
- Overspend reduces slush and drives carryover negative; underspend grows carryover and the future daily grant.

### UI Components ↔ Engine Variables

- **Daily Dial**: `allowanceToday = baseGrantPerDay + carryover` (can be negative; yesterday's underspend stacks into today via carryover)
- **SlushPill** ("Remaining This Period"): Show `slushBalance / expectedPeriodBudget` as "remaining / total" (May exceed 1.0 if saving a lot, or be negative if spending too much)
- **Underspend Saved**: Display `carryover` (can be negative). This is the stacked underspend (or catch-up needed)
- **No-Spend / Within-Budget**:
  - No-Spend Day: `spendToday == 0`
  - Within-Budget Day: `spendToday <= allowanceToday`

## Architecture

### Tech Stack

- **Frontend**: React Native with Expo (TypeScript)
- **Backend**: Next.js 15.5.0 API (TypeScript)
- **Banking Integration**: Plaid SDK v38.0.0
- **Database**: Planned (currently using in-memory/file storage)
- **Deployment**: Local development environment

### Repository Structure

```
/daily-dough-api/          # Next.js backend API
/daily-dough-native/       # React Native mobile app
/Figma Originals/          # Old react from figma make, should be ignored, just was used as a reference point
```

## Key Features & Implementation Status

### ✅ Completed (Phase E)

- **Plaid Integration**: Sandbox Link + public_token exchange + accounts fetch + basic transactions fetch (pre-sync/webhook)
- **Account Management**: Connect/view bank accounts with real balances
- **Transaction Display**: Real transaction data with proper color coding
- **Navigation**: useFocusEffect refresh patterns throughout app
- **Security**: Comprehensive review completed, .gitignore updated

### 🔄 In Progress

- **Transaction Color Logic**: Recently fixed income (green) vs expenses (red) display, and ignored transactions in grey.
- **Daily Dough Logic**: Integrating real transaction data into Daily Dial calculations

### ⏭️ Next Milestones (Phase F & G)

**Phase F — Sandbox reliability & staging**  
15) Handle PRODUCT_NOT_READY gracefully

- **Task**: In `/api/plaid/transactions`, if `transactions/sync` returns no data or indicates initial update pending, respond with `{ transactions: [], status: "initializing" }`.
- **Acceptance**: UI shows “Preparing transactions…” and polls or waits for webhook.

16. Add a refresh endpoint

- **Task**: Create `POST /api/plaid/refresh` that triggers the same server-side sync logic (using saved cursor) and returns `{ synced: true, newCount, nextCursor }`.
- **Acceptance**: Can refresh on demand during local dev while webhooks aren’t live.

**Phase G — Security, storage, and migration**  
17) Encrypt access tokens at rest

- **Task**: Add a small crypto helper to encrypt/decrypt Plaid `access_token` using a server-only key; replace any plaintext writes.
- **Acceptance**: Tokens are never stored or logged in plaintext.

18. Migrate from in-memory to a real DB schema

- **Task**: Create tables/collections for `items`, `accounts`, `transactions`, `transaction_sync_state` with typed repo functions.
- **Acceptance**: API routes swap to DB repo; behavior unchanged.

19. Multi-user support (later)

- **Task**: Introduce `userId` from the auth system; scope all item/transaction operations by `userId`.
- **Acceptance**: Users only see their own items/transactions.

### 📋 Planned Features

- **Ignored Transactions**: Local storage for user preferences
- **Bill Detection**: Smart flagging of recurring transactions
- **Database Integration**: Persistent storage implementation
- **Streak Tracking**: Gamification based on staying under daily spending limits
- **Wishlist**: User can add a link and price, and then assign a percentage of their daily underspend to go to X wishlist item instead of their slush fund. When the item becomes fully funded, it's unlocked and the user is notified.

## Critical Development Patterns

### Agent Behavior Guidelines (for Copilot)

- Be **succinct**: prefer the simplest, most readable solution that’s easy to explain.
- Teach as you go: when proposing backend/API changes, include a brief plain-English explanation of what/why. Act as thought you are teaching a frontend engineer about backend architecture.
- Never delete files yourself. If generated tests/boilerplate are unused, **suggest cleanup** and ask the user to confirm.
- When a UI action is needed to gather logs, output a single **echo** command that clearly states the action to take (e.g., `echo "Click Connect in the app, then return here and press Enter to continue..."`) and pause until the user confirms they’ve done it.
- Prefer **transactions/sync** + cursors over legacy `/transactions/get`.
- Treat tokens as secrets: do not print, log, or expose `access_token` even in sandbox.
- Flag that payroll/bill ignores must be set up carefully in backend logic to prevent inflating/deflating slush twice.

### React Native Best Practices

- Use `useFocusEffect` for screen refresh when navigating back
- Always pass absolute file paths to tools
- Configure Python environment before any Python operations
- Use semantic_search for large workspace exploration

### API Integration

- All Plaid endpoints working in sandbox mode
- Transaction amounts: negative = expenses, positive = income
- Preserve original amount signs for proper color coding
- Use pagination for large transaction datasets
- Prefer `/transactions/sync` with cursors; persist and reuse `next_cursor`.
- Actual transactions (non-ignored) update slush daily:  
  `slushBalance = slushBalance - spend_actual + credits_actual`.

### Code Organization

- Services layer in `/services/` for API integration
- UI components in `/components/ui/` following design system
- Screen components in `/app/` with clear navigation patterns
- Extensible tag-based system for future transaction categorization

## Common Issues & Solutions

### Transaction Display

- **Issue**: All transactions showing as red (expenses)
- **Solution**: Remove `Math.abs()` usage in display components, preserve amount signs
- **Pattern**: Use amount sign for color: positive = green, negative = red

### Navigation Refresh

- **Issue**: Stale data when navigating between screens
- **Solution**: Implement `useFocusEffect` with data refetching
- **Pattern**: Always refresh data when screen gains focus

### Date Handling

- **Issue**: Invalid date errors with various date formats
- **Solution**: Robust date parsing with fallbacks
- **Pattern**: Parse dates defensively, provide fallback display

### Refund Handling

- **Issue**: Refunds were not increasing slush if treated with abs().
- **Solution**: Use signed transaction amounts; negatives reduce slush, positives increase it.

## Security Considerations

- **Never log or print Plaid `access_token`** (even in sandbox).
- Plan to **encrypt tokens at rest** (Phase G).
- Never commit API keys, tokens, or sensitive credentials
- Use environment variables for configuration
- Exclude test/debug files from version control
- Regularly audit .gitignore files for completeness

## Development Environment

- **Node.js**: Latest LTS version
- **Package Manager**: npm
- **Development Server**: Expo CLI for React Native, Next.js dev server for API
- **Testing**: Plaid sandbox environment for banking integration
- **Code Quality**: TypeScript strict mode, ESLint configuration

## Debugging Guidelines

- When terminal interaction is required, emit a single **copy-pasteable** command (e.g., an `echo` instruction) and wait for user confirmation.
- Prefer targeted file reads and concise diffs over large dumps.
- Before adding new code, scan for existing implementations to avoid duplication.

## Future Architecture Considerations

- Database schema design for user preferences and ignored transactions
- Push notification system for spending alerts
- Multi-user support and data isolation
- Caching strategy for transaction data
- Offline support for core app functionality

## Database Notes (Phase G – minimal schema)

**Goal**: persist tokens, cursors, accounts, transactions, and user-specific preferences.

- `items`

  - `id` (pk), `userId`, `item_id` (Plaid), `access_token_enc` (encrypted), `institution_id`, `createdAt`, `updatedAt`

- `transaction_sync_state`

  - `item_id` (fk), `cursor`, `lastSyncedAt`

- `accounts`

  - `account_id` (pk), `item_id` (fk), `name`, `type`, `subtype`, `mask`, `balances`, `raw` (json), `updatedAt`

- `transactions`

  - `transaction_id` (pk), `account_id` (fk), `item_id` (fk), `date`, `name`, `merchant_name`, `amount`, `iso_currency_code`, `category_primary`, `category_secondary`, `original_description`, `pending`, `raw` (json), indexes on (`item_id`, `date`)

- `ignored_transactions` (user prefs)

  - `id` (pk), `userId`, **one of**: `transaction_id` **or** `merchant_pattern` (glob/regex), `createdAt`

- `bills` (recurring)

  - `id` (pk), `userId`, `name`, `amount` (or `amount_strategy` if variable), `expected_day` (or RRULE), `account_id` (optional), `category`, `status`, `notes`, `createdAt`, `updatedAt`

- `wishlist_items` _(planned)_

  - `id` (pk), `userId`, `title`, `url`, `target_amount`, `allocated_percent` (0–100), `current_amount`, `status`, `createdAt`, `updatedAt`

- `daily_budget_results` // calendar + analytics

  - `id` (pk), `userId`, `date`,
    `allowance` (number),
    `spend_actual` (number, non-ignored negatives, no abs applied),
    `credits_actual` (number, non-ignored positives),
    `remaining` (number = allowance - spend_actual),
    `within_budget` (boolean, computed as (allowanceToday - spend_actual) >= 0),
    // if `spend_actual = 0`, mark as a “no spend day”
    `reason_exclusions` (json array of ignored tx ids/merchants),
    `createdAt`

- `streak_state`

  - `userId` (pk), `current_streak` (int), `longest_streak` (int),
    `last_within_budget_date` (date), `updatedAt`

- `slush_ledger`

  - `id` (pk), `userId`, `date`,
    `start_balance` (number),
    `daily_surplus` (number, max(0, remaining)),
    `slush_end_balance` (number),
    `createdAt`

### Additional Notes

- Refunds (positive amounts) increase slush.
- Negative slush may carry into the next period (not clamped).
- Ignored transactions remove a tx from _all_ math and streaks (payroll, modeled bills, transfers).

## Team Workflows

- Maintain backwards compatibility when updating transaction display logic
- Test all navigation flows when implementing new features
- Verify color coding works across different transaction types
- Always run security analysis before major commits

## Development Pipeline (for context)

- **Phase E (done)**: Link → exchange → accounts → basic transactions
- **Phase F (next)**: graceful initializing state, manual refresh endpoint
- **Phase G (later)**: encrypt tokens, real DB, then multi-user support

_Why include the pipeline?_ It guides coding decisions (e.g., using `transactions/sync` and designing repo layers) so today’s work stays compatible with upcoming steps.

---

_Last Updated: After Phase E milestone; Phase F & G tasks added; allowance engine simplified (refunds, ignores, negative slush carry, no-spend days)_
