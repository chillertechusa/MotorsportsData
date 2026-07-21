# Motorsports Data — Infrastructure Deployment Guide

**Status:** Production-ready TimescaleDB + WebSocket streaming  
**Target:** Factory coaches with real riders and live race telemetry  
**Estimated setup time:** 45 minutes  

---

## Architecture Overview

```
Wearables/Devices (Garmin, Apple Watch, Polar, MYLAPSTR2)
        ↓
  [Device Credential Store] ← Coaches manage credentials
        ↓
  [Telemetry Ingestion API] (/api/telemetry/ingest)
        ↓
  [TimescaleDB] Hypertables + Continuous Aggregates
        ↓
  ┌─────────────────────────────┐
  ├─→ [Live Query Helpers]      (Real-time metrics)
  ├─→ [WebSocket Broadcaster]   (Coach subscriptions)
  └─→ [Session Snapshots]       (End-of-race stats)
        ↓
  [Live Race Dashboard] ← Coaches watch real-time
```

---

## Step 1: Enable TimescaleDB on Neon

### 1a. Connect to Your Neon Instance

```bash
# Get your Neon connection string
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.neon.tech/motorsportsdata"

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### 1b. Run Migration

```bash
# Execute the TimescaleDB setup
psql $DATABASE_URL -f lib/db/migrations/001-timeseries-setup.sql
```

**Expected output:**
```
CREATE EXTENSION
SELECT 1
CREATE TABLE
SELECT create_hypertable
CREATE INDEX
...
```

### 1c. Verify Installation

```bash
psql $DATABASE_URL -c "
  SELECT extname FROM pg_extension WHERE extname = 'timescaledb';
  SELECT * FROM timescaledb_information.hypertables;
"
```

---

## Step 2: Configure Telemetry Ingestion

### 2a. Set Environment Variables

```bash
# Add to your .env.local or Vercel project settings

# Neon database (already set if using Supabase)
DATABASE_URL="postgresql://..."

# Telemetry config
TELEMETRY_BATCH_SIZE=100        # Buffer 100 points before DB write
TELEMETRY_BATCH_TIMEOUT_MS=500  # Or send after 500ms
TELEMETRY_MAX_QPS=1000          # 1000 points/second across all riders
```

### 2b. Test Ingestion Endpoint

```bash
# Single point
curl -X POST https://motorsportsdata.io/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": '$(date +%s000)',
    "sessionId": "test-session-001",
    "riderId": "rider-123",
    "teamId": "factory-01",
    "heartRate": 170,
    "powerWatts": 300,
    "speedMph": 65.5,
    "cadenceRpm": 95,
    "deviceId": "garmin-edge-1540-xyz",
    "deviceType": "garmin"
  }'

# Expected response:
# {"success": true, "pointsIngested": 1, "pointsRejected": 0}
```

---

## Step 3: Deploy WebSocket Streaming (Optional)

### 3a. For Development (In-Memory)

WebSocket broadcasting works out-of-the-box using in-memory subscriptions:

```typescript
import { telemetryBroadcaster } from '@/lib/websocket/telemetry-broadcast'

// Coach subscribes
telemetryBroadcaster.subscribe('coach-001', 'session-xyz', ['rider-1', 'rider-2'])

// Data flows in
telemetryBroadcaster.publish({
  type: 'TELEMETRY',
  sessionId: 'session-xyz',
  riderId: 'rider-1',
  timestamp: Date.now(),
  data: { heartRate: 170, power: 300, ... }
})
```

### 3b. For Production (Vercel KV + Ably Optional)

For production with multiple server instances, use message queue:

```bash
# Install optional deps
pnpm add ioredis @ably/web

# Set env vars
REDIS_URL="redis://..."
ABLY_API_KEY="your-ably-key"
```

**Note:** Current implementation works on single instance. For multi-region, upgrade to Redis pub/sub + Ably.

---

## Step 4: Database Queries

### 4a. Check Live Data

```bash
psql $DATABASE_URL -c "
  SELECT 
    COUNT(*) as total_points,
    MAX(time) as latest_data,
    COUNT(DISTINCT rider_id) as unique_riders,
    COUNT(DISTINCT session_id) as unique_sessions
  FROM telemetry_metrics;
"
```

### 4b. Monitor Hypertable Compression

```bash
psql $DATABASE_URL -c "
  SELECT 
    hypertable_name,
    num_chunks,
    ROUND(total_bytes / 1024.0 / 1024.0, 2) as size_mb,
    ROUND(compressed_bytes / 1024.0 / 1024.0, 2) as compressed_mb
  FROM hypertable_compression_stats;
"
```

### 4c. Test 1-Minute Aggregates

```bash
psql $DATABASE_URL -c "
  REFRESH MATERIALIZED VIEW telemetry_1m;
  SELECT * FROM telemetry_1m LIMIT 5;
