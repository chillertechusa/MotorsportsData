# PRE-CHECKOUT RIDER AGENT — High Priority Build Plan

## Vision
Interactive AI agent that logs real session data **before checkout** so riders see actual platform value with **their own data**. No promises, no fluff — just data. This is a massive conversion unlock because riders can instantly see: "This platform understands my riding and can make me faster."

## Strategic Value
- **Problem**: Riders don't want to subscribe without seeing if the platform works for their style
- **Solution**: Upload a quick session, get instant AI insights, see lap efficiency gaps, suspension tuning opportunities, fitness correlations
- **Outcome**: Data-driven conviction before payment → higher conversion rate, lower churn, better retention

## Core Flows

### User Journey
1. Rider lands on pricing / clicks "Get Started"
2. **Pre-checkout**: "See Your Potential First" CTA → rider agent modal opens
3. **Session Logging**: Rider enters:
   - Lap times (min/avg/max)
   - Track name or conditions (sand/clay/mixed)
   - Bike info (bike model, fuel type)
   - Throttle/brake/lean angle (if device available) or estimated
   - Duration, weather, fatigue level (1-10)
4. **AI Analysis** (via eve agent or streaming):
   - Parse telemetry → identify efficiency gaps
   - Compare vs pro data for same track
   - Suggest setup tweaks (suspension, gearing, tire pressure)
   - Estimate lap time potential if setup optimized
   - Show correlation: fitness level → performance
5. **Result Card**:
   - "You're losing ~0.8s per lap to efficiency" (with confidence %)
   - "If you optimize suspension for sand, expect +0.3s"
   - "Your fitness is solid, but off-throttle control needs work"
   - **CTA**: "Unlock Full Analysis" → upgrade or signup
6. **Track Engagement**: Did rider see value? Did they convert?

## Technical Architecture

### Pages & Routes
- `/data/rider-agent` — Standalone demo page
- Modal overlay option in `/data/pricing` for pre-checkout trigger
- `/data/rider-agent/results` — Personalized insights page

### Components
- `RiderAgentForm` — Session input (lap times, conditions, bike, feeling)
- `RiderAgentStream` — Real-time AI response streaming
- `InsightCard` — Display efficiency gaps, tuning suggestions, potential gains
- `ComparisonChart` — Rider's lap vs pro baseline vs optimized potential

### AI Agent (eve or streaming)
- **Input**: Session telemetry + rider metadata
- **Context**: Track database (sand, clay, mixed, MX tracks vs SX)
- **System prompt**: "You're a motocross coach analyzing a rider's session. Be concise, data-driven, actionable."
- **Outputs**:
  - Lap efficiency % (vs pro baseline)
  - Top 3 setup improvements + expected lap gain
  - Fitness assessment (correlate HRV, fatigue input to performance)
  - Confidence levels for each recommendation
  - "Unlock in Race Team tier: Full historical analysis, comparison vs teammates"

### Database Schema (minimal)
```sql
mdRiderAgentSessions {
  id: UUID
  user_id: UUID | null  -- anonymous or signed-in
  plan_id: string  -- "rookie" "privateer" "race-team" "factory"
  session_data: JSON  -- lap times, conditions, bike, feeling
  ai_insights: JSON  -- parsed recommendations, efficiency %, gains
  engagement_metrics: {
    viewed: bool
    clicked_upgrade: bool
    converted_to_paid: bool
    time_to_conversion: seconds
  }
  created_at: timestamp
}
```

### API Endpoints
- `POST /api/md-rider-agent/analyze` — Submit session → get AI insights
- `GET /api/md-rider-agent/results/:id` — Fetch persisted insights
- `POST /api/md-rider-agent/engagement` — Track: viewed, clicked, converted

### Feature Flags (for A/B test)
- Enable pre-checkout modal for 50% of visitors
- Track conversion lift vs control group
- Measure: engagement rate, completion rate, conversion rate, ROAS

## Implementation Priority

### Phase 1: MVP (3-5 days)
- Form component (lap times, track, bike, feeling)
- Streaming AI agent integration (eve or `/api/chat`)
- Basic insight cards (efficiency %, top 3 suggestions)
- Results page display
- `/data/rider-agent` standalone page

### Phase 2: Engagement & Tracking (2-3 days)
- mdRiderAgentSessions table + RLS
- Engagement tracking (viewed, clicked, converted)
- Admin dashboard: conversion funnel, rider segments
- A/B test feature flag (pre-checkout modal)

### Phase 3: Optimization (ongoing)
- Refine AI prompts based on rider feedback
- Add track database (pro baselines, elevation, difficulty)
- Correlation analysis: fitness → lap times → conversion
- Retargeting: riders who engaged but didn't convert

## Success Metrics
- **Engagement**: % of visitors who open agent
- **Completion**: % who submit session data
- **Conversion**: % who sign up after seeing insights
- **ROAS**: Revenue per rider agent interaction
- **Retention**: Do agent-converted riders stay longer than cold signups?

## Anti-Patterns to Avoid
- Don't gate pro data behind signup (show enough to prove value)
- Don't make form too long (3-5 inputs max, use placeholders)
- Don't give vague AI responses ("You're good, keep practicing")
- Don't forget to track ROI (if it doesn't convert better, kill it)

## Competitive Advantage
- **Unique**: No other motorsports platform does this pre-checkout
- **Moat**: Rider sees their own data in MD's system → switching cost goes up
- **Scalable**: Template works for SX, Enduro, Flat Track, Drag Racing
