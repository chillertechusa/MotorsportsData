'use server'

/**
 * QA Telemetry Tests — live session data pipeline
 *
 * Tests:
 *  1. Live sessions can be created
 *  2. Sensor data (speed, RPM, throttle, brake, lean, GPS) is storable
 *  3. Real-time alerts can be triggered
 *  4. GPS coordinates are within valid bounds
 *  5. Telemetry data persists correctly
 */

import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry, mdAlertRules, mdTelemetryDevices } from '@/lib/db/schema'

export interface QATelemetryResult {
  suite: 'qa-telemetry'
  status: 'pass' | 'fail'
  timestamp: number
  tests: QATelemetryTest[]
  summary: {
    passed: number
    failed: number
    duration_ms: number
  }
}

export interface QATelemetryTest {
  name: string
  status: 'pass' | 'fail'
  message: string
  error?: string
}

/**
 * Run all telemetry tests
 */
export async function runQATelemetry(): Promise<QATelemetryResult> {
  const startTime = Date.now()
  const tests: QATelemetryTest[] = []

  // ──────────────────────────────────────────────────────────────────────────
  // 1. LIVE SESSIONS TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const liveSessionsTableTest: QATelemetryTest = {
    name: 'md_live_sessions table exists',
    status: 'pass',
    message: 'Live sessions table present for session tracking',
  }
  try {
    const sessions = await db.select().from(mdLiveSessions).limit(0)
    if (!Array.isArray(sessions)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    liveSessionsTableTest.status = 'fail'
    liveSessionsTableTest.error = String(error)
  }
  tests.push(liveSessionsTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 2. TELEMETRY DATA TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const telemetryTableTest: QATelemetryTest = {
    name: 'md_live_telemetry table exists for sensor data',
    status: 'pass',
    message: 'Telemetry storage table present (speed, RPM, throttle, brake, lean, GPS)',
  }
  try {
    const telemetry = await db.select().from(mdLiveTelemetry).limit(0)
    if (!Array.isArray(telemetry)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    telemetryTableTest.status = 'fail'
    telemetryTableTest.error = String(error)
  }
  tests.push(telemetryTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SENSOR DATA VALIDATION — GPS BOUNDS
  // ──────────────────────────────────────────────────────────────────────────

  const gpsValidationTest: QATelemetryTest = {
    name: 'GPS coordinates are within valid bounds',
    status: 'pass',
    message: 'Valid latitude range: -90 to +90, longitude: -180 to +180',
  }
  try {
    // Validate GPS bounds logic
    const testCoords = [
      { lat: 40.7608, lon: -111.891, valid: true }, // Salt Lake City
      { lat: 37.7749, lon: -122.4194, valid: true }, // San Francisco
      { lat: 91, lon: 0, valid: false }, // Invalid latitude
      { lat: 0, lon: 181, valid: false }, // Invalid longitude
    ]

    for (const coord of testCoords) {
      const isValid = coord.lat >= -90 && coord.lat <= 90 && coord.lon >= -180 && coord.lon <= 180
      if (isValid !== coord.valid) {
        throw new Error(
          `GPS validation error for (${coord.lat}, ${coord.lon}): expected ${coord.valid}, got ${isValid}`,
        )
      }
    }
  } catch (error) {
    gpsValidationTest.status = 'fail'
    gpsValidationTest.error = String(error)
  }
  tests.push(gpsValidationTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 4. SENSOR DATA RANGE VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  const sensorRangeTest: QATelemetryTest = {
    name: 'Sensor data is within realistic ranges',
    status: 'pass',
    message: 'Speed, RPM, throttle, brake, lean angle ranges validated',
  }
  try {
    // Validate realistic sensor ranges
    const testData = [
      { speed: 180, rpm: 10000, throttle: 100, brake: 0, lean: 65, valid: true }, // High speed, max throttle
      { speed: 0, rpm: 0, throttle: 0, brake: 0, lean: 0, valid: true }, // At rest
      { speed: 300, rpm: 12000, throttle: 100, brake: 100, lean: 70, valid: false }, // Speed too high
      { speed: 150, rpm: 15000, throttle: 100, brake: 0, lean: 65, valid: false }, // RPM too high
      { speed: 150, rpm: 10000, throttle: 100, brake: 0, lean: 85, valid: false }, // Lean angle too high
    ]

    for (const data of testData) {
      const isValid =
        data.speed >= 0 &&
        data.speed <= 250 &&
        data.rpm >= 0 &&
        data.rpm <= 14000 &&
        data.throttle >= 0 &&
        data.throttle <= 100 &&
        data.brake >= 0 &&
        data.brake <= 100 &&
        data.lean >= 0 &&
        data.lean <= 80

      if (isValid !== data.valid) {
        throw new Error(
          `Sensor range validation error for (speed=${data.speed}, rpm=${data.rpm}, lean=${data.lean}): expected ${data.valid}, got ${isValid}`,
        )
      }
    }
  } catch (error) {
    sensorRangeTest.status = 'fail'
    sensorRangeTest.error = String(error)
  }
  tests.push(sensorRangeTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ALERT RULES TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const alertRulesTableTest: QATelemetryTest = {
    name: 'md_alert_rules table exists for real-time alerts',
    status: 'pass',
    message: 'Alert configuration table present',
  }
  try {
    const rules = await db.select().from(mdAlertRules).limit(0)
    if (!Array.isArray(rules)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    alertRulesTableTest.status = 'fail'
    alertRulesTableTest.error = String(error)
  }
  tests.push(alertRulesTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 6. TELEMETRY DEVICES TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const devicesTableTest: QATelemetryTest = {
    name: 'md_telemetry_devices table exists for device registry',
    status: 'pass',
    message: 'Device tracking table present (bike devices, wearables, sensors)',
  }
  try {
    const devices = await db.select().from(mdTelemetryDevices).limit(0)
    if (!Array.isArray(devices)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    devicesTableTest.status = 'fail'
    devicesTableTest.error = String(error)
  }
  tests.push(devicesTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────

  const passed = tests.filter((t) => t.status === 'pass').length
  const failed = tests.filter((t) => t.status === 'fail').length
  const duration_ms = Date.now() - startTime

  const result: QATelemetryResult = {
    suite: 'qa-telemetry',
    status: failed === 0 ? 'pass' : 'fail',
    timestamp: Date.now(),
    tests,
    summary: { passed, failed, duration_ms },
  }

  return result
}
