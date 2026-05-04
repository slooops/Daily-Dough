# Daily Dough — Plan

**Goal**: Ship Daily Dough to TestFlight as a fully functional personal finance app using Plaid sandbox data, then add IAP subscription before App Store release.

**Last Updated**: May 3, 2026

---

## Completed Work

### Phases A–G: Plaid Infrastructure (Sep 2025)

All Plaid integration, database, API endpoints, React Native client, token encryption, and Prisma migration to SQLite. 392 demo transactions synced from sandbox. Validated May 3, 2026 — all endpoints working.

### Phase H: Allowance Engine (May 3, 2026)

- **H1** ✅ UserProfile Prisma model + migration + repo (`server/repo/userProfile.ts`)
- **H2** ✅ Onboarding screen (`app/onboarding.tsx`) — 3-step form, saves profile, triggers recompute
- **H3** ✅ Core engine (`server/services/allowanceEngine.ts`) — `computeExpectations`, `seedPeriod`, `computePeriod`, `computeStreak`
- **H3** ✅ Orchestrator (`server/services/computePeriodToDate.ts`) — fetches data, runs engine, persists results
- **H4** ✅ API endpoints: `/api/allowance/today`, `/api/allowance/period`, `/api/allowance/recompute`
- **H4** ✅ Bills API: `GET/POST/DELETE /api/bills`
- **H4** ✅ User profile API: `GET/POST /api/user/profile`
- **H5** ✅ Home screen wired to engine (DailyDial, SlushPill, StreakBadge use real data)
- **H5** ✅ Allowance service client (`services/allowanceService.ts`)
- **H5** ✅ Layout auto-redirect to onboarding if no profile

Demo profile: $5,000 biweekly, $2,000/mo rent, 4 bills → ~$284.51/day allowance.

### Liquid Glass UI Overhaul (May 3, 2026)

- **G1** ✅ Design tokens (`styles/theme.ts`) + GlassCard, GlassButton, GlassPill components
- **G2** ✅ DailyDial redesign — 260px, SVG gradient ring, glass center, state-based gradients
- **G3** ✅ Layout — transparent nav, LinearGradient backgrounds, GlassCard sections
- **G4** ✅ SlushPill → GlassPill, StreakBadge → translucent tinted backgrounds
- **G5** ✅ TransactionTable — glass container, themed colors
- **G6** ✅ Onboarding — gradient bg, glass step containers, themed inputs
- **G7** ✅ End-of-period celebration — warm gradient, GlassCard, themed selection cards

---

## Remaining Work

### Phase I: Ignored Transactions & Bills Wiring (May 3, 2026)

- **I1** ✅ `manage-bills.tsx` wired to `GET/POST/DELETE /api/bills` — fetches on focus, add/delete triggers recompute
- **I1** ✅ `services/billsService.ts` — API client (`fetchBills`, `addBill`, `deleteBill`)
- **I2** ✅ `GET/POST/DELETE /api/ignored-rules` — backend route using existing `ignoredRepo`
- **I2** ✅ `services/ignoredService.ts` — API client (`fetchIgnoreRules`, `addIgnoreRule`, `deleteIgnoreRule`)
- **I2** ✅ `ignore-rules.tsx` wired to API — tap-to-ignore transactions, add pattern rules, delete rules
- **I3** ✅ Extracted `inferCategoryFromMerchant()` to `utils/categoryInference.ts` (was inline in index.tsx)

### Phase J — Database Migration to Supabase

**Status**: Not started. Currently SQLite dev.db.

#### J1. Supabase Project Setup

1. Create Supabase project (free tier)
2. Update Prisma datasource to `postgresql` with `DATABASE_URL` + `DIRECT_URL`
3. Run `prisma migrate dev` against Supabase
4. **Acceptance**: All tables in Supabase, API works against Postgres

#### J2. Vercel Deployment

1. Deploy `daily-dough-api/` to Vercel
2. Set env vars: `DATABASE_URL`, `DIRECT_URL`, `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=sandbox`, `ENCRYPTION_KEY`
3. Update native app `API_BASE_URL` with env switching:
   ```typescript
   const API_BASE_URL = __DEV__
     ? "http://localhost:3000/api"
     : "https://daily-dough-api.vercel.app/api";
   ```
4. **Acceptance**: App on device hits deployed API

