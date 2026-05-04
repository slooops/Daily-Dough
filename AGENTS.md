# Daily Dough AI Agent Context

## Project Overview

Daily Dough is a personal finance app that helps users know their daily disposable income. It visualizes daily spending habits through a "Daily Dial" interface, tracks expenses, calculates "slush fund" money, and gamifies financial awareness through streak tracking.

**Core Concept**: Instead of monthly budgeting, Daily Dough shows a daily spending allowance based on pay period and bills, encouraging mindful daily spending. The Allowance Engine spec is in `SPEC.md`. The build plan is in `PLAN.md`.

## Architecture

### Tech Stack

- **Frontend**: React Native with Expo 53 (TypeScript)
- **Backend**: Next.js 15.5.0 API (TypeScript)
- **Banking Integration**: Plaid SDK v38.0.0
- **Database**: Prisma ORM + SQLite (dev) — migrating to Supabase Postgres (production)
- **Encryption**: AES-256-GCM for access tokens at rest (`lib/crypto.ts`)
- **UI System**: Liquid Glass design (iOS 26 style — `expo-blur`, `expo-linear-gradient`, `expo-haptics`)
- **Deployment**: Local dev → Vercel (API) + EAS Build (native app)

### Repository Structure

```
/daily-dough-api/          # Next.js backend API
  app/api/                 # API routes (plaid/, user/, bills/, allowance/)
  server/repo/             # Data access layer (Prisma repos for all tables)
  server/services/         # Business logic (allowanceEngine.ts, computePeriodToDate.ts)
  lib/                     # Shared utilities (plaid.ts, config.ts, crypto.ts)
  prisma/                  # Schema + migrations + dev.db

/daily-dough-native/       # React Native mobile app
  app/                     # Screens (index, onboarding, settings, connect-accounts, etc.)
  components/              # UI components (DailyDial, SlushPill, StreakBadge, ui/)
  components/ui/           # Glass design system (GlassCard, GlassButton, GlassPill)
  services/                # API clients (plaidService, allowanceService)
  styles/                  # Tokens (common.ts, theme.ts — Liquid Glass)

/Figma Originals/          # Legacy reference from Figma — ignore
```

### Database Schema (Prisma)

All tables in `prisma/schema.prisma` with repos in `server/repo/`:

| Table                    | Purpose                                               | Status              |
| ------------------------ | ----------------------------------------------------- | ------------------- |
| `items`                  | Plaid items (encrypted access tokens)                 | ✅ Working          |
| `transaction_sync_state` | Plaid sync cursors                                    | ✅ Working          |
| `accounts`               | Bank accounts linked to items                         | ✅ Working          |
| `transactions`           | All synced transactions (392 demo txns)               | ✅ Working          |
| `user_profiles`          | Pay info: gross paycheck, cadence, rent, period dates | ✅ Working          |
| `bills`                  | Recurring bills (name, amount, frequency)             | ✅ Working          |
| `ignored_transactions`   | Rules for excluding txns from math                    | ✅ Working          |
| `daily_budget_results`   | Engine output: daily allowance/spend/carryover        | ✅ Engine populates |
| `streak_state`           | Within-budget day streaks                             | ✅ Engine populates |
| `slush_ledger`           | Daily slush balance tracking                          | ✅ Engine populates |
| `period_history`         | Completed period summaries (budget, spend, streaks)   | ✅ Working          |
| `wishlist_items`         | Future savings goals                                  | Schema only         |

### API Endpoints

**Plaid** (all working in sandbox):

- `POST /api/plaid/link-token` — Generate Plaid Link token
- `POST /api/plaid/exchange` — Exchange public token for access token
- `GET /api/plaid/accounts?userId=` — Fetch accounts
- `GET /api/plaid/transactions?userId=&limit=&since=` — Fetch transactions
- `POST /api/plaid/refresh` — Trigger transaction sync
- `POST /api/plaid/webhook` — Handle Plaid webhooks
- `GET /api/plaid/sandbox-quicklink` — Create sandbox test item

**User & Budget** (all working):

- `GET/POST /api/user/profile` — User profile CRUD
- `GET/POST/DELETE /api/bills` — Bills CRUD
- `GET /api/allowance/today?userId=` — Today's allowance + streak
- `GET /api/allowance/period?userId=` — Full period day-by-day
- `POST /api/allowance/recompute` — Force engine recompute
- `POST /api/allowance/end-period` — Close current period, store summary, advance dates
- `GET /api/allowance/history?userId=` — Past period summaries
- `GET/POST/DELETE /api/ignored-rules` — Ignore rules CRUD

## Development Patterns

### Agent Behavior

- Be **succinct**: simplest, most readable solution.
- Teach as you go: brief plain-English explanation of backend changes for a frontend engineer.
- When a UI action is needed, output a single `echo` command and pause.
- Treat tokens as secrets: **never print, log, or expose** `access_token` even in sandbox.
- Flag that payroll/bill ignores must prevent double-counting slush.
- **After completing any phase or major task**: update `PLAN.md` (mark done, update status) and `AGENTS.md` (if new endpoints, tables, or conventions were added). Keep docs current.

### Key Conventions

- **Transaction amounts**: Plaid positive = expense, negative = income/credit. Preserve signs.
- **Data refresh**: Use `useFocusEffect` for screen refresh on navigation.
- **Transaction sync**: Always use `/transactions/sync` + cursors, not legacy `/transactions/get`.
- **User ID**: Hardcoded `userId="demo"` everywhere. Single-user app — multi-user is out of scope.
- **API URL**: Hardcoded `localhost:3000` in native app (needs env switching for production).

### Code Organization

- `server/services/` — Business logic (engine computations, orchestrators)
- `server/repo/` — Data access (one file per table, Prisma-based)
- `services/` (native) — API client functions
- `components/ui/` — Reusable glass design system components
- `styles/theme.ts` — Liquid Glass design tokens (glass materials, gradients, motion springs)

### Common Gotchas

| Issue                               | Fix                                                |
| ----------------------------------- | -------------------------------------------------- |
| All transactions red                | Don't use `Math.abs()` — preserve amount signs     |
| Stale data after navigation         | Use `useFocusEffect` with data refetch             |
| Invalid date errors                 | Parse dates defensively with fallbacks             |
| Refunds not increasing slush        | Use signed amounts — positives increase slush      |
| `NodeJS.Timeout` type error in RN   | Use `ReturnType<typeof setInterval>` instead       |
| Prisma client stale after migration | Full server restart required (not just hot-reload) |

## Security

- **Never log or print** Plaid `access_token` (even sandbox)
- Tokens encrypted at rest via AES-256-GCM (`lib/crypto.ts`)
- Environment variables for all secrets
- Exclude test/debug files from version control

---

_Last Updated: May 3, 2026_
