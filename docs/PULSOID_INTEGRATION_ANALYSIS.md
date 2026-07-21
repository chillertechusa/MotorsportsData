# Pulsoid Integration Analysis — Live Heart Rate Monitoring for MD Platform

## Executive Summary

**Recommendation: HIGH PRIORITY - Strategic differentiator for elite coaches.**

Pulsoid offers real-time heart rate streaming that could give us a unique competitive advantage. Instead of waiting for wearable data upload cycles, coaches could watch live heart rate graphs during races, enabling real-time tactical decisions.

---

## Current MD Heart Rate Tracking

### How It Works Today

**Architecture:**
```
Wearable Device (Garmin/Polar/Apple)
    ↓ (Bluetooth)
Device (coach's phone/laptop)
    ↓ (Manual upload or auto-sync)
Device Credentials Storage (AES-256 encrypted)
    ↓ (OAuth token)
Device API (Garmin Connect, Polar, Apple HealthKit)
    ↓ (Fetch historical data)
md_telemetry_imports table (store raw data)
    ↓ (Parse + normalize)
telemetry_metrics hypertable (TimescaleDB)
    ↓ (5-min aggregates)
Analytics Dashboard / Live Dashboard
```

**Key Characteristics:**
- **Latency:** 5-30 minutes (wearable upload cycle + our sync job)
- **Resolution:** 1-second resolution (what Garmin/Polar records)
- **Frequency:** Stored data, not live streaming
- **Trigger:** Manual upload or 5-min cron job
- **Historical:** Full session data available post-race

### Heart Rate Data Points Ingested

```typescript
interface TelemetryPoint {
  heartRate?: number          // 60-220 bpm
  hrvMs?: number              // Heart rate variability (ms)
  temperature?: number        // Core temp (36-39°C)
  // + power, speed, cadence, GPS, etc.
}
```

**Devices Currently Supported:**
- Garmin HRM-Pro, Edge cycling computers, Fenix watches
- Polar H10, Vantage series
- Apple Watch
- Wahoo devices
- Strava (activity-level HR)

**How HR Is Used:**
1. **Readiness Scoring** — HR baseline + HRV morning reading → recovery status
2. **Session Analytics** — Avg/max HR during session
3. **Compliance Tracking** — Did rider follow prescribed intensity?
4. **Trending** — HR trends over 7d/30d/90d periods

---

## Pulsoid API Overview

### What Pulsoid Offers

**Real-time heart rate streaming from wearables:**

```
Wearable Device (Garmin/Polar/Apple/Oura)
    ↓ (Bluetooth - local)
Pulsoid Mobile App (on coach's phone)
    ↓ (WebSocket - cloud)
Pulsoid Cloud
    ↓ (API endpoint)
YOUR Platform (our API)
    ↓ (WebSocket to coach console)
Live Heart Rate Dashboard (coach sees live HR during race)
```

**Architecture:**
- **Local Bluetooth:** Pulsoid app pairs with wearable (1-2 second latency)
- **Cloud Sync:** Sends to Pulsoid cloud via WebSocket (UDP-based, ~100-200ms latency)
- **API Access:** We query Pulsoid API or webhook for live data
- **Total Latency:** 2-5 seconds (vs our current 5-30 minutes)

**Key Metrics Available:**
- Heart rate (live, 1-second updates)
- Heart rate variability (some devices)
- Resting heart rate
- Stress level (some devices)
- Activity type (detected by Pulsoid)

### Pulsoid Pricing & Availability

**Free Tier:**
- Live streaming via Pulsoid overlays (for streamers)
- WebSocket API access (developer)

**Pro Tier:**
- $5-10/month per user
- Webhook support
- Custom integrations
- Higher rate limits

**Supported Devices:**
- Apple Watch (native HealthKit)
- Garmin watches (via Garmin API)
- Polar devices (via Polar API)
- Oura Ring
- Other wearables via Bluetooth

---

## Integration Architecture — Option A: Direct Pulsoid Streaming

### High-Level Flow

```
Coach Wears Device (Garmin/Polar/Apple)
    ↓
Coach Opens MD Coach Console
    ↓
Start Session → Coach Installs Pulsoid (if not done)
    ↓
Coach Pairs Device in Pulsoid App
    ↓
Pulsoid Sends Live HR via API/Webhook to MD
    ↓
MD WebSocket to Coach Console
    ↓
Live Heart Rate Widget Shows Real-Time Graph
    ↓ (Session continues)
HR updates every 1-2 seconds on dashboard
    ↓ (Race ends)
Session Complete → HR data + session metrics saved
```

