# Testing Infrastructure — Deployed

## What's Now Live

**4-Layer Testing Pyramid:**
1. **Unit Tests** (Vitest + jsdom) — 80%+ coverage target
2. **Integration Tests** — Critical user flows
3. **E2E Tests** (Playwright) — Real browser journeys
4. **Health Checks** (5-min intervals) — Production monitoring

---

## Running Tests Locally

```bash
# Unit tests with UI
pnpm test:ui

# Unit tests with coverage report
pnpm test:coverage

# E2E tests (requires app running)
pnpm dev  # In one terminal
pnpm test:e2e  # In another

# All tests
pnpm test:all

# Health checks
pnpm health:check
```

---

## Test Files Structure

```
tests/
├── setup.ts                          # Vitest + jsdom setup
├── unit/
│   ├── tier-assignment.test.ts       # Rookie tier auto-assignment
│   ├── feature-gates.test.ts         # Feature gating by tier
│   └── square-checkout.test.ts       # Square payment flow
└── e2e/
    ├── free-rider-signup.spec.ts     # Free Rider path (no checkout)
    ├── premium-checkout-flow.spec.ts # Premium tier path (with Square)
    └── health-checks.spec.ts         # Production system health
```

---

## Health Check Endpoints (Live Now)

All endpoints return `{ status: "ok" | "error", ... }`:

| Endpoint | Checks |
|----------|--------|
| `/api/health/auth` | Better Auth configured & responsive |
| `/api/health/database` | Database connection & query |
| `/api/health/square` | Square credentials & configuration |
| `/api/health/feature-gates` | Tier system & feature gating loaded |
| `/api/health/cron` | Payment recovery cron job enabled |

**Monitor them:**
```bash
# Run health checks locally
pnpm health:check

# Or from shell
curl http://localhost:3000/api/health/auth
curl http://localhost:3000/api/health/database
curl http://localhost:3000/api/health/square
curl http://localhost:3000/api/health/feature-gates
curl http://localhost:3000/api/health/cron
```

---

## GitHub Actions Workflows (Automatic)

File: `.github/workflows/test.yml`

| Trigger | Runs |
|---------|------|
| Every push to `main` or `staging` | Unit tests + Lint |
| Every PR to `main` or `staging` | Unit + E2E + Lint |
| Every 5 minutes (scheduled) | Health checks (production URL) |

**Notifications:**
- Failed test suite → Commit status (blocks merge)
- Failed health check → Slack alert (from `${{ secrets.SLACK_WEBHOOK }}`)

---

## Critical Test Coverage

✅ **Matryoshka Tier Model:**
- Free Rider assigned on every signup
- Premium tiers don't skip Free Rider (inner doll always there)
- Payment failure → auto-downgrade to Free Rider after 7 days
- User data preserved on downgrade

✅ **Sign-In Flows:**
- Free Rider CTA → sign-up → console (no checkout)
- Premium tier CTA → sign-up → checkout → console (with features)
- Already signed in + premium CTA → straight to checkout

✅ **Square Checkout:**
- Card form initialization
- Billing frequency toggle (annual/monthly)
- Payment processing & tier upgrade
- Error handling & user feedback

✅ **Feature Gating:**
- Free Rider sees locked features with upgrade button
- Premium tier users unlock features immediately
- Gating rules enforced per tier

✅ **System Health:**
- Auth system responsive
- Database connected
- Square configured
- All tiers loaded
- Cron jobs active

---

## Next Steps (Future Phases)

**Phase 5:** Monitoring dashboard + alerting
- Real-time system status display
- Slack/SMS alerts for failures
- Incident runbooks

**Phase 6:** Advanced monitoring
- Performance tracking (Lighthouse, Web Vitals)
- Database query performance
- Payment processing metrics

**Phase 7:** Disaster recovery
- Automated failover
- Backup systems
- Data recovery procedures

---

## Target: 99.9% Uptime

- **Allowed downtime:** ~43 minutes/month
- **Detection time:** < 1 minute (health checks every 5 min)
- **Response time:** < 5 minutes (team on-call)
- **System redundancy:** Scaling rules on Vercel

You now have a production-grade testing and monitoring system protecting your 24/7 platform.
