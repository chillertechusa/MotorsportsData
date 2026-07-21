import { pgTable, text, integer, real, timestamp, uuid, index } from 'drizzle-orm/pg-core'

/**
 * TimescaleDB hypertable for telemetry time-series data.
 * High-cardinality metrics: Heart Rate, Power, Speed, Cadence, etc.
 * Optimized for: Range queries, downsampling, compression.
 */

export const telemetryMetrics = pgTable(
  'telemetry_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    deviceId: uuid('device_id').notNull(),
    
    // Timestamp (hypertable partitioning key)
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    
    // Core metrics
    heartRate: integer('heart_rate'),
    power: integer('power'), // watts
    speed: real('speed'), // mph
    cadence: integer('cadence'), // rpm
    altitude: integer('altitude'), // meters
    temperature: real('temperature'), // celsius
    humidity: integer('humidity'), // percent
    
    // Derived metrics
    vO2: integer('vo2'), // ml/kg/min
    lactateLevel: real('lactate_level'), // mmol/L
    
    // GPS
    latitude: real('latitude'),
    longitude: real('longitude'),
    
    // Raw sensor data (JSON)
    rawData: text('raw_data'), // JSON stringified for flexibility
  },
  (table) => ({
    sessionRiderIdx: index('idx_session_rider').on(table.sessionId, table.riderId),
    deviceIdx: index('idx_device').on(table.deviceId),
    timestampIdx: index('idx_timestamp').on(table.timestamp),
  })
)

/**
 * Aggregated metrics (1-minute, 5-minute, hourly).
 * For dashboard displays and trend analysis.
 */
export const telemetryAggregates = pgTable(
  'telemetry_aggregates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull(),
    riderId: uuid('rider_id').notNull(),
    
    // Aggregation window
    timeWindow: timestamp('time_window', { withTimezone: true }).notNull(), // 1min, 5min, 1hour
    windowDuration: text('window_duration').notNull(), // '1m', '5m', '1h'
    
    // Aggregated stats
    heartRateAvg: real('heart_rate_avg'),
    heartRateMin: integer('heart_rate_min'),
    heartRateMax: integer('heart_rate_max'),
    
    powerAvg: real('power_avg'),
    powerMin: integer('power_min'),
    powerMax: integer('power_max'),
    
    speedAvg: real('speed_avg'),
    speedMax: real('speed_max'),
    
    cadenceAvg: real('cadence_avg'),
    
    // Sample count
    sampleCount: integer('sample_count'),
  },
  (table) => ({
    sessionRiderWindowIdx: index('idx_agg_session_rider_window').on(
      table.sessionId,
      table.riderId,
      table.timeWindow
    ),
    windowIdx: index('idx_agg_window').on(table.timeWindow),
  })
)

/**
 * Lap timing and telemetry summary.
 * One row per lap.
 */
export const lapData = pgTable('lap_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull(),
  riderId: uuid('rider_id').notNull(),
  
  lapNumber: integer('lap_number').notNull(),
  lapStartTime: timestamp('lap_start_time', { withTimezone: true }).notNull(),
  lapEndTime: timestamp('lap_end_time', { withTimezone: true }).notNull(),
  lapTimeMs: integer('lap_time_ms').notNull(),
  
  // Summary stats for the lap
  heartRateAvg: real('heart_rate_avg'),
  heartRateMax: integer('heart_rate_max'),
  powerAvg: real('power_avg'),
  powerPeak: integer('power_peak'),
  speedMax: real('speed_max'),
  
  // Conditions during lap
  temperature: real('temperature'),
  humidity: integer('humidity'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type TelemetryMetric = typeof telemetryMetrics.$inferSelect
export type TelemetryAggregate = typeof telemetryAggregates.$inferSelect
export type LapDatum = typeof lapData.$inferSelect