#### J3. Seed Demo Data in Production

1. Update `scripts/seed-demo.ts` for Postgres
2. Seed: user profile, transactions, bills
3. Verify engine computes correctly
4. **Acceptance**: Fresh Supabase DB serves correct allowance data

### Phase K — TestFlight Submission

**Status**: Not started.

#### K1. EAS Build Configuration

1. Install `eas-cli`, run `eas build:configure`
2. Create `eas.json` with dev/preview/production profiles
3. Configure Apple signing + provisioning
4. Bundle ID: `com.slooops.dailydough`
5. **Acceptance**: `eas build --platform ios --profile preview` succeeds

#### K2. App Polish

1. App icon (1024×1024) and splash screen
2. Loading states for all data-dependent screens
3. Error boundaries for network failures
4. Pull-to-refresh on transaction lists
5. Empty states that guide user through setup
6. Remove debug/test UI elements
7. **Acceptance**: No placeholder content, app feels complete

#### K3. TestFlight Upload

1. `eas build --platform ios --profile production`
2. `eas submit --platform ios`
3. Fill TestFlight metadata, add tester
4. **Acceptance**: Installable via TestFlight

### Phase L — End-of-Period Flow ✅

**Status**: Complete.

#### L1. End-of-Period Detection ✅

1. ✅ On app open (`_layout.tsx`), check if `today > periodEnd` → redirect to celebration
2. ✅ Celebration screen fetches real slush balance, lets user choose carryover split
3. ✅ "Start New Period" calls `POST /api/allowance/end-period` → advances dates, stores summary
4. ✅ PeriodHistory model + migration + repo + API routes

#### L2. Period History ✅

1. ✅ Period summaries stored in `period_history` table on end-period
2. ✅ `period-overview.tsx` wired to real engine data (heatmap, streaks, slush, remaining)
3. ✅ Past periods displayed via `GET /api/allowance/history`

### Phase S — In-App Purchase (Post-Beta 1)

**Status**: Not started. Needed before App Store release.

#### S1. App Store Connect Setup

1. Create subscription: `com.slooops.dailydough.monthly`, $0.99/mo
2. Subscription Group: "Daily Dough Access"
3. Optional: 7-day free trial

#### S2. StoreKit 2 Integration

1. Install `react-native-iap`
2. Create `services/subscriptionService.ts`: `checkStatus()`, `purchase()`, `restore()`
3. Client-side StoreKit 2 JWS verification (no server needed for v1)

#### S3. Paywall Screen

1. Create `app/paywall.tsx` — value prop, "$0.99/month" CTA, restore link, demo option
2. Trigger when user taps Connect Account without active subscription
3. Required: Terms of Service + Privacy Policy links

#### S4. Subscription Gating

1. `hooks/useSubscription.ts` — `{ isActive, isLoading, purchase, restore }`
2. Gate Plaid Link behind subscription check
3. Handle expiry: show banner, keep data visible read-only

#### Apple Review Notes

- Demo mode must work without subscription (for reviewer)
- Provide sandbox test account in review notes
- Required disclosures: data usage (Plaid), financial disclaimer, subscription terms
- Restore Purchases must be accessible

---

## Dependency Order

```
Phase L (end-of-period)            — ✅ complete
Phase J (Supabase + Vercel)        — after L works locally
Phase K (TestFlight)               — after J (needs deployed backend)
Phase S (IAP)                      — after K (TestFlight validated first)
```

**Critical path**: L → J → K → S → App Store

---

## Success Criteria — Beta 1 (TestFlight)

- [ ] User completes onboarding (paycheck, rent, bills)
- [ ] DailyDial shows computed daily allowance from real engine
- [ ] Plaid demo transactions feed into spend calculations
- [ ] Ignored transactions excluded from math
- [ ] Slush fund tracks correctly across days
- [ ] Streak tracking works (within-budget days)
- [ ] End-of-period flow handles carryover
- [ ] App runs on TestFlight against Vercel + Supabase
- [ ] No real financial data used until all above pass

## Success Criteria — App Store Release

- [ ] All Beta 1 criteria pass
- [ ] IAP subscription working ($0.99/mo)
- [ ] Free tier shows demo mode, paid tier enables Plaid
- [ ] Apple review passes (privacy policy, financial disclaimer, restore purchases)

---

_Last Updated: May 3, 2026_
