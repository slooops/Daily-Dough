# PLAN_IAP — In-App Purchase (StoreKit 2)

**Goal**: Add a $0.99/month auto-renewable subscription to cover Plaid API costs (~$0.30/user/month) and make the app sustainable.

**Timing**: After Beta 1 is validated on TestFlight. This is the final gate before App Store release.

**Approach**: StoreKit 2 (native Swift/ObjC bridged via expo or react-native-iap). Keep it dead simple — one subscription tier.

---

## Cost Analysis

| Item                        | Monthly Cost     |
| --------------------------- | ---------------- |
| Plaid per user (Production) | ~$0.30           |
| Supabase (free tier, 500MB) | $0.00            |
| Vercel (hobby/free)         | $0.00            |
| Apple's 30% cut of $0.99    | $0.30            |
| **Net per user**            | **$0.39 profit** |

At scale concerns (unlikely but noted):

- Supabase Pro ($25/mo) kicks in at ~50K MAU or 8GB DB
- Vercel Pro ($20/mo) kicks in if you exceed hobby limits
- These only matter at 100+ users, which is not the goal

---

## Architecture

### Simple Gate Model

```
FREE:
  - Onboarding
  - View app with demo/sample data
  - See what the app does

PAID ($0.99/mo):
  - Connect real bank accounts (Plaid)
  - Full allowance engine
  - Streak tracking
  - All features
```

No feature gating within the paid tier. One subscription = full access.

---

## Implementation Plan

### S1. App Store Connect Setup

**Tasks**:

1. Create app record in App Store Connect (if not already)
2. Configure auto-renewable subscription:
   - Product ID: `com.slooops.dailydough.monthly`
   - Price: $0.99/month
   - Subscription Group: "Daily Dough Access"
   - Free trial: 7 days (optional, nice for reviews)
3. Create subscription description and metadata
4. **Acceptance**: Subscription appears in App Store Connect sandbox

### S2. StoreKit 2 Integration (React Native)

**Package**: `react-native-iap` (most maintained RN IAP library)

**Tasks**:

1. Install `react-native-iap`:
   ```bash
   cd daily-dough-native
   npx expo install react-native-iap
   ```
2. Create `services/subscriptionService.ts`:
   ```typescript
   export async function checkSubscriptionStatus(): Promise<boolean>;
   export async function purchaseSubscription(): Promise<boolean>;
   export async function restorePurchases(): Promise<boolean>;
   ```
3. Implement receipt validation:
   - Option A: Client-side StoreKit 2 (JWS verification built-in, simpler)
   - Option B: Server-side validation via `/api/verify-receipt` (more secure)
   - **Recommendation**: Option A for v1 (StoreKit 2 handles verification natively)
4. **Acceptance**: Can purchase subscription in sandbox, verify status

### S3. Paywall Screen

**Tasks**:

1. Create `app/paywall.tsx`:
   - Show app value prop (DailyDial preview, feature list)
   - "$0.99/month" prominent CTA
   - "Restore Purchases" link
   - "Continue with demo" option (limited mode)
   - Terms of Service / Privacy Policy links (required by Apple)
2. Trigger paywall:
   - When user tries to connect a real bank → check subscription → show paywall if inactive
   - NOT on app launch (Apple rejects aggressive paywalls)
3. **Acceptance**: Paywall displays, purchase flow works in sandbox

### S4. Subscription Status Gating

**Tasks**:

1. Create `hooks/useSubscription.ts`:
   ```typescript
   export function useSubscription() {
     return { isActive, isLoading, purchase, restore };
   }
   ```
2. Gate Plaid connection behind subscription check:
   - `connect-accounts.tsx`: Check `isActive` before initiating Plaid Link
   - If not subscribed, navigate to paywall
3. Allow full app usage once subscribed (no other gates)
4. Handle subscription expiry gracefully:
   - Show "Subscription expired" banner
   - Keep existing data visible (read-only)
   - Prompt renewal
5. **Acceptance**: Free users see paywall before connecting bank; paid users proceed normally

### S5. Server-Side Subscription Awareness (Optional for v1)

**Tasks** (defer if not needed):

1. Create `POST /api/subscription/verify` — validate App Store receipt
2. Store subscription status in user profile
3. Gate Plaid API calls behind subscription check server-side
4. **Note**: For a single-user app, client-side gating is sufficient. Server-side only matters for preventing API abuse at scale.

---

## Apple Review Considerations

### Required for Financial Apps

- [ ] Privacy Policy URL (required for any app with accounts)
- [ ] Terms of Service URL
- [ ] Description of data usage (Plaid collects bank credentials)
- [ ] Financial disclaimer: "Not financial advice"

### Required for Subscriptions

- [ ] Clear pricing displayed before purchase
- [ ] Restore Purchases button accessible
- [ ] Subscription terms (auto-renews, cancel anytime)
- [ ] Links to Apple's subscription management

### Potential Rejection Reasons

- **Guideline 3.1.1**: Subscription must provide ongoing value (we do — daily allowance updates, transaction sync)
- **Guideline 5.1.1**: Data collection must be disclosed (Plaid bank access)
- **Guideline 4.2**: App must be fully functional for review (ensure sandbox/demo mode works without subscription for reviewer)

### Review Strategy

1. Include demo mode that works without subscription (reviewer can see the app's value)
2. Provide sandbox test account credentials in review notes
3. Explain that subscription enables real bank connection (Plaid has per-user cost)

---

## Timeline Estimate

| Step                        | Effort                    |
| --------------------------- | ------------------------- |
| S1. App Store Connect setup | Quick (config only)       |
| S2. StoreKit integration    | Medium (1-2 sessions)     |
| S3. Paywall screen          | Quick (UI only)           |
| S4. Subscription gating     | Quick (conditional logic) |
| S5. Server-side (optional)  | Defer                     |

---

## Files to Create

```
daily-dough-native/
  services/subscriptionService.ts
  hooks/useSubscription.ts
  app/paywall.tsx
```

---

## Success Criteria

- [ ] Subscription purchasable in StoreKit sandbox
- [ ] Free users can use demo mode but not connect real banks
- [ ] Paid users get full Plaid access
- [ ] Restore purchases works
- [ ] App passes Apple review with subscription
- [ ] Net revenue per user covers Plaid + Apple cut