"
```

---

## Step 5: Deploy to Production

### 5a: Package and Deploy

```bash
# Build
pnpm build

# Deploy to Vercel
vercel --prod --yes
```

### 5b: Verify Deployment

```bash
# Check health
curl https://motorsportsdata.io/api/telemetry/ingest \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Should respond with validation error (expected for test payload)
```

---

## Step 6: Test Live Streaming (Optional)

### Test Scenario: Live Race Session

```bash
#!/bin/bash
# Simulate a 10-minute race with 5 riders

SESSION_ID="race-2026-07-10-sx"
TEAM_ID="factory-rig-01"

for RIDER in rider-1 rider-2 rider-3 rider-4 rider-5; do
  for i in {1..600}; do  # 600 seconds = 10 minutes
    HR=$((150 + RANDOM % 40))
    POWER=$((200 + RANDOM % 150))
    SPEED=$(echo "scale=1; 40 + $RANDOM / 1000" | bc)
    
    curl -s -X POST https://motorsportsdata.io/api/telemetry/ingest \
      -H "Content-Type: application/json" \
      -d "{
        \"timestamp\": $(($(date +%s) * 1000 + i * 1000)),
        \"sessionId\": \"$SESSION_ID\",
        \"riderId\": \"$RIDER\",
        \"teamId\": \"$TEAM_ID\",
        \"heartRate\": $HR,
        \"powerWatts\": $POWER,
        \"speedMph\": $SPEED,
        \"cadenceRpm\": 90,
        \"deviceId\": \"device-$RIDER\",
        \"deviceType\": \"garmin\"
      }" &
    
    sleep 0.1  # 10 Hz sampling
  done
done

echo "Simulation complete. Check dashboard for live metrics."
```

---

## Step 7: Monitoring & Maintenance

### 7a: Database Size

```bash
# Check total DB size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Check table breakdown
psql $DATABASE_URL -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### 7b: Query Performance

```bash
# Log slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();
```

### 7c: Compression Status

```bash
# Neon background job compresses automatically every 6 hours
# Check compression progress:
psql $DATABASE_URL -c "
  SELECT 
    chunk_name,
    is_compressed,
    ROUND(chunk_bytes / 1024.0 / 1024.0, 2) as size_mb,
    ROUND(compressed_chunk_bytes / 1024.0 / 1024.0, 2) as compressed_mb
  FROM chunk_compression_stats
  ORDER BY chunk_bytes DESC
  LIMIT 10;
"
```

---

## Troubleshooting

### Issue: "Extension 'timescaledb' not found"

**Solution:** Neon doesn't ship TimescaleDB by default on all instances.

```bash
# Option 1: Use Neon's managed TimescaleDB
# In Neon dashboard: Add "TimescaleDB" extension
# Then run the migration again

# Option 2: Use Supabase PostgreSQL (includes TimescaleDB)
# Supabase PostgreSQL is TimescaleDB-ready by default
```

### Issue: Ingestion is slow (< 1000 points/sec)

**Solution:** Batch writes and enable compression.

```bash
# Verify batch size in API
# In app/api/telemetry/ingest/route.ts:
// Points should be batched: Array<TelemetryPoint>

# Test batch ingestion
curl -X POST https://motorsportsdata.io/api/telemetry/ingest \
  -H "Content-Type: application/json" \
  -d '[
    { timestamp: ..., heartRate: 170, ... },
    { timestamp: ..., heartRate: 171, ... },
    ...
  ]'
```

### Issue: WebSocket not broadcasting

**Solution:** Check subscription count.

```typescript
import { telemetryBroadcaster } from '@/lib/websocket/telemetry-broadcast'

console.log('Active sessions:', telemetryBroadcaster.getActiveSessions())
console.log('Subscribers:', telemetryBroadcaster.getSubscriberCount('session-id'))
```

---

## Performance Expectations

| Metric | Expected | Notes |
|--------|----------|-------|
| Ingestion Rate | 10k points/sec | Across all riders |
| Query Latency (1-min agg) | < 50ms | From continuous view |
| Query Latency (raw data) | < 200ms | Full table scan |
| Storage (per rider-season) | ~500 MB | Raw + compressed |
| WebSocket Broadcast | < 100ms | To all subscribers |

---

## Next Steps

1. ✅ Enable TimescaleDB
2. ✅ Test ingestion endpoint
3. ✅ Deploy to production
4. ✅ Monitor first race session
5. **Start pilot with coaches** — They upload their rider data
6. **Iterate on query performance** — Add more indexes as needed
7. **Scale WebSocket** — Upgrade to Redis if multi-region

---

**Platform is ready for live telemetry. Start your first race session.**
