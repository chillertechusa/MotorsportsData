# Elite Coach Demo Guide

**Target:** Factory trainers managing 5-20 professional riders

**Goal:** Show IP protection, accountability tracking, and readiness prediction in 30 minutes

---

## Pre-Demo Setup

- Open `/data/demo` (pre-loaded 2-week training progression + 2 races)
- Have riders A, B, C profiles ready
- Prepare readiness score explainer (sleep + HRV + volume formula)

---

## Demo Flow (30 minutes)

### Segment 1: IP Vault (5 minutes)
**Problem statement:** Your periodization is proprietary. Competitors would pay for it. But if you share it with riders, it leaks.

**Show:**
- `/data/vault` — Template upload UI
- Upload "Pre-Season Periodization 2026"
- Check "Encrypt template (AES-256)"
- Show watermark: "Proprietary — Confidential"
- Point out: "Riders see assignments but cannot export, screenshot, or share."
- "When a rider leaves your program, access revoked instantly."

**Closing line:** "Your 20 years of coaching method stays locked in a vault. Your riders execute. No leaks."

---

### Segment 2: Accountability Audit Trail (7 minutes)
**Problem statement:** Riders say they did the work. Proof is Instagram hype. Data is missing.

**Show:**
- Push assignment: "40 min @ 150 BPM"
- Rider taps "I acknowledge" (timestamp logged)
- Session completes — upload telemetry
- Platform auto-compares:
  - Assignment: 40 min @ 150 BPM
  - Actual: 38 min @ 148–152 BPM
  - Status: **COMPLIANT** (98%)
- Pull up audit log showing IP, timestamp, rider confirmation

**Contrast:**
- "Rider C: 40 min assignment → uploaded 22 min"
- Status: **FAILED** (55%)
- One-click flag to coach

**Closing line:** "Every assignment is legally tracked. Riders can't lie. You have proof."

---

### Segment 3: Readiness Score & Tapering (10 minutes)
**Problem statement:** Riders peak on wrong days. You guess at rest vs. push. No science.

**Show:**
1. **Rider A metrics:**
   - Sleep: 8.5 hours (quality 85%)
   - HRV: 65 ms (excellent parasympathetic recovery)
   - Volume: 180 min this week (perfect dose)
   - Days to race: 2 (taper window)

   **Platform says:** Readiness = 92/100 | Peak probability: 94%
   **Recommendation:** "MAINTENANCE taper. 1 short session today (15 min easy). REST tomorrow. Sleep 8+ hours both nights. You are peaked."

2. **Rider B metrics:**
   - Sleep: 6.5 hours (quality 60%)
   - HRV: 48 ms (okay, recovering from yesterday's hard session)
   - Volume: 200 min (borderline over)
   - Days to race: 2

   **Platform says:** Readiness = 76/100 | Peak probability: 72%
   **Recommendation:** "SHORT taper. 20 min easy pace today. ZERO intensity tomorrow. Sleep 8+ hours both nights."

3. **Rider C metrics:**
   - Sleep: 5.5 hours (quality 50%)
   - HRV: 35 ms (stressed, autonomic imbalance)
   - Volume: 220 min (overreached)
   - Days to race: 2

   **Platform says:** Readiness = 61/100 | Peak probability: 48%
   **Recommendation:** "ABORT race if possible. Readiness is low. If must race, easy spin today, full rest tomorrow, sleep 9+ hours."

**Historical correlation:**
- Last race: Rider A peaked with readiness 92 ← won
- Last race: Rider C peaked with readiness 84 ← 3rd place
- "Readiness doesn't lie. It predicts championship."

**Closing line:** "You stop guessing. You follow the algorithm. Your riders peak on race day every time."

---

### Segment 4: Multi-Rider Telemetry Overlay (5 minutes)
**Problem statement:** You watch your rider. You don't see your competitor's lap. You don't know if he's faster at T3 or T8.

**Show:**
- Race view: 3 riders animated on track map
- Tap Rider A → see his suspension telemetry, power, HR, speed waveform for that lap
- Compare Rider A vs. Rider B on same lap:
  - "T5 apex speed: Rider A 62mph, Rider B 59mph"
  - "Suspension delta: Rider A 2° more compression"
  - "Suggests: tighter setup working at speed. Copy to Rider C?"

**Closing line:** "See every lap. See every competitor. Adjust in real-time."

---

## Objection Handling

### "I love my notebookand stopwatch."
**Response:** "That's the foundation. This platform doesn't replace your eye. It amplifies it. You see lap time with a stopwatch. We show you lap time + why (suspension, power, HRV, biomechanics). Your intuition + our data = invincible."

### "My riders will leave if I track them this closely."
**Response:** "Elite riders want accountability. They want to know if they're peaking. Factory teams mandate this. The ones who resist are the ones who skipped the work. You want those riders exposed. They either step up or they're gone."

### "What about privacy?"
**Response:** "We don't share data with anyone outside your program. Riders see only their own data. Coaches see all riders. Factory team owners see trends only (no individual assignment details). RLS (row-level security) is built in."

### "How much does it cost?"
**Response:** "Factory Rig tier is $2,499/month (unlimited riders, unlimited assignments, unlimited readiness predictions). That's $125 per rider if you manage 20. Your top rider generates $100k+ in sponsorships per year. Worth it."

---

## Closing

**"You're legendary because you know the edge cases. This platform documents them, predicts them, and lets you share them with your riders. Your methods stay locked. Your riders execute. You win championships."**

---

## Post-Demo Actions

1. Request schedule for pilot program (suggest 5-10 riders, 4-week trial)
2. Ask: "What's one thing your current system doesn't do that would change everything?"
3. Get email list for pilot team members
4. Offer white-glove onboarding (us setting up their templates + data, hands-off)

