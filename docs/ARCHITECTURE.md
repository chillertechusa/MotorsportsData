# Motorsports Data Platform — Architecture

## Overview

Motorsports Data is a professional coaching platform for elite motocross riders. It integrates telemetry from 20+ devices, analyzes readiness scores, and provides accountability tracking.

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- uPlot (charting), Deck.gl (maps)

**Backend:**
- Supabase (auth, RLS)
- Neon PostgreSQL + Drizzle ORM
- TimescaleDB (time-series telemetry)
- AWS S3 (file storage)
- AWS Lambda (async parsing)

**Real-Time:**
- WebSocket subscriptions
- Server-Sent Events (optional)

## Database Schema

### Core Tables (Supabase)
```
- mdCoachTemplates — Encrypted templates
- mdCoachTemplateAccessLog — Immutable audit trail
- mdCoachAssignments — Rider assignments
- mdAssignmentAuditLog — Compliance tracking
- mdTelemetryDevices — Device registry
- mdTelemetryImports — File import records
```

### Time-Series (TimescaleDB)
```
- telemetry_metrics (hypertable) — 100M+ rows, partitioned by day
- telemetry_aggregates (materialized view) — 1m/5m/1h buckets
- lap_data — Lap summary records
```

## API Structure

### REST Endpoints
```
GET /api/telemetry/metrics?sessionId=X&riderId=Y&startTime=T1&endTime=T2
GET /api/telemetry/laps?sessionId=X&riderId=Y
GET /api/telemetry/comparison?sessionId=X&riderId1=A&riderId2=B
POST /api/md-telemetry/import — File upload
```

### WebSocket
```
/ws/telemetry/session/{sessionId}/rider/{riderId} — Live metrics
/ws/readiness/{riderId} — Readiness updates
```

## Data Flow

1. **Device Upload** → S3 bucket
2. **Lambda trigger** → Parse file (CSV/XML/FIT)
3. **Normalize** → Device field mapper
4. **Store** → TimescaleDB hypertable
5. **Aggregate** → 1m/5m continuous aggregates
6. **Broadcast** → WebSocket to dashboard

## Security

- **RLS (Row-Level Security)** on all Supabase tables
- **Encryption at rest** on coach templates
- **Immutable audit logs** for assignments
- **IP address tracking** on all actions
- **Rate limiting** on API endpoints

## Performance

- TimescaleDB compression (30+ days)
- Materialized views for fast aggregates
- Canvas waveform renderer (100k points @ 60fps)
- Continuous aggregates auto-refresh

## Deployment

**Production:**
```bash
vercel --prod
```

**Live URLs:**
- `motorsportsdata.io` — Main platform
- `motorsportsdata.io/data/demo` — Demo telemetry
- `motorsportsdata.io/data/race-team` — Coach console
```

## Next Steps

1. Configure TimescaleDB in Neon
2. Set up AWS S3 + Lambda
3. Integrate WebSocket for live streams
4. Load coach onboarding cohort

