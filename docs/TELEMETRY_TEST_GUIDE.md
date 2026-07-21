# Telemetry Ingestion API — Test Guide

**Live Endpoint:** `https://motorsportsdata.io/api/telemetry/ingest`

---

## Method 1: Quick Test with CURL (Copy & Paste)

### Single Telemetry Point

```bash
curl -X POST https://motorsportsdata.io/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": 1720569600000,
    "sessionId": "race-2026-07-10",
    "riderId": "rider-123",
    "teamId": "team-factory-01",
    "heartRate": 170,
    "hrvMs": 28,
    "powerWatts": 315,
    "speedMph": 68.5,
    "cadenceRpm": 98,
    "lapNumber": 12,
    "sector": 3,
    "deviceId": "garmin-edge-1540",
    "deviceType": "garmin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "pointsIngested": 1,
  "pointsRejected": 0
}
```

---

### Batch Test (Send 5 Points at Once)

```bash
curl -X POST https://motorsportsdata.io/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '[
    {
      "timestamp": 1720569600000,
      "sessionId": "race-2026-07-10",
      "riderId": "rider-123",
      "teamId": "team-factory-01",
      "heartRate": 170,
      "powerWatts": 315,
      "speedMph": 68.5,
      "deviceId": "garmin-edge-1540",
      "deviceType": "garmin"
    },
    {
      "timestamp": 1720569602000,
      "sessionId": "race-2026-07-10",
      "riderId": "rider-123",
      "teamId": "team-factory-01",
      "heartRate": 171,
      "powerWatts": 318,
      "speedMph": 68.7,
      "deviceId": "garmin-edge-1540",
      "deviceType": "garmin"
    },
    {
      "timestamp": 1720569604000,
      "sessionId": "race-2026-07-10",
      "riderId": "rider-123",
      "teamId": "team-factory-01",
      "heartRate": 172,
      "powerWatts": 320,
      "speedMph": 68.9,
      "deviceId": "garmin-edge-1540",
      "deviceType": "garmin"
    },
    {
      "timestamp": 1720569606000,
      "sessionId": "race-2026-07-10",
      "riderId": "rider-123",
      "teamId": "team-factory-01",
      "heartRate": 173,
      "powerWatts": 322,
      "speedMph": 69.1,
      "deviceId": "garmin-edge-1540",
      "deviceType": "garmin"
    },
    {
      "timestamp": 1720569608000,
      "sessionId": "race-2026-07-10",
      "riderId": "rider-123",
      "teamId": "team-factory-01",
      "heartRate": 174,
      "powerWatts": 325,
      "speedMph": 69.3,
      "deviceId": "garmin-edge-1540",
      "deviceType": "garmin"
    }
  ]'
```

**Expected Response:**
```json
{
  "success": true,
  "pointsIngested": 5,
  "pointsRejected": 0
}
```

---

## Method 2: Test Page (No Terminal Required)

Go to: **`https://motorsportsdata.io/data/test-telemetry`**

This page allows you to:
- Send test data with a form
- View real-time responses
- Generate mock race data
- See ingestion logs

---

## Method 3: Node.js Test Script

Create a file called `test-telemetry.js`:

```javascript
// test-telemetry.js
const BASE_URL = 'https://motorsportsdata.io/api/telemetry/ingest'

async function testSinglePoint() {
  console.log('📤 Testing single telemetry point...')

  const point = {
    timestamp: Date.now(),
    sessionId: 'race-2026-07-10',
    riderId: 'rider-123',
    teamId: 'team-factory-01',
    heartRate: 170,
    powerWatts: 315,
    speedMph: 68.5,
    cadenceRpm: 98,
    deviceId: 'garmin-edge-1540',
    deviceType: 'garmin'
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(point)
    })

    const data = await response.json()
    console.log('✅ Response:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testBatch() {
  console.log('\n📤 Testing batch (10 points)...')

  const points = Array.from({ length: 10 }, (_, i) => ({
    timestamp: Date.now() + (i * 1000),
    sessionId: 'race-2026-07-10',
    riderId: 'rider-123',
    teamId: 'team-factory-01',
    heartRate: 170 + Math.random() * 10,
    powerWatts: 315 + Math.random() * 20,
    speedMph: 68.5 + Math.random() * 2,
    cadenceRpm: 98 + Math.random() * 5,
    deviceId: 'garmin-edge-1540',
    deviceType: 'garmin'
  }))

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(points)
    })

    const data = await response.json()
    console.log('✅ Response:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testInvalidData() {
  console.log('\n📤 Testing invalid data (should reject)...')

  const invalidPoint = {
    timestamp: Date.now(),
    // Missing required fields
    heartRate: 170
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPoint)
    })

    const data = await response.json()
    console.log('✅ Response:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Telemetry API Test Suite\n')
  console.log('Endpoint:', BASE_URL, '\n')

  await testSinglePoint()
  await testBatch()
  await testInvalidData()

  console.log('\n✅ All tests complete!')
}

runAllTests()
```

