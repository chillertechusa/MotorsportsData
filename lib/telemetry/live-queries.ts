/**
 * Live Telemetry Query Helpers
 * Fetch real-time and recent telemetry data from TimescaleDB
 * Used by live dashboard, WebSocket broadcaster, and race-day UI
 */

/**
 * Get current live metrics for a rider (last 1 minute)
 */
export async function getLiveMetrics(riderId: string, sessionId: string) {
  try {
    // Query TimescaleDB for last minute of telemetry
    const query = `
      SELECT 
        AVG(heart_rate) as avg_hr,
        MAX(heart_rate) as max_hr,
        AVG(power_watts) as avg_power,
        MAX(power_watts) as max_power,
        AVG(speed_mph) as avg_speed,
        MAX(speed_mph) as max_speed,
        COUNT(*) as sample_count,
        MAX(time) as last_update
      FROM telemetry_metrics
      WHERE rider_id = $1 
        AND session_id = $2
        AND time > NOW() - INTERVAL '1 minute'
    `

    // TODO: Execute against Neon/Supabase DB
    console.log('[Query] getLiveMetrics', { riderId, sessionId })

    return {
      avgHr: 168,
      maxHr: 175,
      avgPower: 285,
      maxPower: 315,
      avgSpeed: 65.2,
      maxSpeed: 71.5,
      sampleCount: 120,
      lastUpdate: new Date(),
    }
  } catch (error) {
    console.error('[Query] Error fetching live metrics:', error)
    return null
  }
}

/**
 * Get 1-minute aggregates for dashboard chart
 * Returns last 30 minutes of data (buckets)
 */
export async function get1mAggregates(riderId: string, sessionId: string) {
  try {
    // Query pre-computed 1-minute materialized view
    const query = `
      SELECT 
        minute,
        avg_hr,
        max_hr,
        avg_power,
        max_power,
        avg_speed,
        sample_count
      FROM telemetry_1m
      WHERE rider_id = $1 
        AND session_id = $2
        AND minute > NOW() - INTERVAL '30 minutes'
      ORDER BY minute DESC
    `

    // TODO: Execute query
    console.log('[Query] get1mAggregates', { riderId, sessionId })

    return [
      {
        minute: new Date(),
        avgHr: 165,
        maxHr: 172,
        avgPower: 280,
        maxPower: 310,
        avgSpeed: 64.5,
        sampleCount: 120,
      },
    ]
  } catch (error) {
    console.error('[Query] Error fetching 1m aggregates:', error)
    return []
  }
}

/**
 * Get multi-rider comparison (last lap metrics)
 * Used for real-time leaderboard during race
 */
export async function getMultiRiderComparison(sessionId: string, limit: number = 10) {
  try {
    const query = `
      WITH latest_lap AS (
        SELECT 
          rider_id,
          lap_number,
          AVG(heart_rate) as avg_hr,
          MAX(power_watts) as max_power,
          MAX(speed_mph) as max_speed,
          MAX(time) as lap_end
        FROM telemetry_metrics
        WHERE session_id = $1
        GROUP BY rider_id, lap_number
        HAVING lap_number = MAX(lap_number) OVER (PARTITION BY rider_id)
      )
      SELECT 
        rider_id,
        lap_number,
        avg_hr,
        max_power,
        max_speed,
        lap_end
      FROM latest_lap
      ORDER BY max_speed DESC
      LIMIT $2
    `

    // TODO: Execute query
    console.log('[Query] getMultiRiderComparison', { sessionId, limit })

    return []
  } catch (error) {
    console.error('[Query] Error fetching multi-rider comparison:', error)
    return []
  }
}

/**
 * Get sector-by-sector performance
 * Used to find track position deltas between riders
 */
export async function getSectorComparison(sessionId: string, riderId1: string, riderId2: string) {
  try {
    // Compare same lap, same sector, different riders
    const query = `
      SELECT 
        sector,
        AVG(CASE WHEN rider_id = $2 THEN power_watts END) as power_rider1,
        AVG(CASE WHEN rider_id = $3 THEN power_watts END) as power_rider2,
        AVG(CASE WHEN rider_id = $2 THEN speed_mph END) as speed_rider1,
        AVG(CASE WHEN rider_id = $3 THEN speed_mph END) as speed_rider2
      FROM telemetry_metrics
      WHERE session_id = $1
        AND (rider_id = $2 OR rider_id = $3)
        AND sector IS NOT NULL
      GROUP BY sector
      ORDER BY sector
    `

    console.log('[Query] getSectorComparison', { sessionId, riderId1, riderId2 })

    return []
  } catch (error) {
    console.error('[Query] Error fetching sector comparison:', error)
    return []
  }
}

/**
 * Get lap time history (for best lap tracking)
 */
export async function getLapTimes(riderId: string, sessionId: string, limit: number = 30) {
  try {
    const query = `
      SELECT 
        lap_number,
        MIN(time) as lap_start,
        MAX(time) as lap_end,
        EXTRACT(EPOCH FROM (MAX(time) - MIN(time))) as lap_duration_seconds,
        AVG(heart_rate) as avg_hr,
        MAX(power_watts) as max_power
      FROM telemetry_metrics
      WHERE rider_id = $1 
        AND session_id = $2
        AND lap_number IS NOT NULL
      GROUP BY lap_number
      ORDER BY lap_number DESC
      LIMIT $3
    `

    console.log('[Query] getLapTimes', { riderId, sessionId, limit })

    return []
  } catch (error) {
    console.error('[Query] Error fetching lap times:', error)
    return []
  }
}

/**
 * Get high-resolution data for export/analysis
 * Uncompressed raw telemetry (typically last race or session)
 */
export async function getHighResolutionData(
  riderId: string,
  sessionId: string,
  startTime?: Date,
  endTime?: Date
) {
  try {
    // Raw telemetry without aggregation
    const query = `
      SELECT * FROM telemetry_metrics
      WHERE rider_id = $1 
        AND session_id = $2
        ${startTime ? 'AND time >= $3' : ''}
        ${endTime ? 'AND time <= $4' : ''}
      ORDER BY time ASC
      LIMIT 100000
    `

    console.log('[Query] getHighResolutionData', { riderId, sessionId })

    return []
  } catch (error) {
    console.error('[Query] Error fetching high-res data:', error)
    return []
  }
}

/**
 * Calculate live readiness score based on current session metrics
 * (Called every time data arrives)
 */
export async function updateLiveReadiness(riderId: string, sessionId: string) {
  try {
    // Get current session metrics
    const liveMetrics = await getLiveMetrics(riderId, sessionId)
    if (!liveMetrics) return null

    // Get rider's baseline (from historical data or profile)
    // Calculate readiness shift from baseline

    // For now: mock calculation
    const readinessScore = 75 + Math.random() * 20

    console.log('[Readiness] Live update for rider', riderId, ':', readinessScore)

    // TODO: Store in session_snapshots.readiness_score (updated every minute)

    return readinessScore
  } catch (error) {
    console.error('[Readiness] Error updating live readiness:', error)
    return null
  }
}
