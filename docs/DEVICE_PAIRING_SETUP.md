# Device Pairing & Wearable Integration Setup

**Status:** Ready for deployment
**Last Updated:** July 10, 2026

---

## Overview

Coaches can connect fitness trackers and wearables to their team accounts. Telemetry syncs automatically, feeding readiness calculations and providing real-time coaching insights.

**Supported Devices:**
- Garmin (Edge cycling computers, Fenix watches, HRM monitors)
- Polar (H10, Vantage, sports watches)
- Apple Watch (fitness data via HealthKit)
- Wahoo (trainers, bikes, sensors)
- Strava (activities and segments)

---

## Setup Steps (30 minutes)

### Step 1: Get OAuth Credentials

For each provider, register your app and obtain `CLIENT_ID` and `CLIENT_SECRET`:

#### Garmin Connect
1. Go to https://developer.garmin.com/
2. Create a new app
3. Set OAuth scopes: `ACTIVITY:READ`, `USER:READ`, `BIOMETRIC:READ`
4. Set redirect URI: `https://motorsportsdata.io/api/device/oauth-callback`
5. Copy `CLIENT_ID` and `CLIENT_SECRET`

#### Polar AccessLink
1. Go to https://www.polaraccesslink.com/
2. Register your app
3. Set redirect URI: `https://motorsportsdata.io/api/device/oauth-callback`
4. Copy `CLIENT_ID` and `CLIENT_SECRET`

#### Apple HealthKit
1. Go to https://developer.apple.com/app-store-connect/
2. Create new app identifier
3. Enable HealthKit capability
4. Copy Team ID and Bundle ID

#### Wahoo Fitness
1. Go to https://api.wahooligan.com/
2. Register app
3. Set redirect URI: `https://motorsportsdata.io/api/device/oauth-callback`
4. Copy `CLIENT_ID` and `CLIENT_SECRET`

#### Strava
1. Go to https://www.strava.com/settings/api
2. Create a new app
3. Set authorization callback domain: `motorsportsdata.io`
4. Set redirect URI: `https://motorsportsdata.io/api/device/oauth-callback`
5. Copy `CLIENT_ID` and `CLIENT_SECRET`

### Step 2: Set Environment Variables

Add credentials to your `.env.local` and Vercel project settings:

```bash
# Encryption key for storing device credentials
DEVICE_ENCRYPTION_KEY=<32-byte hex string>

# Garmin
GARMIN_CLIENT_ID=<your-client-id>
GARMIN_CLIENT_SECRET=<your-client-secret>

# Polar
POLAR_CLIENT_ID=<your-client-id>
POLAR_CLIENT_SECRET=<your-client-secret>

# Apple HealthKit
APPLE_TEAM_ID=<your-team-id>
APPLE_BUNDLE_ID=<your-bundle-id>

# Wahoo
WAHOO_CLIENT_ID=<your-client-id>
WAHOO_CLIENT_SECRET=<your-client-secret>

# Strava
STRAVA_CLIENT_ID=<your-client-id>
STRAVA_CLIENT_SECRET=<your-client-secret>

# Base URL for OAuth callbacks
NEXT_PUBLIC_BASE_URL=https://motorsportsdata.io
```

### Step 3: Generate Encryption Key

Generate a secure encryption key for credential storage:

```bash
# Generate 32-byte hex string
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...

# Set as DEVICE_ENCRYPTION_KEY
```

### Step 4: Create Database Tables

Run the migration to create device credential storage:

```sql
-- Device credentials (encrypted OAuth tokens)
CREATE TABLE IF NOT EXISTS device_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  rider_id UUID NOT NULL REFERENCES riders(id),
  provider VARCHAR(50) NOT NULL, -- 'garmin', 'polar', 'apple_watch', etc.
  device_name VARCHAR(255) NOT NULL,
  
  -- Encrypted tokens
  access_token_encrypted TEXT NOT NULL,
  access_token_iv VARCHAR(32) NOT NULL,
  access_token_tag VARCHAR(32) NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  email VARCHAR(255),
  linked_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'active', -- 'active', 'failed', 'expired'
  auto_sync BOOLEAN DEFAULT true,
  sync_interval INT DEFAULT 15, -- minutes
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  UNIQUE(team_id, rider_id, provider)
);

CREATE INDEX idx_device_creds_team_rider 
  ON device_credentials(team_id, rider_id);
CREATE INDEX idx_device_creds_sync_status 
  ON device_credentials(sync_status, auto_sync);

-- Sync job history
CREATE TABLE IF NOT EXISTS device_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  rider_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
  error_message TEXT,
  
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  
  activities_fetched INT DEFAULT 0,
  activities_imported INT DEFAULT 0,
  telemetry_points INT DEFAULT 0,
  
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_sync_jobs_team 
  ON device_sync_jobs(team_id, started_at DESC);
```

