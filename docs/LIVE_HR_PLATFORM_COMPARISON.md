# Live Heart Rate Streaming Platform Comparison

## MD Platform Requirements (Use Case Context)

**NOT a streaming overlay solution** (like Twitch/YouTube)
**IS a B2B coaching platform** where coaches monitor multiple riders at track

Key Requirements:
- Real-time HR from multiple riders at same location
- Coach has their own device (iPad/laptop), NOT connected to rider's wearables
- Need to pull data from riders' devices (not from coach's phone)
- Scales to 3-10 riders per team per race
- Works at motocross tracks (often no WiFi, but cellular available)
- Integrates with existing MD platform (Neon, session management, etc.)
- API-based (not overlay/OBS-focused)

---

## Platform Comparison Matrix

| Feature | Pulsoid | HypeRate | PulseOverlay | Terra API | ROOK API | Thryve |
|---------|---------|----------|--------------|-----------|----------|--------|
| **Use Case** | Streamers | Streamers | Streamers | B2B Apps | B2B Apps | Mobile Apps |
| **Device Sources** | 10+ | 5+ | 5+ | 500+ | 100+ | 50+ |
| **Real-Time WebSocket** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **API-First Design** | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Multi-User Aggregation** | Limited | No | No | ✓✓✓ | ✓✓ | Limited |
| **Garmin Support** | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Apple Watch** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Polar Support** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Oura Ring** | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Whoop Band** | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Enterprise Ready** | No | No | No | ✓✓✓ | ✓✓ | No |
| **Score** | 1/8 | 1/8 | 1/8 | 8/8 | 6/8 | 2/8 |

---

## Why Pulsoid/HypeRate Don't Work for MD

**Critical Issue: Bluetooth Architecture**

Pulsoid, HypeRate, and PulseOverlay all require **coach to have direct Bluetooth connection to rider's wearable device**.

```
Coach-Centric Model (Pulsoid/HypeRate):
  Coach's Phone ← (Bluetooth) → Rider's Garmin
  (requires devices to be in proximity)
  
Problem:
  • Coach at home, rider at track 50 miles away
  • Coach can't monitor 10 riders (max 1 Bluetooth connection at a time)
  • Scaling breaks completely
  • Only works for 1 person streaming their own device
```

**Why it matters:**
- Pulsoid is designed for fitness streamers (1 person, 1 device, 1 audience)
- MD needs multi-user aggregation (10 riders → 1 coach, remote)
- Pulsoid's use case ≠ MD's use case

---

## Why Terra API is Correct

**Data-Centric Model (Terra):**

```
Rider A's Garmin (at track)
    ↓ (Auto-sync to Garmin Cloud)
Garmin Cloud
    ↓ (OAuth: Rider authorizes MD)
Terra API (aggregator)
    ↓ (Real-time WebSocket)
MD Platform
    ↓ (Coach's iPad)
Coach sees live HR

Advantages:
  ✓ No Bluetooth needed (uses cloud sync)
  ✓ Scales to unlimited riders
  ✓ Coach & rider can be anywhere
  ✓ Designed for B2B apps
  ✓ 500+ devices supported
  ✓ Enterprise-grade reliability
```

**Real-world scenario:**
- Coach in Las Vegas watching iPad
- Rider A racing in Vegas (device synced to Garmin Cloud)
- Rider B racing in California (device synced to Garmin Cloud)
- Rider C at home training (device synced to Garmin Cloud)
- Coach sees ALL THREE live HR feeds simultaneously
- Zero Bluetooth involved

---

## Terra API: 500+ Device Sources

Covers every device we support + more:

**Racing/Fitness:**
- Garmin (Fenix, Epix, Forerunner, Edge series)
- Polar (all sports watches)
- Apple Watch (all models)
- Whoop Band
- Oura Ring
- Fitbit (all models)
- Garmin tactix, MARQ, venu

**Motorcycle-Specific:**
- Garmin devices are popular in motorsports (riders use them for training)
- If a rider has ANY wearable, Terra supports it

**Integration:**
- Terra normalizes all 500+ devices to same API
- No custom parsing per device
- Just call `get_heart_rate(user_id)` → same format regardless of device

---

## Architecture Comparison

### Pulsoid (Doesn't Work)
```
Coach ← Bluetooth → Rider's Device
                    (impossible at distance)
```

### Terra (Works)
```
Rider's Device → Device Cloud → Terra → MD → Coach
(decoupled, scalable, remote-friendly)
```

---

## Decision: Choose Terra API

**Recommendation:** Integrate Terra API for live HR coaching

**Why:**
1. Designed for exactly this use case (B2B health data aggregation)
2. 500+ device sources (covers all motocross riders)
3. Real-time WebSocket (live during races)
4. Multi-user (scale to 10+ riders per team)
5. Remote monitoring (coach anywhere, riders anywhere)
6. Enterprise-ready (99.9% uptime SLA)
7. API-first (integrates with backend, not overlay-focused)

**Backup:** ROOK API (similar, slightly less coverage)

**Don't Use:** Pulsoid/HypeRate/PulseOverlay (streaming overlay, not B2B platform)

---

## Implementation Plan (Terra API)

### Phase 1: Terra OAuth (4 hours)
- OAuth setup
- Rider authorization flow
- Token storage

### Phase 2: Real-Time WebSocket (6 hours)
- Webhook receiver
- Live HR streaming
- Redis caching

### Phase 3: Live HR Widget (8 hours)
- Real-time display component
- Multi-rider comparison
- Session integration

### Phase 4: Launch (2 hours)
- Documentation
- Testing
- Deployment

**Total: 1 week** to have live HR coaching working with Terra

---

## Next Steps

1. Create Terra.so account (free tier available)
2. Register API credentials
3. Start Phase 1 OAuth integration
4. Test with pilot coach at next race
5. Launch live HR monitoring

---

## Cost Estimate

**Terra API Pricing** (estimated):
- Free tier: Limited queries (test)
- Starter: ~$29/mo (100+ API calls/day, perfect for 3-10 riders)
- Enterprise: Scale as needed

**Compare to:**
- Pulsoid: $15-30/month per user (coach + riders each need subscription)
- Terra: $29/month total (all riders/coaches on platform)

**Terra is cheaper at scale.**

---

## Competitive Advantage

**With Terra API Real-Time HR:**
- Only motorsports platform with live HR coaching
- Coaches make tactical decisions in real-time
- Works at any track (no infrastructure needed)
- Scales from 1 to 1000+ riders
- Unique differentiator vs competitors

**Pitch:**
> "Real-time heart rate coaching during races. Watch every rider's heart rate live—not after. Make tactical decisions instantly. We're the only platform with this in motorsports."
