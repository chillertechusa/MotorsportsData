# Championship Standings Integration — Strategic Analysis

## The Business Need

Coaches need to know:
- Current championship leader (points)
- Rider's current standing (out of field)
- Points behind leader
- Remaining rounds
- Elimination status (if applicable)

Why it matters:
- Coaches make training decisions based on championship position
- Affects mental preparation and race strategy
- Riders want to see their ranking
- Creates urgency ("X points back, Y rounds left")

---

## Available Integration Options

### Option 1: No Official API (SuperMotocross Reality)

**Status:** SuperMotocross does NOT provide public API
- Data available on website + mobile app only
- No programmatic access officially available
- Data hidden behind dynamic rendering (not easily scrapeable)

**Workaround Options:**
A) Manual data entry (coaches input standings)
B) Web scraping (Motocross Mecca, MotoResults)
C) Third-party sports data API
D) Build custom scraper for supermoto.com

---

### Option 2: Web Scraping (DIY)

**Approach:**
Scrape MotoResults or Motocross Mecca (static HTML tables)

**Pros:**
- Free
- Real-time data
- Works with existing sources
- No third-party dependency

**Cons:**
- Fragile (breaks if HTML structure changes)
- Terms of service risk (scraping violation)
- Requires maintenance
- Rate limiting needed (be respectful)

**Implementation:**
```python
# Pseudocode
from bs4 import BeautifulSoup
import requests

url = "https://www.motocrossmecca.com/standings/2025/sx/"
html = requests.get(url).text
soup = BeautifulSoup(html, 'html.parser')

# Parse standings table
standings = []
for row in soup.find_all('tr', class_='rider-row'):
  standings.append({
    'rank': row.find('td', class_='rank').text,
    'rider': row.find('td', class_='rider').text,
    'points': row.find('td', class_='points').text,
  })
```

**Effort:** 4-8 hours (parse + integrate + error handling)

---

### Option 3: Manual Data Entry (Coaches Update)

**Approach:**
Dashboard page where coaches manually input current standings

**Pros:**
- Always accurate (coaches know real data)
- No external dependencies
- Zero integration complexity
- Coaches own the data

**Cons:**
- Requires manual update each round
- Error-prone (typos)
- Not real-time
- Work for coach (extra clicks)

**Implementation:**
- Create `/data/standings` page
- Form to input: 2025 SX Championship, Round 8, standings table
- Store in DB
- Display on dashboard

**Effort:** 2-4 hours (form + storage + display)

---

### Option 4: Third-Party Sports API (SportMonks, DataSportsGroup)

**Status:** Unclear support for Motocross
- SportMonks focused on F1, not Supercross
- DataSportsGroup might support (need to contact)
- Starting at $79-200/month

**Pros:**
- Official data
- Reliable
- Customer support

**Cons:**
- Probably don't support Motocross/Supercross
- Expensive
- Vendor lock-in
- May not be worth cost

**Effort:** Unknown (need to contact vendors)

---

### Option 5: Official SuperMotocross Integration (Long-term)

**Approach:**
Request API access from Feld Entertainment (SuperMotocross owner)

**Pros:**
- Official data
- Reliable
- Legal

**Cons:**
- Probably won't grant access to small company
- Long sales cycle
- Expensive partnership
- Unlikely to happen

**Effort:** Unknown (business + BD)

---

## Recommended Approach: Hybrid (Smart)

### Phase 1 (This Week): Manual Data Entry
- Create `/data/standings` page
- Coaches manually input championship standings
- Store in DB
- Display on dashboard (with last-update timestamp)

**Why:**
- Fast (2-4 hours)
- Accurate (coaches know real data)
- No external dependencies
- Works immediately
- Zero risk

### Phase 2 (Later): Automated Scraping
- Build scraper for Motocross Mecca
- Automatic daily updates
- Alert coach if standings changed

**Why:**
- Remove manual work
- Stay up-to-date
- Not critical path

### Phase 3 (If Needed): Official API
- Contact Feld Entertainment for API access
- Migrate from scraper to official API

**Why:**
- Only if scraper becomes unreliable
- Business relationship building
- Long-term stability

---

## Implementation Plan (Phase 1: Manual Entry)

### Files to Create

