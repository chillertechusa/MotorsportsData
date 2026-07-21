# Telemetry API — Quick Start (5 Minutes)

## Option 1: Web UI (Easiest — No Terminal)

1. Go to: **https://motorsportsdata.io/data/test-telemetry**
2. Click: **"Send Single Point"** button (green)
3. See response in Activity Log below
4. Try: **"Send Batch (5 points)"** button (blue)
5. Done! ✅

---

## Option 2: CURL (Copy & Paste)

**Open Terminal and run:**

```bash
curl -X POST https://motorsportsdata.io/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": 1720569600000,
    "sessionId": "race-test-1",
    "riderId": "rider-123",
    "teamId": "team-demo",
    "heartRate": 170,
    "powerWatts": 315,
    "speedMph": 68.5,
    "cadenceRpm": 98,
    "deviceId": "garmin-edge",
    "deviceType": "garmin"
  }'
```

**You should see:**
```json
{
  "success": true,
  "pointsIngested": 1,
  "pointsRejected": 0
}
```

---

## Option 3: Node.js Script

**Create file: `test.js`**
```javascript
const point = {
  timestamp: Date.now(),
  sessionId: "race-test-" + Date.now(),
  riderId: "rider-123",
  teamId: "team-demo",
  heartRate: 170,
  powerWatts: 315,
  speedMph: 68.5,
  deviceId: "garmin-edge",
  deviceType: "garmin"
}

fetch('https://motorsportsdata.io/api/telemetry/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(point)
})
.then(r => r.json())
.then(d => console.log('✅', d))
.catch(e => console.error('❌', e))
```

**Run:**
```bash
node test.js
```

---

## What to Test

| Test | Command | Expected |
|------|---------|----------|
| **Single point** | Send 1 telemetry point | `pointsIngested: 1` |
| **Batch** | Send 5 points at once | `pointsIngested: 5` |
| **Missing fields** | Omit `sessionId` | `"No valid points"` |
| **No metrics** | Only send IDs, no HR/power/speed | `"No valid points"` |

---

## Success Checklist

- [ ] Test page loads: https://motorsportsdata.io/data/test-telemetry
- [ ] Single point test returns 200 OK
- [ ] Batch test ingests 5 points
- [ ] Invalid data test is rejected
- [ ] View activity log in web UI

---

## Next: Enable the Database

Once API ingestion works, enable TimescaleDB:

```bash
psql $DATABASE_URL -f lib/db/migrations/001-timeseries-setup.sql
```

Then data will be stored in the real database instead of just acknowledged by the API.

---

## Full Docs

See: `docs/TELEMETRY_TEST_GUIDE.md` for advanced testing, race simulator, Node.js script, and troubleshooting.
