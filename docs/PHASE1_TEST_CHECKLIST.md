# Phase 1 Test Checklist — End-to-End Checkout Flow

## Goal
One user should be able to: Land on site → Browse tiers → Sign up → Checkout → Pay → Access console with proper tier features

---

## Test Case 1: Free Rider Signup (No Checkout)

**Expected Flow:** Homepage → "Sign In" → Signup form → Free Rider account → `/data` console

**Steps:**
1. [ ] Open https://motorsportsdata.io in browser
2. [ ] Click "Sign In" in top nav
3. [ ] Click "Create Account" or switch to signup mode
4. [ ] Enter email: `test.freerider@example.com`
5. [ ] Enter password: `TestPass123!`
6. [ ] Click "Create Account"
7. [ ] Should see success + redirect animation
8. [ ] Land on `/data` console
9. [ ] Verify "Free Rider" tier badge appears
10. [ ] Verify premium features show "Upgrade" button (locked)

**Expected Result:** ✅ Free rider account created, console loads, features locked

---

## Test Case 2: Premium Tier Signup → Checkout (Privateer)

**Expected Flow:** Tier page (Privateer) → Signup carrying tier → Checkout form → Payment → Console with tier unlocked

**Steps:**
1. [ ] Open https://motorsportsdata.io/data/plans/privateer
2. [ ] Click "Get Started" or main CTA button
3. [ ] Should redirect to `/data/sign-in?mode=sign-up&redirect=/checkout/tier?tier=privateer`
4. [ ] Enter email: `test.privateer@example.com`
5. [ ] Enter password: `TestPass123!`
6. [ ] Click "Create Account"
7. [ ] Should redirect to `/checkout/tier?tier=privateer`
8. [ ] Verify checkout page shows:
   - [ ] "Privateer" as title
   - [ ] Correct price (annual: $79, monthly: $7/mo)
   - [ ] Email/name prefilled
   - [ ] Card form ready
   - [ ] Billing frequency toggle (annual/monthly)
9. [ ] Enter test card (use Square sandbox test card):
   - [ ] Card: 4111 1111 1111 1111
   - [ ] Exp: Any future date (e.g., 12/25)
   - [ ] CVV: Any 3 digits (e.g., 123)
10. [ ] Click "Subscribe — $79/year" button
11. [ ] Should show loading state "Charging $79..."
12. [ ] Should show success screen with checkmark + "Welcome to Privateer"
13. [ ] Should redirect to `/data` after 2.5 seconds
14. [ ] Verify "Privateer" tier badge appears (not "Free Rider")
15. [ ] Verify previously-locked features now show checkmark (unlocked)

**Expected Result:** ✅ Payment charged, tier upgraded to Privateer, console loads with full access

---

## Test Case 3: Checkout Error Handling

**Expected Flow:** Error scenario → User-friendly error message → User can retry

**Scenario A: Invalid Card**
1. [ ] Go to checkout for any paid tier
2. [ ] Enter test card: 4000 0000 0000 0002 (decline card)
3. [ ] Click "Subscribe"
4. [ ] Should show error: "Your card was declined. Try a different card or contact your bank."
5. [ ] Button should return to enabled state (not stuck on "Processing")
6. [ ] User can correct card and retry

**Scenario B: Missing Email**
1. [ ] Go to checkout for any paid tier
2. [ ] Leave email field empty
3. [ ] Click "Subscribe"
4. [ ] Should show error: "Please enter a valid email address."
5. [ ] Form should remain open, user can fill in email

**Scenario C: Duplicate Email**
1. [ ] Use same email as Test Case 1 (test.freerider@example.com)
2. [ ] Try to sign up again at different tier page
3. [ ] At signup, should get error: "This email is already in use. Try signing in instead."
4. [ ] User can sign in with existing account

**Expected Result:** ✅ All errors are clear, actionable, and don't leave user stuck

---

## Test Case 4: Square Webhook Processing

**Expected Flow:** Payment succeeds → Square sends webhook → Database updated → Owner visibility

**Steps:**
1. [ ] Complete Test Case 2 (successful Privateer payment)
2. [ ] Open dev console and check logs:
   - [ ] Should see: `[v0] Square webhook received: payment.updated`
   - [ ] Should see: `[v0] Payment completed: <paymentId> for customer <customerId>`
   - [ ] Should see: `[v0] Team <teamId> payment confirmed, marked active`
3. [ ] Verify database (via Vercel/Neon admin):
   - [ ] `md_teams.paymentStatus = 'active'` for user's team
   - [ ] `md_teams.subscription_tier = 'privateer'`
   - [ ] `md_teams.payment_failure_count = 0`

**Expected Result:** ✅ Webhook received, database updated, payment confirmed

---

## Test Case 5: Already-Signed-In User Skips Sign-In

**Expected Flow:** Signed in user → Tier page → Direct to checkout (no sign-in)

**Steps:**
1. [ ] From Test Case 2, you're signed in as `test.privateer@example.com`
2. [ ] Go to a different tier page: https://motorsportsdata.io/data/plans/race_team
3. [ ] Click "Get Started"
4. [ ] Should skip sign-in and go directly to `/checkout/tier?tier=race_team`
5. [ ] Checkout should prefill with your existing email/name

**Expected Result:** ✅ Signed-in user skips re-auth, lands directly on checkout

---

## Test Case 6: Free Tiers Skip Checkout

**Expected Flow:** Free tier CTA → Signup → Redirect to console (no checkout)

**Steps:**
1. [ ] Open https://motorsportsdata.io/data/plans/rookie (free tier)
2. [ ] Click "Get Started"
3. [ ] Should redirect to `/data/sign-in?mode=sign-up`
4. [ ] Sign up with new email
5. [ ] After signup, should redirect to `/data` (NOT `/checkout/tier`)
6. [ ] Should see "Free Rider" tier badge
7. [ ] All features should show as available (no locks)

**Expected Result:** ✅ Free tier redirects to console, skips checkout entirely

---

## Critical Checks (Must Pass)

- [ ] No "white screen of death" errors
- [ ] All error messages are clear (not "Error: 400")
- [ ] Loading states show spinner + messaging
- [ ] Success screen shows for 2.5 seconds before redirect
- [ ] No console errors (check browser dev tools)
- [ ] Tier badges reflect correct tier after checkout
- [ ] Features gate correctly (locked/unlocked based on tier)
- [ ] Webhook logs appear in console for successful payments
- [ ] Database reflects correct tier after payment
- [ ] Can retry checkout after error without page reload

---

## Success Criteria

✅ All 6 test cases pass  
✅ No JavaScript errors in console  
✅ User journey is smooth and clear  
✅ Error messages are helpful  
✅ Database and webhooks working  

**Phase 1 = COMPLETE ✅**
