# Team Governance Implementation Roadmap

## Current Status

### ✅ Already Implemented
- **Platform Owner:** `motorsportsdata@gmail.com` set in `MD_OWNER_EMAILS`
- **Team Owner Role:** Established in schema (`mdTeamMembers.role = 'owner'`)
- **Data Scoping:** 88% of API routes properly check `getSessionTeamId()`
- **Role-Based Access:** RBAC system in place for owner/coach/mechanic/mechanic_coach
- **Data Segregation:** All queries include `teamId` filter

### Routes Needing Security Review (8 of 72)
Some are intentionally unprotected (webhooks, seeds, test endpoints):

| Route | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `/api/md-analytics/recovery` | Analytics (platform-level) | ⚠️ Needs review | Should be owner-only |
| `/api/md-coach-live` | Real-time coach AI | ✅ Protected | Calls `getSessionTeamId()` |
| `/api/terra-callback` | External webhook | ✓ Intentional | Webhook signature verified |
| `/api/md-feature-chat` | Feature detection | ⚠️ Needs review | Check if should be protected |
| `/api/md-optimize/optimizations-context` | Optimization context | ⚠️ Needs review | Should be team-scoped |
| `/api/md-readiness/check` | Health check | ✓ Intentional | Non-sensitive |
| `/api/md-seed/seed` | Data seeding | ✓ Intentional | Dev-only endpoint |
| `/api/md-telemetry/test-email` | Test email | ✓ Intentional | Dev-only endpoint |
| `/api/md-telemetry/ingest` | Telemetry ingestion | ⚠️ Needs review | May be public API |
| `/api/md-stream/live` | Live streaming | ⚠️ Needs review | Check if should be team-scoped |

---

## Phase 1: Data Protection (Ready Now)

### 1.1 Fix Unprotected Analytics Routes
**Files to audit:**
- `/app/api/md-analytics/recovery/route.ts` → Add `getSessionTeamId()` check
- `/app/api/md-optimize/optimizations-context/route.ts` → Scope to team
- `/app/api/md-telemetry/ingest/route.ts` → Check if public or team-scoped

**Owner dashboard requirement:**
- Only `motorsportsdata@gmail.com` can view platform-level analytics
- Team owners can only see their team's metrics

### 1.2 Add Member Management UI
**Pages to build:**
- `/data/team/members` — List team members, remove/reassign roles
- `/data/team/settings` — Team name, billing, danger zone (delete team)

**Components needed:**
- MemberCard (show member info, current role, joined date)
- RemoveMemberDialog (confirm removal)
- RoleSelector (switch coach ↔ mechanic)
- InviteMemberForm (send invite link)

---

## Phase 2: Audit Logging (Recommended)

### 2.1 Create Audit Log Table
```typescript
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id),
  userId: text('user_id'),
  action: varchar('action'), // 'member_removed', 'vehicle_deleted', etc
  resourceType: varchar('resource_type'), // 'member', 'vehicle', 'session'
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'), // context-specific data
  createdAt: timestamp('created_at').defaultNow(),
})
```

### 2.2 Log Critical Actions
Add audit logging to:
- **Member management:** add, remove, role change
- **Data deletion:** vehicles, sessions, work orders
- **Subscription changes:** upgrade, downgrade, cancel
- **Settings changes:** team name, configuration

### 2.3 Create Audit Dashboard
**Page:** `/data/team/audit`
- List all actions on the team
- Filterable by action type, date, user
- Shows: "John (mechanic) deleted Buggy #5 on Jul 13 14:32 UTC"
- Owner can see who deleted what when

---

## Phase 3: Soft Deletes (Optional but Recommended)

### 3.1 Add Soft Delete Fields to Critical Tables
```sql
ALTER TABLE md_vehicles ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE md_vehicles ADD COLUMN deleted_by TEXT;
ALTER TABLE md_vehicles ADD COLUMN deletion_reason TEXT;

ALTER TABLE md_sessions ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE md_sessions ADD COLUMN deleted_by TEXT;

ALTER TABLE md_work_orders ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE md_work_orders ADD COLUMN deleted_by TEXT;
```

