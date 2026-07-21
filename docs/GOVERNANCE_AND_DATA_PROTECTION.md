# Motorsports Data Governance & Data Protection Plan

## Executive Summary

This document outlines the three-tier hierarchy for platform ownership, team control, and member access — with safeguards to protect team owners' data if disgruntled members attempt unauthorized access or data exfiltration.

---

## Part 1: Ownership Hierarchy

### Level 1: Platform Owner
**Who:** `motorsportsdata@gmail.com` (set in `MD_OWNER_EMAILS` environment variable)

**Control & Permissions:**
- Full platform access via `/data/owner/*` pages
- Can view aggregate analytics, system health, user counts, revenue
- Can manually trigger system actions (cron jobs, alerts, exports)
- Access to backend financials dashboard
- Does NOT automatically have access to individual team data (data segregation enforced)

**Access Method:** Checks `MD_OWNER_EMAILS` allowlist at login via `getMdOwner()`

---

### Level 2: Team Owner (Per-Team Admin)
**Who:** The first rider/mechanic/team lead who signs up for a tier

**Control & Permissions:**
- Owns one team's subscription (team tied to billing)
- Can see all team members, their roles, and invite new members
- Can remove members from the team
- Can see all team data: vehicles, sessions, work orders, parts vault
- Receives billing emails and renewal notices
- Can modify team name/settings
- **Full control of team's data lifecycle**

**Data Isolation:** Team owner can only access their own `teamId` data (enforced at DB query level)

**Role:** `owner` in `mdTeamMembers` table

---

### Level 3: Team Members (Per-Team Contributors)
**Roles within team:**

| Role | Use Case | Capabilities |
|------|----------|--------------|
| **owner** | Primary decision-maker | Full team access, manage members, see all data |
| **coach** | Coaching staff | Coaching features only, can view team's rider data |
| **mechanic** | Maintenance crew | Work orders, parts vault, setup analysis |
| **mechanic_coach** | Dual-role staff | Mechanic + coach capabilities |

**Data Access:** Scoped to `teamId` — members cannot access other teams' data

---

## Part 2: Data Segregation & Safety Guards

### Problem: Disgruntled Member Risk

**Scenarios:**
1. Mechanic fired → tries to delete all vehicle/parts data
2. Coach leaves → attempts to download entire session database
3. Employee terminated → tries to transfer team subscription
4. Contractor disgruntled → attempts mass data export for competitive intel

### Protection Mechanisms

#### Guard 1: Role-Based Access Control (RBAC)
- Each data operation checks user's role within the team
- Delete/export permissions restricted to owner only
- **Implementation:** `assertRoleAccess()` on sensitive mutations

#### Guard 2: Team ID Scoping (Data Isolation)
- Every query includes `WHERE teamId = <user_team>`
- Database enforces this at the query level
- Impossible for mechanic to see Race Team A's data while in Race Team B
- **Pattern:** All API routes call `getSessionTeamId()` first

```typescript
// Example: Only return data for user's team
const [session] = await getSessionTeamId()
const sessions = await db.select().from(mdSessions)
  .where(and(
    eq(mdSessions.teamId, session.teamId),  // ENFORCED
    eq(mdSessions.vehicleId, vehicleId)
  ))
```

#### Guard 3: Audit Logging
- All sensitive actions logged with timestamp, user, action
- Deletions (vehicles, sessions, parts) logged
- Member role changes logged
- Subscription changes logged
- **Future:** Admin can view audit trail for disputed events

