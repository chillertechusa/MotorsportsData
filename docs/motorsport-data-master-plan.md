# Motorsport Data — Master Platform Plan
Last updated: July 10 2026

---

## The Actual Big Idea — White-Label Engine

**This is not a motorcycle app. It is a universal race data platform with a motorcycle skin on it right now.**

The engine — DB schema, AI routes, session logging, fitness tracking, work orders, team management, billing — is sport-agnostic. The overlay (branding, discipline fields, AI system prompts, marketing pages) is swappable.

Today: two-wheel motorsports under "Motorsport Data."
Tomorrow: NASCAR team buys a license. Top Fuel drag racing. Karting. Rally. Formula cars.
Each vertical gets its own branded instance — its own domain, logo, color scheme, discipline vocabulary. The engine underneath is identical. The team building and maintaining it is us. The development cost is effectively zero for each new sport because nothing structural changes.

**The analogy:** Windows does not care if you are writing a screenplay or running a CNC machine. The OS is the same. The applications are different. MD is the OS. Each sport is an application layer on top.

**What this means architecturally right now:**
- Keep all sport-specific language in config, not code — discipline names, AI prompt prefixes, marketing copy
- Keep schema generic — `vehicles` not `motorcycles`, `sessions` not `motos`, `competitions` not `races`
- Every hardcoded "dirt bike" or "motocross" reference in AI prompts should eventually come from a discipline/sport config layer
- Pricing tiers translate across sports — Rookie/Privateer/Race Team/Factory Rig work for NASCAR teams, drag crews, karting programs, all of them

**The licensing model:**
- Motorsport Data (MD) = the flagship two-wheel product, our proof of concept
- License the platform to other series, sanctioning bodies, or brands as white-label B2B deals
- Revenue model: flat annual licensing fee + per-seat pricing for the licensee's user base
- Sanctioning bodies (NASCAR, NHRA, AMA) have existing member bases — instant distribution

This does not change anything being built today. It changes how we build it — generic names, config-driven language, no hardcoded sport assumptions in core logic.

---

## Investor Strategy

**Owner retains 51% minimum. Non-negotiable.**

Target investors: sports tech VCs, ex-NASCAR/NHRA operators, AI infrastructure funds. The pitch is not "we built a motocross app." The pitch is: "We built the operating system for motorsport. The motorcycle product already has paying customers. Here is the white-label licensing path to NASCAR, Top Fuel, karting, and rally — each a nine-figure industry with zero modern data infrastructure."

The AI angle is critical timing. Investors are burned on AI companies that dump compute costs with no retention. MD is the opposite — the AI is the retention mechanism. A mechanic with 3 years of work orders on the platform does not leave. A rider whose coaching AI knows their entire career does not leave. The data compounds. That is the moat.

**Investor dashboard** lives at `/data/owner/investor` — real-time, auth-gated, presentable. Shows MRR, ARR, churn, LTV, tier breakdown, AI usage and cost, revenue timeline, subscriber table, and white-label pipeline. Built to survive a due diligence walkthrough with Kevin O'Leary.

---

## The Two-Wheel Pitch — Current Focus

"Operating system for a racing career" is the right instinct but too narrow for the motorcycle market.

**The real pitch: Motorsport Data is the operating system for anyone who lives around a motorcycle.**

Just like Windows or macOS doesn't care what you're doing on the computer,
MD doesn't care if you're a pro racer, a local amateur, an FMX freestyler, a trails
rider, or the mechanic keeping all of them on the bike. It is the platform you run
your entire relationship with the sport on — data, setup, fitness, career, shop floor.

The computer analogy is exact:
- The bike is the hardware
- The rider / mechanic is the user
- Motorsport Data is the OS — it runs underneath everything, connects all the parts,
  stores the state, and makes everything talk to each other
- The AI (MD Intel, Coach, Setup AI, Mechanic Coach) is the built-in assistant —
  like Siri or Copilot, but actually useful because it knows YOUR data

---

## Who Uses This

### 1. The Rider
Racing, freestyling, enduro, trails — it does not matter. They want to go faster,
stay healthy, and remember what worked. Every session logged = better AI advice.

### 2. The Mechanic
This is the underserved market. Mechanics are professionals under enormous pressure.
No dedicated software exists for them. They use sticky notes and group texts.
MD gives them a professional platform they can carry from team to team — their
reputation in data form. A mechanic with 3 years of setup logs across 12 riders
is more valuable to the next team than one who shows up with just tools.

Key insight: **mechanics build careers too.** Their MD account is their portfolio.
A team owner can look at a mechanic's work order history and see:
- Average setup turnaround time
- Part failure rates under their care
- Before/after suspension deltas
- Rider performance improvement under their setups

That is a hiring resume no other platform creates.

### 3. The Team
Race Team and Factory Rig tiers. Owner manages multiple riders and mechanics.
Sees everything across the fleet. Makes data-driven decisions on setup, logistics, fitness.

### 4. The Shop (future)
Independent shops servicing bikes for paying customers. Work orders, parts inventory,
customer bikes — a lightweight shop management system. This is v2 of the Wrench tier.

---

## Disciplines (add discipline field to vehicles)

- Motocross / SX
- Enduro / GNCC / Harescramble
- FMX / Freestyle
- Flat Track / Oval
- Trail / Recreational
- Pit Bike / Youth

