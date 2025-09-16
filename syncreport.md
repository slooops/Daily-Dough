# Daily Dough Implementation Sync Report

**Phases A–G (Steps 1-18) Complete**

## 0) Overview

- **ORM & DB chosen**: Prisma ORM with SQLite (dev) and PostgreSQL (production compatibility)
- **How to run migrations in dev**: `npx prisma migrate dev` (auto-applies schema changes)
- **Seed/reset scripts**:
  - `scripts/setup-db.js` - Basic database setup
  - No dedicated reset script yet (TODO for developer ergonomics)

## 1) Plaid Client & Config

- **File path for Plaid client helper**: `lib/plaid.ts`
- **Env validation**: `lib/config.ts` (validates PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV)
- **Required env vars**: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, ENCRYPTION_KEY
- **Link webhook URL**: Configured in link-token creation pointing to `/api/plaid/webhook`

## 2) API Routes

- **POST /api/plaid/link-token** → `app/api/plaid/link-token/route.ts`

  - Creates link_token with products: ["transactions"], country_codes: ["US"]
  - Uses webhook URL pointing to `/api/plaid/webhook`

- **POST /api/plaid/exchange** → `app/api/plaid/exchange/route.ts`

  - Exchanges public_token for access_token, stores encrypted in database
  - Persists item_id, institution_id, encrypted access_token

- **GET /api/plaid/accounts** → `app/api/plaid/accounts/route.ts`

  - Fetches accounts via Plaid API, stores in database, returns clean account list
  - Maps to: id, name, type, subtype, mask, balances

