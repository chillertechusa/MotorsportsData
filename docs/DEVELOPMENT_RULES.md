# Platform Development Rules

## Golden Rule: Always Test Before Proceeding

**No phase advances to the next phase until the current phase is fully tested and verified working.**

This is non-negotiable for a 24/7 global platform.

### Phase Testing Checklist

#### Phase 1: Checkout End-to-End
**Status:** Built ✅ | Tested: ⏳ PENDING

- [ ] Free Rider signup works (no checkout)
- [ ] Premium tier signup → checkout → payment → console works
- [ ] Error scenarios handled gracefully (invalid cards, duplicate emails)
- [ ] Square webhook processes payments correctly
- [ ] Database reflects correct tier after payment
- [ ] Features unlock correctly based on tier
- [ ] No JavaScript console errors
- [ ] User journey is smooth and clear

**Test Guide:** `/docs/PHASE1_TEST_CHECKLIST.md`

**Approval:** Must be tested by actual user or automated E2E test before Phase 2 starts

---

#### Phase 2: Health Monitoring + Owner Console (Pending Testing)
**Status:** Not Started | Test After: Phase 1 ✅

#### Phase 3: Animations + Documentation (Pending Testing)
**Status:** Not Started | Test After: Phase 2 ✅

---

## Additional Development Rules

### Rule 1: Backward Compatibility
- Never break existing features when adding new ones
- If a change affects user flows, test all affected flows
- Example: Changing tier logic requires re-testing signup → upgrade → console

### Rule 2: Error Handling
- Every user-facing action must have error handling
- Errors must be user-friendly (not "Error: 500")
- All errors logged for debugging
- Example: Checkout must handle: card decline, network timeout, database failure

### Rule 3: Database Consistency
- Payment must succeed AND tier must update (atomic)
- If one fails, both fail (use transactions)
- Webhook acts as confirmation layer
- No orphaned payments or mismatched tiers

### Rule 4: Monitoring First
- If a system can break, it needs a health check
- If a health check exists, owner must see it
- If owner sees it, alert must fire within 1 minute

### Rule 5: Documentation
- Every user journey documented with screenshots
- Every error case handled with clear messaging
- Every new feature has a test case
- Example: "User upgrades tier" → document exact steps → add test case

### Rule 6: Zero Silent Failures
- No data loss without owner knowing
- No payments charged without confirmation
- No tier changes without audit log
- No user getting stuck in an intermediate state

---

## Testing Workflow

When each phase is complete:

1. **Build & Deploy** (to production)
2. **Run Test Checklist** (manual or automated E2E)
3. **Verify All Critical Checks Pass**
4. **Document Results** (what worked, what failed)
5. **Fix Any Issues** (return to step 1 if needed)
6. **Get Approval** (confirm with user before next phase)
7. **Proceed to Next Phase** (only after approval)

---

## Current Status

| Phase | Status | Tested | Approved |
|-------|--------|--------|----------|
| Phase 1: Checkout | ✅ Built | ⏳ PENDING | ⏳ PENDING |
| Phase 2: Monitoring | Not Started | No | No |
| Phase 3: UX Polish | Not Started | No | No |

**Next Step:** Test Phase 1 using checklist in `/docs/PHASE1_TEST_CHECKLIST.md`
