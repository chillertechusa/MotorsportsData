# Phase 4: Real-Time Live HR Coaching — Terra API Integration

## Executive Summary

Integrate Terra API to enable real-time heart rate monitoring during active race sessions. Coaches see live HR from multiple riders on their iPad during races, enabling tactical coaching decisions based on live cardiovascular data.

**Status:** Platform selected (Terra API)
**Time to PoC:** 1 week (24 hours dev + 3 days testing)
**Competitive Status:** UNIQUE in motorsports
**Coach Value:** Game-changer for elite programs

---

## Why Terra API (Not Pulsoid)

**Critical Difference:**

Pulsoid = Streaming overlay (1 person, 1 device, close proximity)
Terra API = B2B health data aggregation (multi-user, multi-device, remote)

**MD Use Case:**
- Coach at pit area with iPad (NOT connected to rider's wearable)
- Rider at track 50+ miles away (device synced to cloud independently)
- Monitor 3-10 riders simultaneously
- All riders' devices are their personal Garmin/Polar/Apple watches

**Pulsoid Blocker:**
```
Pulsoid requires: Coach's Phone ← Bluetooth → Rider's Garmin
Problem: Coach doesn't have rider's device. They're 50 miles away.
Result: Impossible to implement.
```

**Terra Solution:**
```
Rider A's Garmin → Garmin Cloud → Terra → MD → Coach's iPad
Rider B's Apple → Apple Health → Terra → MD → Coach's iPad
Rider C's Polar → Polar Cloud → Terra → MD → Coach's iPad

Perfect: All devices sync independently to cloud, Terra aggregates.
```

**Why Terra is Correct:**
- Designed for exactly this (health data aggregation for apps)
- 500+ device sources (covers all motocross riders)
- Real-time WebSocket (live during races)
- Multi-user OAuth (each rider authorizes once)
- Remote monitoring (no proximity requirement)
- Enterprise-grade (99.9% uptime SLA)

---

## Architecture

### Data Flow (Terra)

```
Wearable Ecosystem:
  Garmin Device → Garmin Cloud (auto-sync)
  Apple Watch → Apple HealthKit (auto-sync)
  Polar Device → Polar Cloud (auto-sync)
  Oura Ring → Oura Cloud (auto-sync)

Terra Aggregation Layer:
  All clouds → Terra API (unified interface)
                    ↓
Terra normalizes: {user_id, heart_rate, timestamp}
                    ↓
Real-Time WebSocket:
  Terra → MD Platform (/api/terra/webhook)
                    ↓
MD Broadcast:
  /ws/session/[sessionId] → Coach's iPad
                    ↓
Live HR Widget (Coach console):
  Rider A: 168 BPM ↗
  Rider B: 156 BPM →
  Rider C: 182 BPM ↗↗ [Alert]
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Coach Console (iPad)                                         │
│ ┌──────────────────┐  ┌──────────────────────────────────┐ │
│ │ Session Control  │  │ Live HR Monitoring               │ │
│ │ - Start/Stop     │  │ ┌──────────────────────────────┐ │ │
│ │ - Riders list    │  │ │ Rider A: HR 168 BPM ↗        │ │ │
│ │ - Status         │  │ │ Rider B: HR 156 BPM →        │ │ │
│ │                  │  │ │ Rider C: HR 182 BPM ↗↗       │ │ │
│ │                  │  │ │ [Alert: HR spike Rider C]    │ │ │
│ │                  │  │ └──────────────────────────────┘ │ │
│ └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓ (WebSocket: /ws/session/[sessionId])
┌─────────────────────────────────────────────────────────────┐
│ MD Platform Backend                                         │
│ ┌──────────────────────────────────────────────────────────┐
│ │ /api/terra/webhook                                       │
│ │ - Receive live HR from Terra                            │
│ │ - Validate signature                                     │
│ │ - Store in Redis                                        │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ WebSocket Server                                         │
│ │ - Broadcast HR to all coaches watching session           │
│ │ - Multi-rider aggregation                               │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ Redis Cache                                              │
│ │ - terra:hr:[sessionId]:[riderId] = {hr, ts, max, avg}   │
│ │ - 1-min rolling window for graphing                      │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ Session Tracking                                         │
│ │ - Know which sessions are active                         │
│ │ - Know which riders are in each session                  │
│ └──────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
         ↑ (Terra Cloud: Real-time webhook)
┌─────────────────────────────────────────────────────────────┐
│ Terra API (Health Data Aggregator)                          │
│ - Receives HR from 500+ wearable sources                   │
│ - Normalizes all devices to same format                    │
│ - Sends webhook: {user_id, hr, timestamp}                 │
│ - Supports real-time WebSocket for streaming              │
└─────────────────────────────────────────────────────────────┘
         ↑ (Cloud APIs)
┌─────────────────────────────────────────────────────────────┐
│ Wearable Device Clouds                                      │
│ - Garmin Cloud (FIT data sync)                             │
│ - Apple HealthKit (watch sync)                             │
│ - Polar Cloud (HR sync)                                    │
│ - Oura, Fitbit, Whoop, Amazfit, Withings, etc.            │
└─────────────────────────────────────────────────────────────┘
         ↑ (Device sync, automatic)
┌─────────────────────────────────────────────────────────────┐
│ Wearable Devices (Riders)                                   │
│ - Garmin Fenix, Epix, Forerunner, Edge                     │
│ - Apple Watch                                               │
│ - Polar sports watch                                        │
│ - Any device that Terra supports                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: PoC (1 Week)

### Goal
Validate that Terra API works for live HR coaching, gather pilot coach feedback.

### Phase 1.1: Terra OAuth Setup (4 hours)

**What it does:**
1. Rider clicks "Connect Wearable Device" on MD dashboard
2. Redirected to Terra OAuth (consent screen)
3. Rider authorizes "MD can read my heart rate data"
4. Token stored encrypted in `coach_integrations` table
5. MD can now fetch rider's live HR from Terra

**Files to create:**
- `lib/terra/oauth.ts` — OAuth helpers (get token, refresh token, validate)
- `app/api/terra/oauth-callback/route.ts` — OAuth redirect handler
- `app/settings/terra-connect/page.tsx` — "Connect Wearable" flow

**Environment variables:**
```
TERRA_API_KEY=from-terra-dashboard
TERRA_API_SECRET=from-terra-dashboard
TERRA_OAUTH_CLIENT_ID=from-terra-dashboard
TERRA_OAUTH_CLIENT_SECRET=from-terra-dashboard
TERRA_OAUTH_REDIRECT_URI=https://motorsportsdata.io/api/terra/oauth-callback
```

**Database changes:**
- Add `terra_oauth_token` to `coach_integrations` table
- Add `terra_user_id` (Terra's internal user ID)

### Phase 1.2: Real-Time WebSocket (6 hours)

**What it does:**
1. Terra sends webhook with live HR: `{user_id, hr, timestamp}`
2. MD validates signature (prevent spoofing)
3. Store in Redis: `terra:hr:[sessionId]:[riderId]`
4. Broadcast to all coaches watching session

**Files to create:**
- `app/api/terra/webhook/route.ts` — Receive live HR from Terra
- `lib/terra/validation.ts` — Validate webhook signature (HMAC SHA256)
- `lib/redis/terra-cache.ts` — Store latest HR + 1-min history
- `lib/terra/types.ts` — Type definitions

**Webhook format from Terra:**
```json
{
  "user_id": "terra-user-123",
  "hr": 185,
  "timestamp": 1720569600000,
  "session_id": "session-abc123",
  "rider_id": "rider-456",
  "signature": "hmac_sha256_hash"
}
```

**Redis schema:**
```
terra:hr:[sessionId]:[riderId] = {
  current: 185,
  max: 198,
  avg: 168,
  history: [{ts, hr}, {ts, hr}, ...],  // 60-sec window
  lastUpdate: 1720569600000
}
```

### Phase 1.3: Live HR Widget (8 hours)

**What it does:**
1. Show live HR for each rider in session
2. Update every 1-2 seconds
3. Display trend (↑ spiking, → stable, ↓ dropping)
4. Color code (green/yellow/red by HR zone)

**Files to create:**
- `components/data/live-hr-widget.tsx` — Single rider HR display
- `components/data/live-hr-dashboard.tsx` — Multi-rider comparison
- Update `app/data/sessions/page.tsx` — Add widget when session active

**Widget display:**
```
┌───────────────────────────────────┐
│ Rider A (Fenix 7)                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ HR: 168 BPM  ↗ +5                  │
│ Zone: Moderate (160-179)           │
│ [█████████░░░] (graph: 1-min)      │
│                                   │
│ Max: 185  Avg: 156  Current: 168   │
│                                   │
│ Status: Connected ● Last: 2s ago   │
└───────────────────────────────────┘

Multi-Rider View:
┌───────────────────────────────────┐
│ Live HR — SX Las Vegas             │
├───────────────────────────────────┤
│ Rider A (168)  ▓▓▓▓▓░░░░░░░░░░░░  │
│ Rider B (156)  ▓▓▓░░░░░░░░░░░░░░  │
│ Rider C (182)  ▓▓▓▓▓▓░░░░░░░░░░░  │ [Alert]
│ Rider D (171)  ▓▓▓▓░░░░░░░░░░░░░  │
│ Rider E (145)  ▓▓░░░░░░░░░░░░░░░  │
└───────────────────────────────────┘
```

### Phase 1.4: Session Integration (4 hours)

**What it does:**
1. When session starts, activate live HR monitoring
2. Show "Live HR Monitoring Active" badge
3. Riders in session can see live HR aggregation
4. When session stops, archive HR history

**Files to modify:**
- `app/data/sessions/page.tsx` — Add live HR widget
- `components/data/race-control.tsx` — Show monitoring status
- `components/data/session-detail.tsx` — Post-race HR summary

### Phase 1.5: Testing & Documentation (2 hours)

**Files to create:**
- `docs/TERRA_SETUP.md` — Coach setup guide (3 steps)
- `/data/test-terra` — Test page (mock HR data)
- Test script: curl to validate webhook

**Documentation:**
1. "Connect your wearable device" (OAuth flow)
2. "Enable live HR monitoring" (during session start)
3. "View live HR data" (on coach console during race)

---

## Phase 2: Production Polish (If coaches love Phase 1, 2 weeks)

### Goals
- [ ] Multi-rider comparison view (leaderboard style)
- [ ] HR-based alerts (coach gets notification if HR spikes)
- [ ] Performance overlay (HR vs lap time correlation)
- [ ] Post-race HR analysis (integrate with analytics)
- [ ] Mobile responsive (iPad portrait/landscape)
- [ ] Error recovery (handle lost WebSocket, token refresh, etc.)

### Features to build

**HR-Based Alerts:**
```
IF HR > 200 for > 10 sec
  → Alert: "Rider X exceeding safe HR threshold"

IF HR drops suddenly (>20 bpm in 1 sec)
  → Alert: "Check Rider X (HR drop detected)"

IF HR unstable (>10 bpm variation/sec, sensor issue?)
  → Alert: "HR sensor issue on Rider X?"
```

**Post-Race Integration:**
- Store 1-second HR history in `session_hr_history` table
- Calculate: avg HR, max HR, time in zone, HR variability
- Display on session detail page after race

**Performance Overlay:**
- Correlate HR with lap times
- Show which riders maintain HR in optimal zone
- Coach insights: "Rider A peaks when HR 170-180"

---

## Phase 3: Market Differentiation (Ongoing)

**Future expansions:**
- AI coaching insights ("Rider A's HR pattern suggests overtraining")
- HR-based fatigue detection (readiness adjusted by live race HR)
- Multi-team leaderboard (if enabling competitive features)
- Mobile app for pit crew (AR overlay showing rider HR on video feed)

---

## Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Terra API unreliable | Use ROOK API as fallback, gracefully degrade to post-race |
| Webhook loses connection | Implement retry logic + periodic polling fallback |
| Token expires during race | Handle in middleware, refresh transparently |
| Coach doesn't have cellular | WiFi hotspot ($5/mo) is optional backup |
| Coaches don't use feature | Phase 1 PoC tells us fast, minimal sunk cost |
| Privacy concerns | Explicit opt-in per session, can disable anytime |

---

## Success Metrics (Phase 1)

**PoC Success (decide on Phase 2):**
- [ ] OAuth works without errors
- [ ] HR data flowing in < 5 seconds
- [ ] Widget updates smoothly (no jank)
- [ ] Pilot coach uses it for ≥ 50% of sessions
- [ ] Pilot coach NPS > 8 (would recommend)
- [ ] Zero data loss / crashes during 2-hour test race

**Phase 2 Launch (go to market):**
- [ ] 80%+ of coaches connected to Terra
- [ ] HR monitoring used in 70%+ of races
- [ ] Coaches report tactical decisions made with live HR
- [ ] Zero critical bugs after 4 weeks live

---

## Timeline

**Week 1 (Phase 1 PoC):**
- Mon-Wed: Development (OAuth, webhook, widget)
- Thu: Deploy to staging
- Fri: Pilot test + feedback

**Week 2-3 (Phase 2, if approved):**
- Multi-rider views, alerts, polish
- Deploy to production

**Week 4+ (Phase 3, ongoing):**
- AI insights, fatigue detection, market features

---

## Competitive Positioning

**Unique Pitch:**
> "Real-time heart rate coaching. Watch every rider's heart rate LIVE during the race, make tactical decisions instantly. We're the only platform in motorsports with this."

**Why it's different:**
- Pulsoid: Fitness streamers (1 person, 1 stream)
- Terra: Multi-user B2B apps (10 riders, 1 coach, live coaching)
- Result: We're 6-12 months ahead of any competitor

**Market advantage:**
- Coaches adopt real-time HR coaching workflow
- Creates switching cost (they train their whole team on it)
- Difficult for competitors to catch up (need Terra integration too)

---

## Implementation Checklist

### Before Starting:
- [ ] Create Terra.so account (free tier)
- [ ] Register OAuth app in Terra dashboard
- [ ] Get: client_id, client_secret, api_key
- [ ] Configure redirect URI

### Phase 1 Dev:
- [ ] OAuth flow complete + tested
- [ ] Webhook receiver working + signature validation
- [ ] Redis caching implemented
- [ ] Widget rendering smoothly
- [ ] Session integration wired
- [ ] Test coverage for critical paths

### Phase 1 QA:
- [ ] OAuth completes without errors
- [ ] HR data flows in < 5 seconds
- [ ] Widget updates every 1-2 seconds
- [ ] Handles network disconnection gracefully
- [ ] Handles concurrent sessions (multiple riders)
- [ ] Token refresh works (expiration + re-auth)
- [ ] Post-race data archived correctly

---

## Next Steps

1. Create Terra.so account (10 min)
2. Register OAuth credentials (5 min)
3. Deploy dummy app to test OAuth flow (1 hour)
4. Start Phase 1 development (this week)
5. Gather pilot coach feedback (next week)
6. Decide on Phase 2 (end of week)

---

## Q&A

**Q: What if Terra API goes down?**
A: Falls back to post-race analysis (current system). Phase 1 PoC will surface reliability issues fast.

**Q: How much does Terra cost?**
A: Estimated $29/month starter tier (perfect for 3-10 riders). Scales as team grows. Much cheaper than per-user subscriptions.

**Q: What wearables does this support?**
A: Any wearable that Terra supports: Garmin, Polar, Apple, Fitbit, Whoop, Oura, Amazfit, Xiaomi, Withings, and 490+ others.

**Q: Is this HIPAA-compliant?**
A: Yes, Terra is HIPAA-ready. We're just displaying live HR (like fitness trackers). Coaches consent explicitly.

**Q: What's the latency?**
A: Typically 2-5 seconds from device → cloud → Terra → MD → coach's screen. Fast enough for real-time coaching.

**Q: Can coaches turn it off?**
A: Yes. HR monitoring is opt-in per session. Riders authorize once, coaches can disable anytime.

---

## Competitive Differentiation Summary

**Current State (MD Without Terra):**
- Post-race HR analysis (good, but reactive)
- Readiness scoring (good, but others can replicate)
- Coach can't see live HR during race

**After Terra Integration:**
- LIVE HR during race (real-time)
- Tactical coaching enabled (real-time decisions)
- Only motorsports platform with this
- Coaches adopt new workflow (switching cost)
- 6-12 month lead vs competitors

**Market Impact:**
- "Real-time heart rate coaching during races"
- No other platform in motorsports has this
- Elite coaches will absolutely use it
- Strong differentiator vs Bluon, other competitors

