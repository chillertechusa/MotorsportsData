# Session Management — Race Control

## Overview

Session Management allows coaches to track and control race sessions in real-time. Coaches can:

- Create race sessions (motocross, SX, enduro, FMX, flat track)
- Start/stop sessions with one click
- Auto-upload telemetry when session ends
- Link sessions to coach assignments
- View real-time telemetry during active sessions
- Track per-rider performance within sessions

## Database Schema

Three tables track session data:

### md_sessions
Main session record with metadata and status.

```sql
CREATE TABLE md_sessions (
  id UUID PRIMARY KEY,
  team_id UUID,
  assignment_id UUID,           -- Link to coach assignment
  name VARCHAR(255),            -- "SX Las Vegas Round 5"
  discipline VARCHAR(50),       -- motocross|sx|enduro|fmx|flat_track
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status VARCHAR(50),           -- pending|active|completed|archived
  rider_ids UUID[],
  rider_count INT,
  total_telemetry_points BIGINT,
  created_at TIMESTAMPTZ
);
```

### md_session_riders
Many-to-many: tracks per-rider performance within a session.

```sql
CREATE TABLE md_session_riders (
  id UUID PRIMARY KEY,
  session_id UUID,
  rider_id UUID,
  avg_readiness_at_start SMALLINT,
  avg_heart_rate SMALLINT,
  max_heart_rate SMALLINT,
  avg_power SMALLINT,
  max_power SMALLINT,
  best_lap_seconds NUMERIC(6,2),
  total_telemetry_points BIGINT
);
```

### md_session_uploads
Log of telemetry uploads for each session-rider pair.

```sql
CREATE TABLE md_session_uploads (
  id UUID PRIMARY KEY,
  session_id UUID,
  rider_id UUID,
  device_id VARCHAR(255),       -- Garmin, Polar, etc.
  telemetry_start TIMESTAMPTZ,
  telemetry_end TIMESTAMPTZ,
  point_count BIGINT,
  status VARCHAR(50),           -- success|partial|failed
  uploaded_at TIMESTAMPTZ
);
```

## API Endpoints

### POST /api/sessions
Create a new race session.

**Request:**
```json
{
  "teamId": "team-123",
  "name": "SX Las Vegas Round 5",
  "discipline": "sx",
  "location": "Las Vegas Motor Speedway",
  "weather": "Clear, 85°F",
  "riderIds": ["rider-1", "rider-2", "rider-3"],
  "assignmentId": "assignment-123"
}
```

**Response:**
```json
{
  "id": "session-abc123",
  "teamId": "team-123",
  "name": "SX Las Vegas Round 5",
  "status": "pending",
  "riderCount": 3,
  "totalTelemetryPoints": 0,
  "createdAt": "2026-07-10T18:00:00Z"
}
```

### GET /api/sessions
List sessions for a team.

**Query Parameters:**
- `teamId` (required) — Team ID
- `status` (optional) — Filter by status: pending, active, completed, archived

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-abc123",
      "name": "SX Las Vegas Round 5",
      "status": "active",
      "startTime": "2026-07-10T20:00:00Z",
      "riderCount": 3,
      "totalTelemetryPoints": 45000
    }
  ],
  "total": 1
}
```

### POST /api/sessions/[sessionId]/control
Start or stop a session.

**Request:**
```json
{
  "action": "start|stop|complete",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "sessionId": "session-abc123",
  "action": "start",
  "status": "active",
  "timestamp": "2026-07-10T20:00:00Z",
  "message": "Session started successfully"
}
```

When a session stops, the API automatically:
1. Records end_time
2. Calculates duration
3. Aggregates telemetry stats (avg HR, power, etc.)
4. Triggers telemetry upload for connected devices
5. Updates per-rider performance metrics

## UI Component

### RaceControl Component

Drop-in React component for session management.

**Props:**
```tsx
interface RaceControlProps {
  teamId: string
  onSessionCreated?: (session: Session) => void
}
```

**Usage:**
```tsx
import { RaceControl } from '@/components/data/race-control'

export default function SessionsPage() {
  return <RaceControl teamId="team-123" />
}
```

**Features:**
- Create new sessions form
- Active session alert (with stop button)
- Sessions list with status badges
- Start/Stop/Complete actions
- Real-time data refresh (5s polling)

## Workflow

### Coach Creates and Starts a Session

1. **Create**: Coach fills form (name, discipline, location, riders)
   - Session created with status = `pending`
   - Telemetry upload log created for each rider+device pair

2. **Start**: Coach clicks "Start Session"
   - Status changes to `active`
   - Session `start_time` recorded
   - UI shows "Session Active" alert
   - Telemetry begins flowing to `telemetry_metrics` table

3. **Monitor**: Coach watches real-time dashboard
   - Live HR, power, speed, readiness updates
   - Per-rider metrics updated every 1 minute
   - Websocket streams live data

4. **Stop**: Coach clicks "Stop Session"
   - Status changes to `completed`
   - Session `end_time` recorded
   - Duration calculated
   - Telemetry upload triggered for all riders
   - Per-rider performance aggregated
   - Readiness recalculated
   - Session marked as acknowledged by coach

### Auto-Upload Telemetry

When a session stops, the system:

1. Queries all `device_credentials` for riders in session
2. Fetches telemetry from each device (Garmin, Polar, Apple, etc.)
3. Filters to session time window (`start_time` → `end_time`)
4. Stores in `md_session_uploads` log
5. Records point count, duration, status

**If any device fails to upload:**
- Session status stays `completed` (race is done)
- Partial upload logged
- Coach can manually trigger retry

## Integration with Other Features

### Link to Coach Assignments

When creating a session, specify `assignmentId`:

```typescript
const session = await createSession({
  teamId,
  name: 'SX Las Vegas',
  assignmentId: 'assignment-123',  // Link to coach protocol
})
```

This links the session to a specific coach assignment (readiness protocol, taper, etc.).

### Readiness Recalculation

After session completes:

1. Aggregate session telemetry → avg HR, power, HRV
2. Calculate post-session readiness using formula
3. Store in `md_session_riders.readiness_at_end`
4. Update rider's current readiness score

### Export Session Data

Export session as CSV:

```bash
GET /api/analytics/export?type=session&sessionId=session-123&format=csv
```

Returns CSV with:
- Per-rider metrics (HR, power, lap times)
- Telemetry upload log
- Readiness pre/post
- Session metadata

## Next Steps

### To Deploy:

1. Run migration: `psql $DATABASE_URL -f lib/db/migrations/002-sessions-setup.sql`
2. Test API endpoints with test data
3. Integrate session page into coach console
4. Wire auto-upload telemetry on session stop
5. Connect readiness recalculation

### To Expand:

- **Mobile app**: Start/stop sessions from pit side
- **Coaching protocols**: Auto-apply coach assignment when session created
- **Alerts**: Notify coaches when HR exceeds threshold during active session
- **Exports**: Generate post-race reports automatically
- **Leaderboards**: Live session leaderboard (if multi-team feature)

## Testing

### Test Create Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "team-123",
    "name": "Test Session",
    "discipline": "motocross",
    "riderIds": ["rider-1", "rider-2"]
  }'
```

### Test Start Session

```bash
curl -X POST http://localhost:3000/api/sessions/session-abc123/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### Test Stop Session

```bash
curl -X POST http://localhost:3000/api/sessions/session-abc123/control \
  -H "Content-Type: application/json" \
  -d '{"action": "complete"}'
```

### Access UI

Navigate to: `http://localhost:3000/data/sessions`