#### Guard 4: Soft Deletes on Critical Data
- When team owner deletes vehicle/session, mark as `deletedAt` (don't destroy)
- Recoverable for 30 days
- Owner can restore or permanently purge
- Audit trail preserved

#### Guard 5: Subscription Control
- Team subscription tied to team, not individual member
- Only platform owner + team owner can modify billing
- Members cannot cancel/downgrade team subscription
- Prevent disgruntled mechanic from canceling paying race team

---

## Part 3: Recommended Implementation Plan

### Phase 1: Formalize Team Owner Role (DONE)
- [x] Platform owner (`motorsportsdata@gmail.com`) set in env
- [x] Team owner role established in schema (`mdTeamMembers.role = 'owner'`)
- [x] Data scoping enforced on all API routes

### Phase 2: Build Member Management UI (RECOMMENDED)
**Owner Dashboard Access:**
- View all team members + roles
- Remove member from team (revokes all access)
- Reassign roles (coach → mechanic, etc)
- Invite new members with specific roles

**Example Flow:**
1. Owner goes to `/data/team/members`
2. Sees list: "John (mechanic, joined 3mo ago)" | Remove | Change Role
3. Clicks Remove → John's access revoked immediately
4. John still has his user account but loses team access

### Phase 3: Implement Audit Logging (RECOMMENDED)
**Create `auditLog` table:**
```typescript
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey(),
  teamId: uuid('team_id'),
  userId: text('user_id'),
  action: varchar('action'), // 'vehicle_deleted', 'member_removed', etc
  resourceId: uuid('resource_id'),
  resourceType: varchar('resource_type'), // 'vehicle', 'session', 'member'
  metadata: jsonb('metadata'), // old_role, new_role, reason, etc
  createdAt: timestamp('created_at').defaultNow(),
})
```

**Owner can review:** `/data/team/audit` → sorted by recent actions

### Phase 4: Add Soft Deletes (OPTIONAL but RECOMMENDED)
**Pattern for critical tables:**
```typescript
export const mdVehicles = pgTable('md_vehicles', {
  // ... existing fields
  deletedAt: timestamp('deleted_at'), // NULL = active, SET = soft deleted
  deletedBy: text('deleted_by'), // user ID who deleted
  deletionReason: text('deletion_reason'), // for audit
})
```

**All queries become:** `WHERE deletedAt IS NULL AND teamId = ?`
**Recovery:** Owner can `UPDATE mdVehicles SET deletedAt = NULL WHERE id = ?`

### Phase 5: Protect Subscription Control (RECOMMENDED)
**Add check on all subscription mutations:**
```typescript
// Prevent members from modifying subscription
export async function assertCanModifySubscription(userId: string, teamId: string) {
  const [member] = await db
    .select({ role: mdTeamMembers.role })
    .from(mdTeamMembers)
    .where(and(
      eq(mdTeamMembers.userId, userId),
      eq(mdTeamMembers.teamId, teamId),
      eq(mdTeamMembers.role, 'owner') // OWNER ONLY
    ))
  
  if (!member) throw new Error('Only team owner can modify subscription')
}
```

---

## Part 4: Data Ownership Contract

**What Team Owner Controls:**
- All team member access
- All data: vehicles, sessions, work orders, parts, coaching logs
- Subscription: upgrade, downgrade, cancel
- Data exports: owner can request full team data export
- Data deletion: owner can delete vehicles/sessions

**What Team Owner Cannot:**
- Modify platform settings
- Access other teams' data
- Cancel another team's subscription
- View platform finances/revenue

**What Members Can:**
- Create sessions, work orders, coaching logs (their own creations)
- View team data relevant to their role
- Create/edit their own profiles
- Leave team voluntarily (but data stays with team)

**What Platform Owner Can:**
- View all teams and aggregate analytics
- Manual system actions (backups, migrations)
- Suspend teams for ToS violations
- Access backend financials
- Support/troubleshoot team issues (with permission audit trail)

---

## Part 5: Operational Safeguards

### When Terminating a Team Member:

1. **Owner removes member** → Member immediately loses login access
2. **Data remains** → All their created sessions/work orders stay in team vault
3. **Audit logged** → "John (mechanic) removed by Owner on 2026-07-13"
4. **Fallback:** Owner can contact support to restore member if terminated in error (within 30 days)

### If Team Gets Compromised:

1. **Owner contacts support:** "My account was hacked"
2. **Support action:** Reset owner's password, audit recent changes
3. **Audit review:** Show all changes made while account was compromised
4. **Soft delete recovery:** Restore any deleted vehicles/sessions
5. **Member review:** Check if suspicious members were added

### If Disgruntled Member Tries Data Exfiltration:

1. **Member attempts mass download** → API rate limits kick in (100 req/min)
2. **Owner gets alert** → "Unusual API activity detected"
3. **Owner removes member** → All access revoked immediately
4. **Platform logs request IPs** → Support can investigate

---

## Part 6: Implementation Checklist

- [ ] Verify `motorsportsdata@gmail.com` is set as `MD_OWNER_EMAILS` in production
- [ ] Audit all API routes check `getSessionTeamId()` (no cross-team leaks)
- [ ] Build member management UI (`/data/team/members`)
- [ ] Implement audit logging table + schema migration
- [ ] Create owner audit view (`/data/team/audit`)
- [ ] Add soft delete support to `mdVehicles`, `mdSessions`, `mdWorkOrders`
- [ ] Protect subscription mutations with role check
- [ ] Write support runbook for "compromised account" scenarios
- [ ] Create ToS section: "Team data owned by team owner, cannot be accessed by individual members post-termination"

---

## Next Steps

1. **Immediate:** Confirm `motorsportsdata@gmail.com` set in production env
2. **Phase 2:** Build member management UI (owner can remove/reassign roles)
3. **Phase 3:** Add audit logging so you can see who did what when
4. **Phase 4:** Implement soft deletes for data recovery

This architecture ensures:
- ✅ Platform owner has financial control
- ✅ Team owners own their data and control member access
- ✅ Data is isolated by team (no cross-contamination)
- ✅ Disgruntled members cannot exfiltrate or corrupt team data
- ✅ All actions are auditable and reversible (soft deletes)