### What We'd Build

**1. Pulsoid OAuth Integration**
```typescript
// lib/device/pulsoid-auth.ts
interface PulsoidUser {
  userId: string
  accessToken: string
  linkedDevices: string[]
  expiresAt: number
}

function getPulsoidAuthUrl(): string
function exchangePulsoidToken(code: string): Promise<PulsoidUser>
```

**2. Live HR WebSocket Bridge**
```typescript
// lib/websocket/pulsoid-bridge.ts
class PulsoidStreamManager {
  subscribe(riderId: string, sessionId: string)
  unsubscribe(riderId: string)
  broadcast(riderHR: LiveHeartRatePoint)
}

interface LiveHeartRatePoint {
  timestamp: number
  riderId: string
  heartRate: number
  rmssd?: number  // Heart rate variability
}
```

**3. API Endpoint to Receive Webhooks**
```typescript
// app/api/pulsoid/webhook/route.ts
export async function POST(request: NextRequest) {
  const { riderId, heartRate, timestamp } = await request.json()
  
  // Validate signature
  // Broadcast to WebSocket subscribers
  // Store in live cache (for dashboard)
  // Write to TimescaleDB for historical record
}
```

**4. Live Heart Rate Widget**
```typescript
// components/data/live-heart-rate-widget.tsx
<LiveHeartRateWidget
  riderId="rider-1"
  sessionId="race-1"
  showHistory={true}  // Last 60 seconds
/>
```

---

## WiFi Requirements for Track

### Current Reality

**WiFi at Motocross Tracks:** Often non-existent or poor
- Most tracks have no WiFi infrastructure
- Cellular coverage varies (edge of town, hills block signal)
- Event WiFi (if provided) is congested with hundreds of devices