**Run it:**
```bash
node test-telemetry.js
```

---

## Method 4: Real Race Simulator (20-Point Stream)

This simulates a real race session with realistic data progression:

```bash
# Save as: simulate-race.sh

#!/bin/bash

BASE_URL="https://motorsportsdata.io/api/telemetry/ingest"
SESSION_ID="race-sim-$(date +%s)"
RIDER_ID="rider-demo"
TEAM_ID="team-demo"

echo "🏁 Starting race simulation..."
echo "Session ID: $SESSION_ID"
echo ""

for i in {1..20}; do
  # Simulate HR increasing over race
  HR=$((165 + i))
  
  # Simulate power varying
  POWER=$((280 + (RANDOM % 60)))
  
  # Simulate speed increasing
  SPEED=$(echo "65 + $i * 0.3" | bc)
  
  # Calculate lap (every 5 points = 1 lap)
  LAP=$(( (i - 1) / 5 + 1 ))
  SECTOR=$(( (i - 1) % 5 + 1 ))
  
  TIMESTAMP=$(($(date +%s) * 1000 + i * 1000))

  # Build JSON
  JSON=$(cat <<EOF
{
  "timestamp": $TIMESTAMP,
  "sessionId": "$SESSION_ID",
  "riderId": "$RIDER_ID",
  "teamId": "$TEAM_ID",
  "heartRate": $HR,
  "powerWatts": $POWER,
  "speedMph": $SPEED,
  "cadenceRpm": 98,
  "lapNumber": $LAP,
  "sector": $SECTOR,
  "deviceId": "garmin-edge-1540",
  "deviceType": "garmin"
}
EOF
)

  echo "Point $i/20 → HR: $HR, Power: $POWER W, Speed: $SPEED mph"

  # Send to API
  curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "$JSON" | jq .

  # Small delay between points
  sleep 0.5
done

echo ""
echo "✅ Race simulation complete!"
echo "Session: $SESSION_ID"
```

**Run it:**
```bash
chmod +x simulate-race.sh
./simulate-race.sh
```

---

## Field Reference

**Required Fields:**
- `timestamp` — Unix milliseconds (e.g., `Date.now()`)
- `sessionId` — Unique race session ID (e.g., `"race-2026-07-10"`)
- `riderId` — Rider UUID or ID (e.g., `"rider-123"`)
- `teamId` — Team UUID or ID (e.g., `"team-factory-01"`)
- `deviceId` — Device identifier (e.g., `"garmin-edge-1540"`)
- `deviceType` — One of: `"garmin"`, `"polar"`, `"apple_watch"`, `"wahoo"`, `"strava"`

**Optional Metrics (at least 1 required):**
- `heartRate` — Beats per minute (0-220)
- `hrvMs` — Heart rate variability in milliseconds (0-200)
- `temperature` — Core body temp in Celsius (36-39)
- `powerWatts` — Power output (0-2000)
- `speedMph` — Speed in mph (0-100)
- `cadenceRpm` — Pedal cadence (0-200)

**Optional Location:**
- `latitude` — Decimal degrees (-90 to 90)
- `longitude` — Decimal degrees (-180 to 180)
- `altitudeFt` — Elevation in feet

**Track Data:**
- `lapNumber` — Lap counter (1-1000)
- `sector` — Track section (1-12)

---

## What Happens After Ingestion

✅ **Stored:** Data saved in TimescaleDB `telemetry_metrics` hypertable
✅ **Aggregated:** 1-minute & 5-minute buckets auto-computed
✅ **Streamed:** Live subscribers notified (coaches watching dashboard)
✅ **Indexed:** Fast queries on sessionId, riderId, time
✅ **Compressed:** After 7 days, old data compressed (90% savings)
✅ **Retained:** 90-day retention policy (auto-delete after)

---

## Troubleshooting

**"No valid telemetry points provided"**
- Missing required fields (sessionId, riderId, teamId, deviceId, deviceType)
- No metrics provided (add heartRate, powerWatts, or speedMph)

**"Invalid content type"**
- Use `Content-Type: application/json` header

**Timeout**
- API is live but slow — check network
- Try single point first, then batch

**Success but no data in dashboard**
- TimescaleDB not enabled yet (run migration)
- Dashboard not subscribed to sessionId

---

## Next Steps

1. ✅ Test ingestion (this guide)
2. ⏳ Enable TimescaleDB (see `INFRASTRUCTURE_DEPLOYMENT.md`)
3. ⏳ Add live dashboard to coach console
4. ⏳ Configure device pairing (Garmin/Polar)
