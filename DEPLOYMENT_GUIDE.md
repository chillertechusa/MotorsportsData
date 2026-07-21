# Motorsports Data — Deployment & Launch Guide

---

## DEPLOYMENT SEQUENCE

### Phase 1: IMMEDIATE DEPLOYMENT (TODAY)
```bash
# 1. Final type check
pnpm tsc --noEmit

# 2. Build production bundle
pnpm build

# 3. Run database migrations
pnpm drizzle-kit migrate

# 4. Deploy to Vercel
vercel --prod --scope team_C6VKQdnpQxZrUzTes78djcaN

# 5. Verify deployment
curl https://motorsportsdata.io/api/health
```

### Phase 2: POST-DEPLOYMENT HARDENING (NEXT 3 DAYS)
See "Pre-Deployment Hardening Checklist" section below.

---

## Pre-Deployment Checklist

### Environment Configuration
```bash
# Ensure all required environment variables are set in Vercel project settings:

# Database
NEON_DATABASE_URL=postgresql://...

# Authentication (Better Auth)
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# AI Gateway (Claude Opus for coaching)
AI_GATEWAY_API_KEY=<from Vercel AI Gateway>

# Optional: Device telemetry integrations
# GARMIN_API_KEY, ANUBESPORT_API_KEY, WESTHOLD_API_KEY
```

### Database Preparation
```bash
# Run all Drizzle migrations IN ORDER:
# 1. Initial schema (mdTeams, mdSessions, mdTelemetry, etc.)
# 2. Live telemetry tables (md_live_sessions, md_live_telemetry)
# 3. Time-series optimization (composite indexes)

# In Neon console or via `pnpm drizzle-kit migrate`:
pnpm drizzle-kit migrate
```

### Verification Tests (Pre-Deployment)

**Database Connectivity**
```bash
# Test query performance
curl -X GET http://localhost:3000/api/md-sessions/test \
  -H "Authorization: Bearer test-token"

# Should return <100ms response time
```

**Sentry Integration**
```bash
# Verify Sentry is capturing errors
curl -X POST http://localhost:3000/api/sentry-test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check Sentry dashboard for test error capture
```

**Live Telemetry Ingestion**
```bash
# Test device ingest endpoint
curl -X POST http://localhost:3000/api/md-telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "test-token",
    "deviceId": "raceboxv2_1234",
    "telemetry": [{
      "timestamp": 1625000000001,
      "lapNumber": 1,
      "speed": 45.2,
      "throttle": 75,
      "tirePressFront": 13.5,
      "tirePressRear": 14.2
    }]
  }'

# Should return 200 OK with alert summary
```

---

## Deployment Steps

### 1. Push to GitHub (If Using Git Deployment)
```bash
git add -A
git commit -m "Phase 1 Complete: Motorsports Data Platform"
git push origin main
```

### 2. Deploy to Vercel
```bash
# Option A: Via CLI (immediate deploy)
pnpm install
pnpm build
vercel --prod --scope team_C6VKQdnpQxZrUzTes78djcaN

# Option B: Via GitHub Actions (auto-deploy on push)
# Already configured in Vercel project settings
```

### 3. Verify Deployment
```bash
# Check live URL
curl https://motorsportsdata.io/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-07-10T...",
#   "database": "connected",
#   "sentry": "enabled"
# }
```

### 4. Run Post-Deployment Tests
```bash
# Smoke test all critical paths
# 1. Coach login → dashboard → AI briefing
# 2. Session comparison → export PDF
# 3. Live telemetry ingestion → coach dashboard
# 4. Mechanic setup coaching flow
```

---

## Post-Deployment Operations

### Monitoring (First 24 Hours)

**Sentry Dashboard**
- Monitor error spike (expect <5 errors per 1000 requests)
- Check performance metrics (API p99 <500ms, database p99 <200ms)
- Review breadcrumb trails for failed user flows

**Database Monitoring (Neon)**
- Check connection pool utilization (target <50% of max)
- Monitor slow query log (alert if any query >500ms)
- Verify backup is running (automatic daily)

**Application Logs**
```bash
# Tail live logs
vercel logs motorsportsdata.io --tail

# Filter for errors
vercel logs motorsportsdata.io --tail | grep ERROR
```

### First Coach Onboarding

1. **Manually create first team** (via admin panel or database seed)
2. **Invite first coach** with email
3. **Have coach complete 2FA setup**
4. **Walk through onboarding flow:**
   - Add rider vehicle
   - Pair telemetry device (use demo data for testing)
   - Create session
   - Run session comparison
   - Export PDF
   - Test live coaching with demo data

5. **Collect feedback:**
   - AI briefing accuracy?
   - Session export quality?
   - Live telemetry responsiveness?

---

## Scaling & Operations (After Launch)

### Database Tuning
If queries start exceeding 300ms:
```sql
-- Check query execution times
EXPLAIN ANALYZE SELECT ... FROM md_sessions WHERE team_id = ... ORDER BY session_date DESC LIMIT 10;

-- Add additional index if needed
CREATE INDEX CONCURRENTLY idx_sessions_team_date ON md_sessions(team_id, session_date DESC);
```

### Live Telemetry Optimization
If device ingestion latency exceeds 200ms:
1. Check Neon connection pool (scale up if needed)
2. Verify batch size on ingest endpoint (reduce from 100 to 50 if DB CPU spikes)
3. Add caching layer (Redis) for frequently-accessed telemetry (Phase 2)

### Backup & Disaster Recovery
- Neon automatic backups: daily (7-day retention)
- Manual backup before major changes:
  ```bash
  pg_dump -h db.xxx.neon.tech -U user dbname > backup_2026_07_10.sql
  ```

---

