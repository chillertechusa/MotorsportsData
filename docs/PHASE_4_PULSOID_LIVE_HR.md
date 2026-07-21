# Phase 4: Real-Time Live HR Coaching — Pulsoid Integration

## Executive Summary

Integrate Pulsoid API to enable **real-time heart rate monitoring during active races**. Coaches see live HR data on their iPad during sessions, enabling tactical decisions based on rider cardiovascular state.

**Time to PoC:** 24 hours  
**Competitive Status:** UNIQUE in motorsports  
**Estimated Coach Value:** Game-changer for elite programs  

---

## Why This Matters

**Current State:** HR data available 5-30 minutes after race (post-race analysis only)

**After Pulsoid:** HR data live during race (2-5 second latency) enabling real-time coaching decisions

**Example:**
- Coach sees live HR: 155 → 165 → 175 → 182 → 188 (spiking)
- Coach calls pit crew: "Tell him to back off, conserve for last laps"
- HR drops to 170, rider finishes strong with better positioning
- Tactical adjustment made in real-time vs reactive after-the-fact analysis

---

## Architecture

### Data Flow

```
Wearable Device (Garmin/Polar/Apple)
    ↓ (Bluetooth, 1-2 sec)
Pulsoid App (Coach's Phone)
    ↓ (OAuth token stored)
Pulsoid Cloud (WebSocket)
    ↓ (Webhook + API)
MD Platform: /api/pulsoid/webhook
    ↓ (Parse + validate)
Redis Cache: pulsoid:hr:[sessionId]:[riderId]
    ↓ (Real-time data store)
WebSocket: /ws/session/[sessionId]
    ↓ (Broadcast to all coaches watching session)
Coach's iPad: Live HR Widget
    ↓ (Real-time visualization)
Coach Makes Tactical Decision
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Coach Console (iPad)                                         │
│ ┌──────────────────┐  ┌──────────────────────────────────┐ │
│ │ Session Control  │  │ Live HR Monitoring               │ │
│ │ - Start/Stop     │  │ ┌──────────────────────────────┐ │ │
│ │ - Riders list    │  │ │ Rider A: HR 168 ↗ 175       │ │ │
│ │                  │  │ ├──────────────────────────────┤ │ │
│ │                  │  │ │ Rider B: HR 156 → 162       │ │ │
│ │                  │  │ ├──────────────────────────────┤ │ │
│ │                  │  │ │ Rider C: HR 182 ↗↗ 195      │ │ │
│ │                  │  │ │ [Alert: HR spike]           │ │ │
│ │                  │  │ └──────────────────────────────┘ │ │
│ └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓ (WebSocket: /ws/session/[sessionId])
┌─────────────────────────────────────────────────────────────┐
│ MD Platform Backend                                         │
│ ┌──────────────────────────────────────────────────────────┐
│ │ WebSocket Server: Broadcast HR to all watching coaches   │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ /api/pulsoid/webhook: Receive HR data from Pulsoid       │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ Redis: Store latest HR + history (1 min window)          │
│ └──────────────────────────────────────────────────────────┘
│ ┌──────────────────────────────────────────────────────────┐
│ │ Session Tracking: Know which sessions are active         │
│ └──────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
         ↑ (Pulsoid Cloud: OAuth validated)
┌─────────────────────────────────────────────────────────────┐
│ Pulsoid Cloud                                               │
│ - Validates coach's OAuth token                            │
│ - Receives HR from coach's phone app                       │
│ - Sends webhook with [riderId, HR, timestamp]             │
└─────────────────────────────────────────────────────────────┘
         ↑ (Bluetooth: 1-2 sec)
┌─────────────────────────────────────────────────────────────┐
│ Coach's Phone                                               │
│ - Pulsoid app running                                      │
│ - Connected to rider's wearable device                     │
│ - Sends HR data to Pulsoid cloud                           │
└─────────────────────────────────────────────────────────────┘
         ↑ (Bluetooth: 1-2 sec)
┌─────────────────────────────────────────────────────────────┐
│ Wearable Device (Garmin/Polar/Apple Watch/Oura Ring)       │
│ - Records 1-second HR samples during race                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: PoC (1 Week)

### Goals
- [ ] Pulsoid OAuth integration (coach authorizes)
- [ ] Webhook receiver (accept live HR from Pulsoid)
- [ ] Basic live HR widget (single rider display)
- [ ] Test with pilot coach at track
- [ ] Gather feedback (do coaches use it?)

### Tasks

#### Task 1.1: Pulsoid OAuth Setup (4 hours)
**Files to create:**
- `lib/pulsoid/oauth.ts` — OAuth helpers (get access token, refresh token)
- `app/api/pulsoid/oauth-callback/route.ts` — OAuth redirect handler
- `app/pulsoid/connect/page.tsx` — "Connect Pulsoid" flow on coach settings

**What happens:**
1. Coach goes to settings → "Connect Wearable Devices"
2. Clicks "Link Pulsoid"
3. Redirected to Pulsoid OAuth consent screen
4. Authorizes "MD can access my live HR"
5. Token stored encrypted in `coach_integrations` table
6. Coach sees "Pulsoid Connected" with last sync timestamp

**Environment variables needed:**
```
PULSOID_OAUTH_CLIENT_ID=from-pulsoid-developer-dashboard
PULSOID_OAUTH_CLIENT_SECRET=from-pulsoid-developer-dashboard
PULSOID_OAUTH_REDIRECT_URI=https://motorsportsdata.io/api/pulsoid/oauth-callback
```

#### Task 1.2: Webhook Receiver (6 hours)
**Files to create:**
- `app/api/pulsoid/webhook/route.ts` — Receive live HR data from Pulsoid
- `lib/pulsoid/validation.ts` — Validate webhook signature (prevent spoofing)
- `lib/redis/pulsoid-cache.ts` — Store latest HR + 1-min history

**What happens:**
1. Pulsoid sends webhook: `{riderId, coachId, hr, timestamp}`
2. Validate signature (HMAC SHA256)
3. Store in Redis: `pulsoid:hr:[sessionId]:[riderId]` = {hr, timestamp}
4. Keep 60-second rolling window for graphing
5. If HR spikes > 200 bpm, mark for alert (Phase 2)

**Request format from Pulsoid:**
```json
{
  "coach_id": "coach-123",
  "rider_id": "rider-456",
  "hr": 185,
  "timestamp": 1720569600000,
  "session_id": "session-abc123",
  "signature": "hmac_sha256_hash"
}
```

#### Task 1.3: Live HR Widget (8 hours)
**Files to create:**
- `components/data/live-hr-widget.tsx` — Real-time HR display for single rider
- `components/data/live-hr-dashboard.tsx` — Multi-rider HR comparison (3-5 riders)
- Update `app/data/sessions/page.tsx` — Add live HR widget when session active

**Widget displays:**
```
┌─────────────────────────────────┐
│ Rider A                          │
│ HR: 168 BPM                      │
│ ↗ +5 (trending up)              │
│ [─────────────────] (graph)      │
│                                  │
│ Max: 185  Avg: 156  Current: 168 │
└─────────────────────────────────┘
```

**Features:**
- Live HR number (updates every 1-2 sec)
- Direction indicator (↑ spiking, → stable, ↓ dropping)
- 1-minute mini-graph (HR trend)
- Max/Avg/Current stats
- Color coding: Green (good), Yellow (elevated), Red (critical > 200)

#### Task 1.4: Session Integration (4 hours)
**Files to modify:**
- `app/data/sessions/page.tsx` — Show live HR widget only when session is active
- `components/data/race-control.tsx` — Add "Live HR Monitoring Active" badge

**What happens:**
1. Coach starts session
2. "Live HR Monitoring Active" appears on screen
3. Coach opens Pulsoid app on phone
4. Authorizes rider data share (one-time per session)
5. HR starts flowing to MD in real-time
6. Coach sees live HR on iPad
7. Coach stops session
8. HR widget disappears, data archived

#### Task 1.5: Testing & Documentation (2 hours)
**Files to create:**
- `docs/PULSOID_SETUP.md` — Coach setup guide (3 steps)
- Test script: curl to mock Pulsoid webhook
- Test page: `/data/test-pulsoid` (send fake HR for testing)

---

## Phase 2: Production Polish (If coaches love Phase 1, 2 weeks)

### Goals
- [ ] Multi-rider comparison (see all riders' HR at once)
- [ ] HR-based alerts (coach gets notification if HR spikes)
- [ ] Performance overlay (HR vs lap time correlation)
- [ ] Post-race HR analysis (integrate with analytics dashboard)
- [ ] Mobile responsive design

### Features

**Multi-Rider Comparison:**
```
┌────────────────────────────────────────┐
│ Live HR — Session: SX Las Vegas Rd 5   │
├────────────────────────────────────────┤
│ Rider A (168) ▓▓▓▓▓░░░░░░░░░░░░░░░░░  │
│ Rider B (156) ▓▓▓░░░░░░░░░░░░░░░░░░░  │
│ Rider C (182) ▓▓▓▓▓▓░░░░░░░░░░░░░░░░  │ [Alert]
│ Rider D (171) ▓▓▓▓░░░░░░░░░░░░░░░░░░  │
│ Rider E (145) ▓▓░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────────────┘
  0      50     100     150    200
                HR (BPM)