**Why it matters:** The AI adapts its entire framing based on discipline.
- Motocross: corner speed, lap times, race day setup
- FMX: big-air landings, trick progression, foam pit vs dirt
- Enduro: navigation, fuel range, sustained power delivery
- Trail: comfort, reliability, multi-day setup consistency

One field. Every AI response becomes discipline-aware.

---

## Tier Structure

| Tier | Who | Price | Key features |
|---|---|---|---|
| Rookie | Young riders, beginners | Free | Session log, part vault, basic setup |
| Privateer | Serious amateur riders | $79/mo | Full setup sheet, AI coach, progression, compare |
| Race Team | Multi-bike amateur teams | $149/mo | Fleet management, work orders, fleet analytics |
| Wrench | Professional mechanics | $29/mo | Work orders, AI Mechanic Coach, career portfolio |
| Factory Rig | Pro / factory programs | $299/mo | Everything, 2FA, AI Intel grounded on OEM specs |

**Wrench tier rationale:**
- $29/mo is lower than any other tier — mechanics do not own the bikes
- The value is not features — it is the career portfolio aspect
- A mechanic account accumulates over years across multiple teams
- That is the lock-in. Switching cost = losing your entire work history.

---

## The Console Problem (current state)

The platform has real, sophisticated backends. The AI routes are excellent.
The database is well-structured. But the UI does not surface any of it.

**Every section needs to feel alive when you open it, not blank.**

### Dashboard — currently 2 boxes, should be AI daily briefing
"Good morning. Race in 4 days at Glen Helen. HRV trending down.
Fork setup unchanged for 3 sessions at this track.
Here is what to focus on today."

### Fitness — currently forms that save, no feedback
Log HRV, get immediate AI insight.
"Recovery score 61. On days above 70 your lap times average 2.1s faster.
Reduce intensity today." No fitness app can say that. We can. We have the lap data.

### Mental — currently log entries, AI program buried
"Anxiety up 2 points this week. Pre-race visualization recommended
48h before moto. Here is a 5-minute routine based on your patterns."

### Coach — currently a text box
Show the rider what the AI knows before they ask.
"I have your 8 sessions, 14 days of readiness, Glen Helen on July 15,
$4,200 in season expenses, and your sponsor contacts."
The moment of "it knows me" is the product.

### Mechanic Coach — just built, needs AI layer
After closing a work order, AI reads before/after suspension delta
+ the rider's next session result:
"The +2 click compression change correlated with a 1.3s lap improvement.
Recommend similar adjustment for Pala."
No other platform does this.

---

## The Fitness Tracker Integration Answer

Do not fight wearables. Pull from them.
- Apple Health / Garmin / Whoop / Oura all have export APIs
- HRV, sleep, heart rate auto-import passively
- MD correlates wearable data with session performance automatically
- No fitness app knows your lap times. No motorsports app knows your HRV.
  MD does both. That is the moat.

Phase 1 (now): manual HRV/sleep entry (already exists)
Phase 2 (next): Garmin Connect API or Apple Health export
Phase 3 (v2): real-time webhooks

---

## The OS Vision — What Is Actually Missing

An OS has:
- A shell (RigShell — exists, needs polish)
- A file system (DB — Neon, solid)
- Background services (crons — expiry alerts, abandoned checkout, wired)
- System-level intelligence (AI routes — exist, not surfaced in UI)
- User accounts and permissions (Better Auth — solid)
- A marketplace (future: third-party coaching services, team recruiting)

What the OS is missing:
- **A real home screen** — dashboard must be the command center
- **Cross-section data flow in the UI** — fitness data affects coach advice
  which affects setup AI which affects work order notes.
  The DB has the data. The AI routes have intelligence.
  The UI does not connect them visually. That is the fix.
- **Notifications as first-class** — push is wired but not prominent

---

## Build Priority Order

### IMMEDIATE
1. Fix remaining type errors (work orders, rig-shell)
2. Add discipline field to vehicles — one migration, AI unlock across all routes
3. Add Wrench tier to md-plans.ts
4. Rebuild dashboard as AI daily briefing
5. AI insight panel on Fitness after every log
6. AI insight panel on Mental after every log
7. Coach "what I know about you" context brief
8. Mechanic Coach AI route (separate system prompt)

### NEXT
9. Fitness performance correlation surface
10. Owner analytics dashboard (MRR, churn, LTV)
11. Feature-gated upgrade prompts
12. Blog / content engine
13. Shared setup sheets (public URLs, SEO)
14. Discipline-aware AI prompts on all routes

### FUTURE / V2
15. Wearable data import (Garmin, Apple Health)
16. Shop tier (external customer bikes, invoicing)
17. Mechanic career portfolio / public profile
18. Community / shared setups marketplace
19. Mobile app

---

## Tagline

Current: "The operating system for a racing career"
Problem: excludes mechanics, freestylers, trail riders

Recommendation: **"The OS for two wheels"**
Subheadline: "For riders, mechanics, and the teams that live between them."

Short. Owns the OS concept. Applies to every discipline. Not just racing.

---

## FMX / Freestyle Note

Do not build separate features. One discipline field on the vehicle:
- AI coach speaks freestyle language (foam pit, spin timing, commitment)
- Setup sheet adapts (no lap time — "best trick" or "session goal" instead)
- Fitness frames recovery around trick repetition not race intensity
- The data platform is identical. Only the language changes.

FMX is a massive underserved market. MD owns it by speaking their language,
which costs nothing extra because the infrastructure is already there.
