# Account Hierarchy & Governance Model

## Five-Level Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM OWNER                               │
│              motorsportsdata@gmail.com                           │
│  Controls: All financials, system health, support escalations   │
│  Access: All teams (audit only), analytics, billing             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────┬──────────────────┐
                              │                 │                  │
        ┌─────────────────────▼──────┐ ┌────────▼────────┐  ┌──────▼───────────┐
        │    TEAM OWNER               │ │  AGENT          │  │  INDIVIDUAL      │
        │ (First Paid Subscriber)     │ │  (Cross-team)   │  │  RIDER           │
        │                             │ │                 │  │  (Free or Paid)  │
        │ • Race Team Owner           │ │ • Represents    │  │                  │
        │ • Factory Operations        │ │   multiple      │  │ • Controls own   │
        │ • Mechanic Business Owner   │ │   riders/       │  │   Free account   │
        │                             │ │   teams         │  │ • Can join teams │
        │ Controls:                   │ │ • Works across  │  │ • Owns personal  │
        │ • All team data             │ │   team          │  │   data           │
        │ • Member roles              │ │   boundaries    │  │                  │
        │ • Subscription              │ │                 │  │ Protections:     │
        │ • Billing/payment           │ │ Controls:       │  │ • Personal data  │
        │                             │ │ • Contract work │  │   portable       │
        │ Can delete:                 │ │ • Prospect      │  │ • Can export     │
        │ • Members (with audit)      │ │   info          │  │ • Right to be    │
        │ • Data (soft-deleted)       │ │ • Deal terms    │  │   forgotten      │
        │ • Sessions/vehicles         │ │                 │  │                  │
        │                             │ │ Cannot:         │  │                  │
        │ Cannot:                     │ │ • Access other  │  │                  │
        │ • Delete own subscription   │ │   agent's deals │  │                  │
        │ • Access other teams        │ │ • View full     │  │                  │
        │                             │ │   team roster   │  │                  │
        └─────────────────────────────┘ └─────────────────┘  └──────────────────┘
                              │                                      │
                              │                                      │
        ┌─────────────────────▼──────────────────────────────────────▼─────────┐
        │                   TEAM MEMBERS                                       │
        │   (Owner, Coach, Mechanic, Mechanic_Coach)                          │
        │                                                                      │
        │ Role: owner           Role: coach         Role: mechanic            │
        │ • Full control        • View team data    • Work orders             │
        │ • Add/remove          • Accountability    • Setup analysis          │
        │ • Manage subscription • Training          • Part vault              │
        │ • See billing         • Video analysis    • Performance delta       │
        │                       • Fitness tracking  • Cannot see billing      │
        │                       • Cannot delete     • Cannot delete data      │
        │                                           • Cannot manage members   │
        └────────────────────────────────────────────────────────────────────┘
```

---

## Data Ownership Model

### **Tier 1: Platform Owner (motorsportsdata@gmail.com)**

**Access Pattern:** Audit-only + backend control
- **See:** Dashboard of all teams (anonymized: "Team-123", "Team-456")
- **Monitor:** System health, revenue, churn, compliance
- **Control:** Payment processing, support overrides, system emergency access
- **Cannot:** Access team data without explicit audit reason + logging

**Example:** "Support case #12345: Grant emergency access to Team-X's data for dispute resolution"

---

### **Tier 2: Team Owner**

**Subscription Owner** — the person who paid for the tier

**Full Control:**
- All team data: vehicles, sessions, analytics, work orders
- All team members and their roles
- Subscription and billing changes
- Can terminate members and revoke access

**Protections Against Disgruntled Members:**

| Action | Prevention |
|--------|-----------|
| Mechanic deletes all work order history | Role check: only owner can delete |
| Coach downloads entire season of data | Audit log: tracks every export |
| Member modifies another member's sessions | Cross-team check fails (teamId mismatch) |
| Terminated employee tries to access data | Auth revoked immediately on member removal |
| Someone pretends to be team owner | Session validation + multi-owner view for Factory Rig |

**Responsibilities:**
- Approve/deny new members
- Assign roles (coach, mechanic, etc.)
- Make billing decisions
- Own data export/deletion compliance

---

### **Tier 3: Agents (Professional Tier)**

**Multi-Team Access Model** — Agents work across multiple teams

**What they control:**
- Their own contract negotiations (stored in agent-specific records)
- Prospect scouting information (they own this data)
- Communication logs with riders they represent
- Deal terms and terms they've negotiated

**What they cannot see:**
- Other agents' deal info
- Internal team/mechanic data (work orders, setup notes)
- Full team roster (only riders they represent)
- Team subscription details
- Payroll/compensation of team

**Example:** Agent "John" represents Rider-A and Rider-B
- ✅ Can see Rider-A's performance (he negotiated the contract)
- ✅ Can view Rider-A's prospects for transfer
- ✅ Can access contract terms he brokered
- ❌ Cannot see if Mechanic-C's work orders on Rider-A's bike
- ❌ Cannot see what Coach-D is texting Rider-A

**Data Security:**
- Agent data stored in `agent_contracts` table (separate from team data)
- Agent cannot bulk-export rider data
- Cannot modify rider's personal performance data

---

### **Tier 4: Team Members (Owner, Coach, Mechanic, Mechanic_Coach)**

**Role-Based Within Team:**

| Role | Can See | Can Edit | Can Delete |
|------|---------|----------|-----------|
| **Owner** | Everything | Everything | Everything (with audit) |
| **Coach** | Team analytics, accountability, video | Coaching notes, video tags | Own notes only |
| **Mechanic** | Work orders, setup, parts | Work orders, setup notes | Own work orders (soft-delete) |
| **Mechanic_Coach** | All coach + mechanic | All coach + mechanic | Role-appropriate |

**Protections:**
- Members see data only for their teamId
- Cannot access other teams' data (even if in multiple teams)
- Cannot see billing/subscription
- Deletion is soft-delete (recoverable for 30 days)

---

### **Tier 5: Individual Riders (Free or Paid)**

**Ownership Model:** Riders own their personal profile and session data

**If Rider is Free (Rookie tier):**
- Personal account: riders own their vehicles, sessions, analytics
- Can export all their data
- If they join a team: data is visible to team owner but rider retains ownership
- Can leave team without losing data (data reverts to personal)
- Data portability: can download all sessions as CSV/JSON

**If Rider joins a Team (as a member):**
- Team owner can see rider's sessions (competitive advantage)
- Rider data is still owned by the individual rider
- Rider can see team's collective analytics
- When rider leaves team: personal data stays with rider, team loses visibility

**Data Portability:**
- Riders can export their sessions anytime
- Riders can delete their own sessions (soft-delete)
- GDPR compliance: right to be forgotten

---

## Cross-Team Scenarios

### **Scenario 1: Rider moves from Team A to Team B**

```
Before:
  Rider data lives in Team-A
  Team-A Coach sees all rider sessions
  