### 3.2 Update Queries to Ignore Soft-Deleted Rows
Pattern: `WHERE deleted_at IS NULL AND teamId = ?`

### 3.3 Add Recovery UI
**For team owner:**
- `/data/team/trash` — View recently deleted items
- "Restore" button to recover deleted vehicle/session
- "Permanently Delete" after 30-day retention

---

## Phase 4: Subscription Protection (Quick Win)

### 4.1 Add Role Check to Subscription Mutations
```typescript
export async function assertCanModifySubscription(userId: string, teamId: string) {
  const [member] = await db
    .select({ role: mdTeamMembers.role })
    .from(mdTeamMembers)
    .where(and(
      eq(mdTeamMembers.userId, userId),
      eq(mdTeamMembers.teamId, teamId),
      eq(mdTeamMembers.role, 'owner') // Owner only
    ))
  
  if (!member) {
    throw new Error('Only team owner can modify subscription')
  }
}
```

**Protect these endpoints:**
- POST `/api/md-billing/upgrade` → Require owner
- POST `/api/md-billing/downgrade` → Require owner
- POST `/api/md-billing/cancel` → Require owner

---

## Phase 5: Support Runbook

### Scenario: "A Team Member Left & Deleted Critical Data"

1. **Verify in audit log** → Who deleted what? When?
2. **Check soft deletes** → If recovery window open, restore
3. **Notify team owner** → "Vehicle X deleted by John on [date]"
4. **Offer options:**
   - Auto-restore if within 30 days
   - Manual recovery with owner approval
   - Police investigation if malicious

### Scenario: "Team Member Tried to Cancel Subscription"

1. **Check logs** → Did mutation succeed?
2. **If succeeded:** Reverse charge if within 30 days, alert owner
3. **If failed:** Role check blocked it → No action needed
4. **Alert owner:** "Unauthorized subscription change attempt detected"

### Scenario: "Team Account Compromised"

1. **Owner reports:** "Someone deleted all my vehicles"
2. **Support action:**
   - Reset owner's password
   - Audit log shows all changes during compromise window
   - Restore soft-deleted vehicles
   - Review member list for suspicious additions
   - Optional: Remove all other members, require re-invite

---

## Priority & Timeline

### Week 1: Foundation
- [ ] Fix 8 unprotected analytics routes (2 hours)
- [ ] Create audit log schema (1 hour)
- [ ] Add audit logging to member management (3 hours)

### Week 2: UX
- [ ] Build `/data/team/members` page (4 hours)
- [ ] Build `/data/team/audit` page (3 hours)
- [ ] Add soft delete fields to critical tables (2 hours)

### Week 3: Polish
- [ ] Implement audit UI filters (2 hours)
- [ ] Build `/data/team/trash` recovery page (3 hours)
- [ ] Add subscription protection to billing mutations (2 hours)

### Week 4: Documentation
- [ ] Write support runbook (2 hours)
- [ ] Create user docs for team owners (2 hours)
- [ ] Internal security audit (2 hours)

---

## Success Metrics

- ✅ Platform owner can see all teams (analytics dashboard)
- ✅ Team owner can manage members (add/remove/reassign)
- ✅ All sensitive actions are logged and auditable
- ✅ Data can be recovered if accidentally deleted (30-day window)
- ✅ Only team owner can modify subscription
- ✅ Disgruntled members cannot access/delete team data post-termination
- ✅ Support has runbook for incident response

---

## Security Assumptions

1. **Better Auth session is trustworthy** — Valid sessions authenticate the user
2. **Database queries are parameterized** — No SQL injection possible
3. **Team ID is immutable** — Users cannot change their team membership
4. **Role field is server-set** — Users cannot modify their own role
5. **Timestamps are UTC** — Audit events are chronologically consistent

---

## Questions for Discussion

1. Should team owners be able to see financial/billing history (past invoices)?
2. Should we implement IP-based anomaly detection (alert if login from new country)?
3. Should we send team owner a weekly "Member Activity" digest?
4. Should we implement 2FA for team owner accounts (given control level)?
5. Should we require re-authentication for sensitive actions (delete vehicle)?