**Our Current Solution:**
- Device auto-syncs after session (coach's phone connects to home WiFi later)
- Works offline (no real-time requirement)

### Pulsoid Live HR Requirements

**WiFi Needed For:**
1. **Coach's Phone** (running Pulsoid app)
   - Needs to upload HR to Pulsoid cloud
   - ~1-2 Mbps sustained
   
2. **Coach's iPad/Laptop** (viewing MD dashboard)
   - Receives WebSocket updates from Pulsoid
   - ~500 Kbps sustained
   
3. **Optional:** Track WiFi hotspot (if provided)

**Bandwidth Reality:**
```
Per rider: 
  - HR update every 1-2 sec
  - ~50 bytes per update
  - = ~25-50 Kbps per rider

For 5 riders on live dashboard:
  - ~125-250 Kbps total
```

**WiFi Options at Tracks:**

Option 1: **Coach Uses Cellular (BEST)**
- Pulsoid app uses 4G/5G (coach's phone)
- MD dashboard uses WiFi hotspot (coach's laptop/iPad)
- Cost: Included in phone plan
- Latency: 2-5 seconds (acceptable)
- Requires: 4G/5G signal (usually available at major tracks)

Option 2: **Portable WiFi Hotspot**
- Coach brings Apple Watch / Garmin + WiFi hotspot
- Hotspot tethers to cellular
- Cost: $5-15/month hotspot plan
- Latency: 3-8 seconds
- Reliable: Works where cellular works

Option 3: **Track WiFi (NOT RECOMMENDED)**
- Depends on track infrastructure
- Often congested/unreliable
- No control over quality
- Latency: Unpredictable

**Conclusion:** WiFi is not a blocker. Coaches can use cellular + optional hotspot.

---

## Strategic Advantages vs Competitors

### What This Enables

**1. Real-Time Race Tactics**
```
Coach sees HR is 185 bpm + trending UP
→ Decide: Is rider peaking or overworking?
→ Call rider in pit: "Back off throttle, manage effort"
→ HR drops to 172, paces for another 2 laps
```

**vs Current:** Coach waits until after race to analyze HR trends.

**2. Injury Prevention**
```
Coach notices HR spiking abnormally (180→205 in 30 sec)
→ Possible cramping, breathing issue, or panic
→ Coach can watch, call pit crew if needed
```

**vs Current:** Post-race, "Rider's HR went to 205 — what happened?"

**3. Competitive Moat**
- No other motocross coaching platform has live HR during races
- Streamers use Pulsoid (fitness content). We'd be first in motorsports.
- Creates lock-in: once coaches use live HR coaching, they won't switch.

**4. Data + Coaching Innovation**
- Correlate live HR with lap times, throttle position, rider calls
- AI insights: "When HR exceeds 185, lap time increases 0.3 sec"
- Personalized protocols: "Your rider peaks at HR 172, avoid going higher"

---

## Implementation Plan

### Phase 1: Proof of Concept (1 week)
1. Set up Pulsoid developer account
2. Build basic OAuth flow (coach links Pulsoid)
3. Fetch live HR via Pulsoid API
4. Display on test dashboard
5. Manual testing at track

### Phase 2: Production (2 weeks)
1. WebSocket bridge for real-time streaming
2. Live HR widget + historical graph
3. Store live HR in TimescaleDB for post-race analysis
4. Integration with session management
5. Coach console deployment

### Phase 3: Advanced (Optional, future)
1. HR-based alerts (threshold breaches)
2. AI coaching hints (based on HR patterns)
3. Multi-rider live comparison
4. Leaderboard (riders by peak HR, endurance, etc.)

---

## Costs & Effort

### Development

| Component | Effort | Cost |
|-----------|--------|------|
| Pulsoid OAuth | 4 hours | $0 |
| WebSocket bridge | 6 hours | $0 |
| API webhook endpoint | 2 hours | $0 |
| Live HR widget | 8 hours | $0 |
| Testing + deployment | 4 hours | $0 |
| **Total** | **24 hours** | **$0** |

### Recurring

| Item | Cost |
|------|------|
| Pulsoid Pro (per coach) | $5-10/month |
| Bandwidth (WebSocket) | <$1/month |
| Hosting (already on Vercel) | Included |
| **Total per coach** | **$5-10/month** |

---

## Risks & Mitigations

### Risk 1: Pulsoid Outage
**Impact:** Live HR unavailable during race.
**Mitigation:** 
- Fallback to traditional post-race HR analysis
- Store telemetry locally (offline mode)
- Notify coach if connection drops

### Risk 2: WiFi/Cellular Failure
**Impact:** No live HR transmission.
**Mitigation:**
- Cache HR locally on coach's device
- Sync when connection restored
- Graceful degradation (show last known HR)

### Risk 3: Pulsoid API Changes
**Impact:** Integration breaks.
**Mitigation:**
- Use documented stable API endpoints
- Version API calls
- Monitor Pulsoid changelog

### Risk 4: Device Compatibility
**Impact:** Some wearables don't work with Pulsoid.
**Mitigation:**
- Test with common devices (Garmin, Polar, Apple, Oura)
- Display compatibility matrix in UI
- Fallback to post-race analysis for unsupported devices

---

## Competitive Landscape

### Who Uses Pulsoid?
- YouTube fitness creators (live gym streams)
- Twitch streamers (fitness challenges)
- Marathon/ultramarathon events (pacers wear Pulsoid)
- Some fitness coaches (coaching sessions)

**Nobody in motorsports is using this yet.**

This is a unique white space we can own.

---

## Decision Matrix

| Factor | Impact | Score |
|--------|--------|-------|
| User differentiator | High | 9/10 |
| Implementation difficulty | Low | 8/10 |
| Cost | Low | 9/10 |
| WiFi dependency | Medium | 6/10 |
| Competitive moat | High | 9/10 |
| **Overall Score** | - | **8.2/10** |

---

## Recommendation

**BUILD IT. Phase 1 (PoC) first.**

This is a 1-week proof of concept that could become a signature feature. If it works:
1. Deploy to pilot coaches
2. Measure engagement (coaches using live HR coaching)
3. Iterate based on feedback

If it doesn't:
- Fallback is still our current post-race HR analysis
- No sunk cost (24 hours engineering)

**Why now?**
- Phase 1 MVP is complete (readiness, IP vault, accountability)
- Infrastructure is built (WebSocket, TimescaleDB, session management)
- Coaches are ready for advanced features
- We have the runway to iterate

**Pitch to coaches:**
> "Real-time heart rate coaching during races. Watch your rider's HR live, make tactical calls, and optimize performance lap-by-lap. You already have the wearable—now see what it's telling you while it matters."

---

## Next Steps

1. Request Pulsoid developer account
2. Review Pulsoid API docs (https://pulsoid.net/docs/)
3. Prototype OAuth flow (4 hours)
4. Test with real wearable at track/gym (1 hour)
5. Build WebSocket bridge (6 hours)
6. Deploy to staging + test with pilot coaches

---