- **GET /api/plaid/transactions** → `app/api/plaid/transactions/route.ts`

  - Uses database storage (post-migration), supports pagination via ?since=&limit=
  - Does NOT use transactions/sync (that's handled separately)

- **POST /api/plaid/webhook** → `app/api/plaid/webhook/route.ts`

  - No signature verification implemented (TODO)
  - Triggers background sync for TRANSACTIONS webhook codes

- **GET /api/plaid/sandbox-quicklink** → `app/api/plaid/sandbox-quicklink/route.ts`
  - Creates sandbox item without Link UI, useful for testing

## 3) Repo Layer

**Module paths and key exports:**

- **repo/items**: `server/repo/items.ts`

  - `save()`, `getByUser()`, `getByItemId()`, `deleteByUser()`

- **repo/syncState**: `server/repo/syncState.ts`

  - `get()`, `save()` - manages Plaid sync cursors

- **repo/accounts**: `server/repo/accounts.ts`

  - `upsertBatch()`, `getByUser()`, `getByItem()`, `deleteByItem()`

- **repo/transactions**: `server/repo/transactions.ts`

  - **✅ Confirmed**: `upsertBatch()` handles added/modified with idempotent upserts
  - **✅ Confirmed**: `applyRemoved()` soft-deletes with status="removed"

- **repo/ignored**: `server/repo/ignored.ts`

  - Pattern matching approach using `transaction_id` exact match and `pattern` regex
  - `shouldIgnore()`, `addRule()`, `listRules()`

- **repo/dailyBudget, repo/streak, repo/slushLedger**: `server/repo/`
  - Basic CRUD operations implemented, ready for Allowance Engine integration

## 4) Schema & Migrations

**Final table list**:

```
items, transaction_sync_state, accounts, transactions, ignored_transactions,
daily_budget_results, streak_state, slush_ledger
```

**Deviations**:

- Missing `bills` and `wishlist_items` (planned for future phases)
- Added `slush_ledger` for carryover tracking

**Indexes/uniques added**:

- `items.item_id` (unique)
- `transactions.transaction_id` (unique, primary for idempotency)
- `accounts.account_id` (unique)
- Composite indexes for performance queries

**Removed transactions**: Soft delete with `status="removed"` field

## 5) Security (Step 17 ✅ Complete)

- **File path for AES-256-GCM helper**: `lib/crypto.ts`
- **✅ Confirmed**: access_token encrypted before storage, decrypted only when calling Plaid
  - Routes using encryption: `exchange`, `accounts`, `transactions`, `refresh`, `webhook`
- **✅ Confirmed**: No logs or responses include tokens
  - Grep summary: All access_token usage goes through encrypt/decrypt pipeline

## 6) Sync Logic (Idempotent ✅)

- **Sync loop location**: `app/api/plaid/refresh/route.ts` (manual) and webhook triggers
- **Cursor storage**: `TransactionSyncState` table with `cursor` field
- **Handling approach**:
  - **Added**: Insert new transactions via `upsertBatch()`
  - **Modified**: Update existing via same `upsertBatch()` (idempotent)
  - **Removed**: Soft delete via `applyRemoved()` with status="removed"

**Idempotency verification**:

- ✅ Manual test: 392 transactions added first run, 0 on second run
- ✅ Batch processing: 25 transactions per chunk with 30s timeout
- ✅ Fixed nested transaction timeout issue

## 7) Allowance Engine Integration

- **Computation location**: **STUBBED** - daily_budget_results table exists but no computation logic
- **Variables per day**: `allowance`, `spend_actual`, `credits_actual`, `remaining`, `within_budget`, `no_spend_flag`
- **Carryover & slush updates**: **STUBBED** - slush_ledger table exists
- **UI bindings**: Not yet connected (TODO for next phases)

## 8) Ignored Rules

- **Rules location**: `server/repo/ignored.ts`
- **Syntax**: Supports `transaction_id` exact match AND `pattern` regex for merchant names
- **Default rules**: **NOT SEEDED** (TODO) - should include payroll, transfers, modeled bills

## 9) Tests / Dev UX

**Test files**:

- `tests/phaseEIntegration.ts` - Full Link flow integration (208 lines)
- `tests/task14Integration.ts` - Accounts/transactions API testing (168 lines)

**Suggested cleanup**: Both test files are **DEPRECATED** due to DB migration

- These tests use old in-memory storage APIs
- Should be deleted after new DB-based tests are created

**CLI/dev scripts**:

- No automated reset script yet (TODO)
- Manual: `rm prisma/dev.db && npx prisma migrate dev`

**Manual UI testing**:

```bash
echo "Open the React Native app, click 'Connect a bank', complete Plaid Link, then press Enter here to continue..."
```

## 10) Gaps / TODOs / Suggested Cleanup

**Intentionally skipped**:

- **Multi-user auth** (Step 19) - using hardcoded userId="demo"
- **Allowance Engine computation** - tables exist but logic not implemented
- **Default ignored rules** - infrastructure ready but not seeded

**Files/fixtures to remove**:

- ✅ **DELETE**: `tests/phaseEIntegration.ts` - deprecated by DB migration
- ✅ **DELETE**: `tests/task14Integration.ts` - deprecated by DB migration
- ✅ **FIXED**: `app/api/plaid/webhook/route.ts` - was using deprecated Phase D APIs, completely rewritten for database layer
- **Review**: `scripts/test-config.js` - may be obsolete
- **DELETE**: `app/api/plaid/webhook/route-broken-backup.ts` - backup of broken webhook file

**Step 19 (Multi-user) minimal plan**:

1. **Auth placeholder**: Add simple JWT or session middleware
2. **Scoping**: Update all repo functions to filter by `userId`
3. **Migration**: Add `userId` indexes, update existing demo data
4. **API changes**: Extract `userId` from auth context instead of hardcoded "demo"

**Critical next priorities**:

1. **Backfill & parity** - Implement Allowance Engine daily computations
2. **New test suite** - Replace deprecated tests with DB-based integration tests
3. **Developer ergonomics** - Add reset scripts and dev tooling
4. **Performance indexes** - Optimize query performance for production

---

**Status**: Phase G (Step 18) ✅ **COMPLETE** - Database migration successful with 392 transactions synced and verified idempotent operation.