```

**HR-Based Alerts:**
- IF HR > 200 for > 10 sec → Alert: "Rider X exceeding safe HR"
- IF HR drops suddenly (>20 bpm) → Alert: "Check Rider X (HR drop)"
- IF HR unstable (>10 bpm variation/sec) → Alert: "HR sensor issue?"

**Post-Race Integration:**
- Store 1-second HR in `session_hr_history` table
- Calculate: avg HR, max HR, time above 180, time in zone
- Display on session detail page after race ends

---

## Phase 3: Market Differentiation (If Phase 2 successful, ongoing)

### Goals
- [ ] Coaching insights (AI tips based on HR patterns)
- [ ] HR-based fatigue detection
- [ ] Multi-team live leaderboard (if enabling)
- [ ] Mobile app for pit crew (AR HR overlay on rider POV)

---

## Implementation Checklist

### Before Starting Phase 1:
- [ ] Pulsoid account created (developer mode)
- [ ] OAuth app registered with Pulsoid
- [ ] Client ID + Client Secret obtained
- [ ] Redirect URI configured at Pulsoid

### Phase 1 Dev Checklist:
- [ ] OAuth implementation + testing
- [ ] Webhook receiver + signature validation
- [ ] Redis storage configured
- [ ] Live HR widget built + tested
- [ ] Session integration wired
- [ ] Test coach given access, feedback gathered

### Phase 1 QA Checklist:
- [ ] OAuth flow works (authorize → token → persist)
- [ ] Webhook accepts live HR (curl test)
- [ ] Widget updates in real-time (< 3 sec latency)
- [ ] Handles network loss gracefully
- [ ] Handles concurrent sessions (multiple riders)
- [ ] Handles token refresh (expiration + re-auth)

---

## Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Pulsoid API unstable | Graceful fallback to post-race analysis |
| No coach's cellular at track | Optional WiFi hotspot ($5/mo) solves it |
| Latency too high (> 10 sec) | Real-time is still valuable, but set expectation |
| Coaches don't use it | Phase 1 PoC lets us know fast, minimal sunk cost |
| Privacy concerns (coach sees rider HR) | Explicit opt-in, can turn off per session |

---

## Success Metrics

**Phase 1 PoC Success (decide on Phase 2):**
- [ ] OAuth completes without errors
- [ ] HR data flowing in < 5 seconds
- [ ] Pilot coach uses it for ≥ 50% of race sessions
- [ ] Pilot coach NPS > 8 ("Would you recommend?")
- [ ] No data loss or crashes during test

**Phase 2 Launch (decision to go to market):**
- [ ] 80%+ of coaches connected to Pulsoid
- [ ] HR monitoring used in 70%+ of races
- [ ] Coaches report tactical decisions made with HR data
- [ ] Zero critical bugs after 4 weeks of live use

---

## Timeline

**Phase 1: 1 week (24 hours dev, 3 days testing + feedback)**
- Mon-Wed: Development (OAuth, webhook, widget)
- Thu: Deploy to staging, pilot test
- Fri: Gather feedback, decide on Phase 2

**Phase 2: 2 weeks (if coaches love it)**
- Week 2: Multi-rider, alerts, polish
- Week 3: Deploy to production

**Phase 3: Ongoing (if Phase 2 successful)**
- New insights every sprint

---

## Competitive Positioning

**Messaging:**
> "Real-time heart rate coaching. Watch your rider's heart rate live during the race, make tactical decisions instantly. Nobody else in motorsports has this."

**Differentiators:**
- ✓ Only platform with live HR during races
- ✓ Enables real-time coaching (not reactive)
- ✓ Works with all wearables (Garmin, Polar, Apple, Oura)
- ✓ No additional hardware needed
- ✓ $5-10/mo Pulsoid subscription (coach pays, we don't)

---

## Q&A

**Q: What if Pulsoid API goes down?**
A: Falls back to post-race analysis (current system). Phase 1 PoC will surface this fast.

**Q: Do we need to be on Pulsoid's whitelist?**
A: No. Pulsoid is public API, register OAuth app in their developer console.

**Q: Can we do this without Pulsoid?**
A: Yes, but would require coach to manually upload .fit files (not real-time). Pulsoid is the shortcut.

**Q: What wearables does this support?**
A: Any wearable that Pulsoid supports: Garmin, Polar, Apple Watch, Oura Ring, Whoop, etc.

**Q: Is this a HIPAA concern?**
A: Only if storing health data long-term. We're just displaying live HR (like fitness trackers). Coaches consent explicitly.

---

## Next Steps

1. **Create Pulsoid developer account** (10 min)
2. **Register OAuth app** (5 min)
3. **Start Phase 1 development** (this week)
4. **Gather pilot coach feedback** (next week)
5. **Decide on Phase 2** (end of week)