**1. Database Schema Addition**
```sql
-- Add to existing migrations
CREATE TABLE md_championships (
  id UUID PRIMARY KEY,
  team_id UUID,
  sport VARCHAR(50),         -- 'supercross', 'motocross', 'sx', 'pro_motocross'
  year INT,                  -- 2025
  series VARCHAR(100),       -- 'AMA Supercross 2025', 'Pro Motocross 2025'
  current_round INT,         -- Which round we're in (1-17)
  total_rounds INT,          -- How many rounds total (usually 17)
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);

CREATE TABLE md_championship_standings (
  id UUID PRIMARY KEY,
  championship_id UUID,
  rank INT,                  -- 1st, 2nd, 3rd, etc
  rider_name VARCHAR(255),   -- 'Chase Sexton'
  rider_number INT,          -- 4
  team_name VARCHAR(255),    -- 'Honda HRC'
  points INT,                -- Current points total
  rounds_completed INT,      -- How many races completed
  last_result VARCHAR(50),   -- 'DNF', '1st', '4th', etc
  created_at TIMESTAMPTZ
);
```

**2. API Endpoints**
- `POST /api/championships` — Create new championship tracking
- `GET /api/championships?teamId=X` — Get current championship
- `POST /api/championships/[id]/standings` — Update standings
- `GET /api/championships/[id]/standings` — Get current standings

**3. UI Components**
- `components/data/championship-widget.tsx` — Display top 5 riders
- `components/data/championship-table.tsx` — Full standings table
- `app/data/standings/page.tsx` — Full standings page
- `app/data/standings/edit/page.tsx` — Coach input form

**4. Features**
- Display: Top 5 riders prominently on dashboard
- Alert: "Your rider is X points behind leader"
- Trend: Show last race result for context
- Input form: Copy/paste from official results, auto-parse

**Effort:** 6-8 hours dev + 1 hour testing

---

## Dashboard Integration

Where to show standings:

**1. Coach Console (Primary)**
```
┌─────────────────────────────────────┐
│ 2025 AMA Supercross Championship    │
│ Round 8 of 17                       │
├─────────────────────────────────────┤
│ 1. Chase Sexton (Honda)    485 pts  │
│ 2. Jett Lawrence (KTM)     480 pts  │ ← Your rider: -5
│ 3. Cooper Webb (Yamaha)    475 pts  │
│ 4. Jason Anderson (KTM)    470 pts  │
│ 5. Malcolm Stewart (Yam)   465 pts  │
│                                     │
│ [View Full Standings]               │
└─────────────────────────────────────┘
```

**2. Full Standings Page**
- All riders, all points
- Sortable by points/rank
- Filter by brand
- Last updated timestamp
- [Edit Standings] button (coach only)

**3. Rider Profile**
- Show rider's current championship standing
- Points from leader
- Rounds remaining to catch up
- Points needed to win

---

## Future Enhancement: Scraper Bot

Once manual works, add automation:

```typescript
// lib/standings/scraper.ts
export async function scrapeMotocrossMeccaStandings(year: number, series: 'sx' | 'pro') {
  // Fetch HTML from Motocross Mecca
  // Parse standings table
  // Update MD database
  // Alert coach if standings changed
  // Log changes for audit trail
}

// Run on cron: Every night at 11 PM
// If standings changed: Send coach notification
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Coaches enter wrong data | Validation + confirm before saving |
| Forget to update standings | Email reminder before each round |
| Wrong rider matched | Double-check rider number + team |
| Display stale data | Show "Last updated: X ago" |
| Scraper breaks in Phase 2 | Fall back to manual entry |

---

## Timeline

**Week 1 (Phase 1: Manual Entry)**
- Mon: Schema + API (3 hours)
- Tue-Wed: UI components + form (3 hours)
- Thu: Testing + integration (2 hours)
- Total: 8 hours

**Week 2+ (Phase 2: Scraper)**
- Scraper implementation (4 hours)
- Error handling (2 hours)
- Cron job + alerts (2 hours)
- Total: 8 hours

---

## Competitive Positioning

**Current State (MD without standings):**
- Coaches track standings externally
- Manual jumping between apps

**After Phase 1 (Manual entry):**
- ✓ Standings visible in coach console
- ✓ Single source of truth for team
- ✓ Rider sees their championship position
- ✓ Context for race strategy

**After Phase 2 (Scraper):**
- ✓ Automatic updates
- ✓ No manual work
- ✓ Alert coach if position changed
- ✓ Historical tracking

---

## Recommendation: Start Phase 1 This Week

1. Build standings schema + API (3 hours)
2. Create input form + display widget (3 hours)
3. Test with pilot coach (2 hours)
4. Deploy to production

**Cost:** 8 hours dev, 0 external dependencies, immediate value

**ROI:** Coaches have live championship context, increases product stickiness

---

## Open Questions

1. Should this be team-wide (all riders in same championship) or per-rider?
2. Should we track multiple championships (SX, 250SX, Pro Motocross)?
3. Do coaches want historical standings (week 1 vs week 8)?
4. Should we alert if coach's rider moves up/down in standings?