## Rollback Procedure (If Needed)

### Immediate Rollback (Git Deployment)
```bash
git revert <commit-hash>
git push origin main
# Vercel auto-deploys previous version (2-3 min)
```

### Database Rollback
```bash
# If migration caused issues:
pnpm drizzle-kit drop  # Careful: deletes schema
pnpm drizzle-kit migrate --to <previous-migration>

# Or restore from Neon backup:
# 1. Go to Neon dashboard
# 2. Branch from backup point
# 3. Verify data integrity
# 4. Point app to backup branch
```

---

## Ongoing Maintenance

### Weekly
- [ ] Review Sentry error dashboard (check for new error patterns)
- [ ] Check database query performance (any queries creeping toward 500ms?)
- [ ] Monitor team/user growth metrics

### Monthly
- [ ] Review cost optimization (Vercel, Neon, Sentry usage)
- [ ] Clean up old live sessions (>30 days, move to archive if needed)
- [ ] Collect coach feedback for Phase 2 roadmap

### Quarterly
- [ ] Full disaster recovery drill (test backup restore)
- [ ] Security audit (check auth flows, API permissions)
- [ ] Performance profiling (identify optimization opportunities)

---

## Pre-Deployment Hardening Checklist (Post-Deploy, Days 1-3)

### SECURITY AUDIT (Day 1)

**Authentication & Authorization**
- [ ] Verify Better Auth session tokens are HttpOnly + Secure + SameSite
- [ ] Test 2FA enforcement on manager accounts (required)
- [ ] Verify RLS policies block cross-team data access (test with mock data)
- [ ] Confirm logged-out users cannot access /data/* routes
- [ ] Check that API keys/secrets are not exposed in client code

**Data Isolation**
- [ ] Coaches can only see their own team's sessions
- [ ] Riders cannot access other riders' data via RLS
- [ ] IP Vault templates are encrypted (never plaintext)
- [ ] Audit logs are immutable (INSERT only)

**API Security**
- [ ] Rate limiting active: auth endpoints 10/5min, telemetry 10/sec
- [ ] All API endpoints require authentication
- [ ] Error responses don't leak sensitive data
- [ ] CORS restricted to motorsportsdata.io domain
- [ ] HSTS headers enabled (strict transport security)

---

### PERFORMANCE STRESS TEST (Day 2)

**Database Queries**
- [ ] Team trends query: <500ms response time
- [ ] Live telemetry ingest: handle 10 updates/sec per device
- [ ] Session export PDF: completes in <10 seconds for 50-session team

**Concurrent Load Simulation**
- [ ] 100 concurrent coaches viewing dashboards (no response time degradation)
- [ ] Monitor Neon CPU + connection count during load test
- [ ] Verify response times stay <1s under peak load

**API Load Testing**
- [ ] Simulate 50 simultaneous telemetry ingests
- [ ] Verify no packet loss or dropped connections
- [ ] Monitor database write latency

---

### DATA BACKUP & RECOVERY (Day 3)

**Backup Verification**
- [ ] Neon automatic daily backups enabled
- [ ] Test restore procedure (restore to staging, verify data integrity)
- [ ] Confirm audit logs are preserved in backup
- [ ] Encrypted data survives restore cycle

**Disaster Recovery**
- [ ] Document rollback procedure (git revert + redeploy)
- [ ] Document database recovery procedure
- [ ] Create incident response checklist
- [ ] Verify Sentry alerting threshold set (e.g., error rate > 5%)

---

### COMPLIANCE CHECK (Ongoing)

**Data Privacy**
- [ ] TOS acceptance logged on signup (immutable)
- [ ] Privacy policy covers AI training disclosure
- [ ] GDPR: data export endpoint tested
- [ ] Rider PII masked in Sentry replays

**Audit Trail**
- [ ] IP Vault access logs are final (cannot be edited)
- [ ] Setup change logs immutable
- [ ] All admin actions timestamped + attributed

---

### GO/NO-GO DECISION

**Ship Production if:**
- ✅ All security tests pass (no data leaks, auth working)
- ✅ Performance <500ms at p99 under load
- ✅ Backup/restore successful
- ✅ Sentry receiving all error types
- ✅ Rate limiting working

**Rollback if:**
- ❌ RLS bypass discovered (cross-team data leak)
- ❌ Authentication bypass found
- ❌ Performance <500ms not achievable
- ❌ Database corruption detected

---

## Support & Troubleshooting

### Common Issues

**"Database connection pool exhausted"**
- Cause: Too many concurrent requests
- Fix: Scale Neon compute (Settings → Compute)
- Prevention: Add connection pooling layer (Phase 2)

**"Live telemetry delays increasing over time"**
- Cause: Telemetry table growing; indexes degrading
- Fix: Run `REINDEX idx_live_telemetry` on off-peak hours
- Prevention: Archive old sessions monthly

**"Sentry quota exceeded"**
- Cause: Error spam or high sample rate
- Fix: Lower `tracesSampleRate` in sentry.server.config.ts (currently 10%)
- Prevention: Monitor error budget weekly

**"Coach AI returns generic responses (not grounded)"**
- Cause: Context brief endpoint failing silently
- Fix: Check `/api/md-coach/context-brief` in Sentry
- Prevention: Add unit tests for context data fetching

---

## Launch Success Criteria

✅ **All go/no-go criteria:**
- No type errors in production build
- Sentry capturing errors and performance metrics
- Live telemetry end-to-end working (device → dashboard → AI)
- All tier gating working (coaches see IP Vault, mechanics see setup coaching)
- Session export PDF generation working
- Database queries <500ms at p99
- Authentication flow (signup → 2FA → dashboard) working end-to-end

**You're ready to ship.** 🚀