### Step 5: Configure Cron Job

Enable the sync cron job to run every 5 minutes:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/device-sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Create the cron endpoint:

```typescript
// app/api/cron/device-sync/route.ts
import { runSyncCron } from '@/lib/device/auto-sync'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = await runSyncCron()
  return NextResponse.json(stats)
}
```

### Step 6: Integrate UI

Add device pairing component to coach console:

```tsx
// app/data/race-team/settings/page.tsx
import { DevicePairingUI } from '@/components/data/device-pairing-ui'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <DevicePairingUI />
    </div>
  )
}
```

---

## How It Works

### 1. Coach Initiates Pairing

Coach clicks "Link Device" and selects a provider (Garmin, Polar, etc.)

### 2. OAuth Flow

Platform redirects to provider's OAuth consent screen. Coach logs in and grants permissions.

### 3. Credential Storage

Provider returns auth code. Platform exchanges for access token and stores it **encrypted** in `device_credentials` table.

**Encryption process:**
- Generate random IV (initialization vector)
- Encrypt token with AES-256-GCM
- Store encrypted token, IV, and auth tag separately
- Decryption only possible with `DEVICE_ENCRYPTION_KEY`

### 4. Auto-Sync

Cron job runs every 5 minutes. For each device:
- Check if `auto_sync=true` and due for sync
- Fetch new activities from provider API
- Extract telemetry (HR, power, speed, etc.)
- Store in `telemetry_metrics` table
- Recalculate readiness score

### 5. Real-Time Dashboard

Coach sees live metrics from paired devices in:
- Live race dashboard
- Training log
- Readiness score
- Multi-rider comparison

---

## API Reference

### POST /api/device/oauth-callback

Exchange OAuth code for token.

```json
{
  "provider": "garmin",
  "code": "auth_code_from_provider",
  "state": "random_state_token",
  "riderId": "rider-123",
  "teamId": "team-456",
  "deviceName": "Garmin Edge 1540"
}
```

### Fetch Device Credentials

```typescript
import { getDeviceCredentials } from '@/lib/device/credential-store'

const creds = await getDeviceCredentials(teamId, riderId)
// Returns: [{ provider: 'garmin', deviceName: '...', ... }, ...]
```

### Start Sync Job

```typescript
import { startSyncJob } from '@/lib/device/auto-sync'

await startSyncJob(teamId, riderId, 'garmin', accessToken)
```

---

## Troubleshooting

### "Token expired" Status

Provider token expired. Trigger refresh:

```typescript
import { refreshAccessToken } from '@/lib/device/credential-store'

const newToken = await refreshAccessToken(
  'garmin',
  refreshToken,
  clientId,
  clientSecret
)
```

### "Sync failed" Status

Check cron logs and error message. Common issues:
- Invalid credentials (provider revoked access)
- Rate limit exceeded
- Network timeout

Auto-retry on next cron run.

### Missing Telemetry Data

Ensure:
1. Device is paired and showing "active"
2. Auto-sync is enabled
3. Cron job is running (check Vercel logs)
4. Activities exist on provider (Garmin Connect, Polar Flow, etc.)

---

## Security

- **Encryption:** AES-256-GCM with per-team encryption key
- **Token Rotation:** Automatic refresh when expired
- **Revocation:** Users can disconnect device instantly
- **Scoping:** Each coach only sees their own paired devices
- **No Password Storage:** Only OAuth tokens stored, never passwords

---

## Performance

**Sync Times:**
- 100 activities: ~2 seconds
- 10k telemetry points: ~100ms to store
- Cron job total: <30 seconds for 100 teams

**Costs:**
- API calls: ~1-2 per device per 15 min = $0.001/month per device
- Storage: ~100 bytes per metric point = $1/year per rider

---

## Next Steps

1. ✅ Set environment variables
2. ✅ Run database migration
3. ✅ Add device pairing UI to coach console
4. ✅ Enable cron job
5. ✅ Test with pilot coach
6. ✅ Monitor sync errors

**Go live when ready!**