Transition:
  Rider sends removal request to Team-A Owner
  Data soft-deleted from Team-A view (recoverable for 30 days)
  
After:
  Rider joins Team-B
  Team-B Owner sees rider's NEW sessions only
  Team-A Owner can still recover rider's old data (30-day window)
  Rider can export all old sessions before leaving
```

### **Scenario 2: Mechanic is fired from Team A**

```
Before firing:
  Mechanic has access to Team-A work orders and setup notes
  
During firing process:
  Team Owner removes mechanic member record
  System immediately revokes auth session
  Audit log: "Mechanic John removed at 2026-07-13 14:23 UTC"
  
After firing:
  Mechanic cannot access Team-A data
  All work orders they created remain (immutable)
  Soft-deleted data is still recoverable by Team Owner
  Mechanic cannot bulk-export data they created
```

### **Scenario 3: Agent negotiates deal across teams**

```
Agent represents Rider-X at Team-A, wants to move to Team-B

Agent controls:
  • Contract terms (stored in agent database)
  • Prospect info (Team-B capabilities, salary offer)
  • Communication with both teams
  
Agent cannot:
  • Delete Rider-X's historical session data from Team-A
  • Modify Rider-X's past performance metrics
  • Access confidential team data (part costs, mechanic salary, etc.)

Team Owners can see:
  • Agent representing Rider-X (metadata only)
  • When Rider-X might leave (from audit log if agent requests exports)
```

---

## Three-Step Incident Response Playbook

### **Step 1: Disgruntled Member Attempts Sabotage**

Detection:
```sql
-- Alert if non-owner attempts bulk delete
SELECT * FROM audit_logs 
WHERE action = 'DELETE' 
  AND role != 'owner' 
  AND count > 100 
  AND team_id = $1
```

Response:
1. Immediate auth revocation
2. Audit log review
3. Data recovery from soft-delete
4. Team owner notified via SMS + email

### **Step 2: Compromised Account**

Detection:
- Multiple failed login attempts → account lockout
- Access from new IP → verification required
- Bulk data export → audit flag

Response:
1. Reset password force-required
2. Force re-authenticate all team members
3. Review audit log of compromised session
4. Support escalation to platform owner

### **Step 3: Data Breach / Third-party Subpoena**

Response:
1. Preserve audit log (immutable)
2. Identify affected data scope
3. Notify team owner + affected riders
4. Platform owner coordinates legal response

---

## Implementation Phases

### Phase 1 (Week 1): Foundation
- [ ] Verify platform owner (motorsportsdata@gmail.com) in MD_OWNER_EMAILS
- [ ] Audit 8 unprotected API routes
- [ ] Create audit_logs table

### Phase 2 (Week 2): Member Management
- [ ] Build `/data/team/members` UI
- [ ] Implement member removal + auth revocation
- [ ] Add role assignment UI

### Phase 3 (Week 3): Soft Deletes
- [ ] Add deleted_at column to vehicles, sessions, work_orders
- [ ] Implement recovery UI (Team Owner only)
- [ ] 30-day retention policy

### Phase 4 (Week 4): Agent Governance
- [ ] Create agent_contracts table
- [ ] Implement cross-team visibility rules
- [ ] Agent dashboard + audit log

### Phase 5 (Ongoing): Monitoring
- [ ] Support runbook for incident response
- [ ] Quarterly security audit
- [ ] GDPR compliance review

---

## Key Safeguards Summary

✅ **Platform Owner:** Can see all teams (audit only), cannot access data without logging  
✅ **Team Owner:** Full control of their team data, protected from disgruntled members  
✅ **Agents:** Multi-team access scoped to contracts they own  
✅ **Team Members:** Role-based access, cannot see billing, deletions are recoverable  
✅ **Riders:** Own their personal data, portable, GDPR-compliant  
✅ **Audit Trail:** Every action logged with user/timestamp/action for forensics  
✅ **Soft Deletes:** 30-day recovery window prevents accidental data loss  
✅ **Cross-Team Isolation:** Members cannot see other teams' data  
