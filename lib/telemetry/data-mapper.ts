import { ParsedTelemetry, DeviceType } from './device-registry'

// ── Canonical schema ──────────────────────────────────────────────────────────

export interface CanonicalTelemetryRecord {
  timestamp: number          // Unix ms
  lapNumber?: number
  lapTimeMs?: number         // Lap time in milliseconds
  speed?: number             // mph (normalized)
  distance?: number          // meters
  heartRate?: number         // bpm
  power?: number             // watts
  cadence?: number           // rpm
  elevation?: number         // meters (normalized)
  latitude?: number
  longitude?: number
  temperature?: number       // Celsius (normalized)
  humidity?: number          // percent
  suspensionTravel?: number  // mm
  throttlePercent?: number   // 0–100
  brakePressure?: number     // bar
  gForce?: number
  groundSpeed?: number       // mph
  gpsAccuracy?: number       // meters
  rpm?: number               // engine RPM
  engineTemp?: number        // Celsius
  fuelLevel?: number         // percent
  airPressure?: number       // mbar
  crashDetected?: boolean
  [key: string]: unknown
}

export interface CanonicalSessionData {
  trackName?: string
  trackConditions?: string
  bestLapMs?: number
  totalDurationMs?: number
  lapCount?: number
  avgHeartRate?: number
  maxHeartRate?: number
  avgPower?: number
  maxPower?: number
  maxSpeed?: number
  avgSpeed?: number
  riderFeedback?: string
  ambientTempC?: number
  weatherConditions?: string
  surface?: string
  telemetryPoints: CanonicalTelemetryRecord[]
}

// ── Unit type hints (inferred from field name) ────────────────────────────────

type UnitHint = 'kph' | 'mph' | 'celsius' | 'fahrenheit' | 'feet' | 'meters' | 'ms' | 'seconds' | 'none'

const FIELD_UNIT_HINTS: Record<string, UnitHint> = {
  speed_kph: 'kph',
  velocity_kph: 'kph',
  gps_speed_kph: 'kph',
  speed_mph: 'mph',
  temp_f: 'fahrenheit',
  temperature_f: 'fahrenheit',
  air_temp_f: 'fahrenheit',
  altitude_ft: 'feet',
  elevation_ft: 'feet',
  lap_time_s: 'seconds',
  laptime_s: 'seconds',
  lap_time_sec: 'seconds',
}

// ── Generic field alias table ─────────────────────────────────────────────────
// Maps lowercase normalized device field names → canonical field names.
// Precedence: device-specific table → generic table.

const GENERIC_FIELD_MAP: Record<string, string> = {
  // Timestamp
  timestamp: 'timestamp',
  time: 'timestamp',
  datetime: 'timestamp',
  ts: 'timestamp',
  elapsed: 'timestamp',

  // Lap
  lap_time: 'lapTimeMs',
  lap_time_ms: 'lapTimeMs',
  laptime: 'lapTimeMs',
  lap_time_s: 'lapTimeMs',     // seconds → will be converted
  laptime_s: 'lapTimeMs',
  lap_time_sec: 'lapTimeMs',
  lap: 'lapNumber',
  lap_num: 'lapNumber',
  lap_number: 'lapNumber',

  // Heart rate
  heart_rate: 'heartRate',
  heartrate: 'heartRate',
  hr: 'heartRate',
  bpm: 'heartRate',
  pulse: 'heartRate',

  // Power
  power: 'power',
  watts: 'power',
  avg_power: 'power',
  instantaneous_power: 'power',

  // Speed / GPS
  speed: 'speed',
  speed_kph: 'speed',          // kph → mph conversion applied
  speed_mph: 'speed',
  gps_speed: 'speed',
  gps_speed_kph: 'speed',
  velocity: 'speed',
  ground_speed: 'groundSpeed',
  lat: 'latitude',
  latitude: 'latitude',
  lng: 'longitude',
  lon: 'longitude',
  longitude: 'longitude',

  // Cadence / RPM
  cadence: 'cadence',
  rpm: 'rpm',
  pedal_rpm: 'cadence',
  crank_rpm: 'cadence',
  engine_rpm: 'rpm',
  motor_rpm: 'rpm',

  // Temperature
  temperature: 'temperature',
  temp: 'temperature',
  ambient_temp: 'temperature',
  air_temp: 'temperature',
  temp_f: 'temperature',       // F → C conversion applied
  temperature_f: 'temperature',
  air_temp_f: 'temperature',
  engine_temp: 'engineTemp',
  coolant_temp: 'engineTemp',
  water_temp: 'engineTemp',

  // Elevation / altitude
  elevation: 'elevation',
  altitude: 'elevation',
  alt: 'elevation',
  altitude_ft: 'elevation',    // ft → m conversion applied
  elevation_ft: 'elevation',

  // Suspension
  suspension_travel: 'suspensionTravel',
  suspension: 'suspensionTravel',
  travel: 'suspensionTravel',
  front_travel: 'suspensionTravel',
  fork_travel: 'suspensionTravel',

  // Throttle / brake
  throttle: 'throttlePercent',
  throttle_percent: 'throttlePercent',
  tps: 'throttlePercent',
  throttle_pos: 'throttlePercent',
  brake_pressure: 'brakePressure',
  brake: 'brakePressure',
  brake_psi: 'brakePressure',

  // G-Force
  gforce: 'gForce',
  g_force: 'gForce',
  acceleration: 'gForce',
  lateral_g: 'gForce',

  // Distance
  distance: 'distance',
  distance_m: 'distance',
  odometer: 'distance',

  // Humidity
  humidity: 'humidity',
  humidity_pct: 'humidity',
  relative_humidity: 'humidity',

  // GPS accuracy
  gps_accuracy: 'gpsAccuracy',
  accuracy: 'gpsAccuracy',
  hdop: 'gpsAccuracy',

  // Air / fuel
  air_pressure: 'airPressure',
  barometric_pressure: 'airPressure',
  fuel_level: 'fuelLevel',
  fuel_pct: 'fuelLevel',

  // Safety / crash
  crash_detected: 'crashDetected',
  impact: 'crashDetected',
  airbag_deployed: 'crashDetected',
}

// ── Per-device alias tables ───────────────────────────────────────────────────
// These overlay the generic table for device-specific quirks.

const DEVICE_FIELD_MAPS: Partial<Record<DeviceType, Record<string, string>>> = {
  mylapstr2: {
    // MYLAPSTR2 CSV columns (as documented in MyLaps documentation)
    'passingtime': 'timestamp',
    'lapnumber': 'lapNumber',
    'laptime': 'lapTimeMs',        // ms
    'splittime1': 'lapTimeMs',
    'transpondernumber': '_transponder',
    'channelnumber': '_channel',
  },

  westhold_g3: {
    // Westhold G3 TXT/CSV output format
    'time(s)': 'timestamp',        // seconds → multiply to ms
    'ax(g)': 'gForce',
    'ay(g)': 'gForce',
    'az(g)': 'gForce',
    'gx(deg/s)': '_gyroX',
    'gy(deg/s)': '_gyroY',
    'gz(deg/s)': '_gyroZ',
    'roll': '_roll',
    'pitch': '_pitch',
    'yaw': '_yaw',
    'suspension(mm)': 'suspensionTravel',
    'speed(kph)': 'speed',         // kph → mph
    'temp(c)': 'temperature',
  },

  crossbox_cbx20: {
    // Crossbox CBX20 ECU data export
    'engine_rpm': 'rpm',
    'throttle_position': 'throttlePercent',
    'coolant_temperature': 'engineTemp',
    'air_fuel_ratio': '_afr',
    'boost_pressure': '_boost',
    'lambda': '_lambda',
    'gear': '_gear',
    'battery_voltage': '_voltage',
    'map': 'airPressure',
    'iat': 'temperature',          // intake air temp
  },

  aim_solo: {
    // AiM Solo 2.X CSV/XRK exports
    'utc_time': 'timestamp',
    'lap_n': 'lapNumber',
    'lap_time': 'lapTimeMs',
    'gps_speed': 'speed',          // kph
    'gps_nsat': 'gpsAccuracy',
    'gps_latacc': 'gForce',
    'gps_lonacc': '_lonAcc',
    'gps_slope': '_slope',
    'engine_rpm': 'rpm',
    'water_temp': 'engineTemp',
    'ext_voltage': '_voltage',
    'ch_1': '_channel1',           // analog expansion channels
    'ch_2': '_channel2',
  },

  anubesport_stella: {
    // Anubesport Stella III GPX/CSV
    'pos_lat': 'latitude',
    'pos_lon': 'longitude',
    'pos_alt': 'elevation',        // meters
    'spd': 'speed',                // kph
    'heading': '_heading',
    'suspension_front': 'suspensionTravel',
    'suspension_rear': '_rearSuspension',
    'acc_x': 'gForce',
    'acc_y': '_lateralG',
  },

  raceboxlitpro: {
    // RaceBox LIT Pro / RaceBox CSV format
    'utc': 'timestamp',
    'lat': 'latitude',
    'lon': 'longitude',
    'alt': 'elevation',            // meters
    'speed': 'speed',              // kph → mph
    'speed_accuracy': 'gpsAccuracy',
    'heading': '_heading',
    'satellites': '_satellites',
    'fix_quality': '_fixQuality',
    'acceleration_x': 'gForce',
    'acceleration_y': '_lateralG',
    'acceleration_z': '_verticalG',
  },

  garmin_hrm: {
    // Garmin HRM-Pro FIT/TCX CSV export
    'heart_rate': 'heartRate',
    'cadence': 'cadence',
    'power': 'power',
    'speed': 'speed',              // m/s → mph in post-process
    'distance': 'distance',        // meters
    'altitude': 'elevation',       // meters
    'temperature': 'temperature',  // C
    'running_power': 'power',
    'vertical_oscillation': '_vertOsc',
    'ground_contact_time': '_groundContact',
  },

  polar_h10: {
    // Polar H10 CSV export
    'hr [bpm]': 'heartRate',
    'speed [km/h]': 'speed',       // kph → mph
    'altitude [m]': 'elevation',
    'distance [m]': 'distance',
    'cadence [spm]': 'cadence',
    'power [w]': 'power',
    'temperature [°c]': 'temperature',
  },

  apple_watch: {
    // Apple Health XML/CSV export
    'heartrate': 'heartRate',
    'distancewalkingrunning': 'distance',
    'stepcount': '_steps',
    'activeenergyburned': '_activeEnergy',
    'basalenergyburned': '_basalEnergy',
    'heartratevariabilitysdnn': '_hrv',
    'oxygenation': '_spo2',
  },

  alpinestars_tecair: {
    // Alpinestars Tech-Air MX data export
    'timestamp_ms': 'timestamp',
    'ax': 'gForce',
    'ay': '_lateralG',
    'az': '_verticalG',
    'gyro_x': '_gyroX',
    'impact_severity': '_impactSeverity',
    'airbag_status': 'crashDetected',
    'pressure_front': 'brakePressure',
    'speed_kph': 'speed',
  },
}

// ── Unit conversion helpers ───────────────────────────────────────────────────

function kphToMph(kph: number): number { return kph * 0.621371 }
function fToC(f: number): number { return (f - 32) * (5 / 9) }
function ftToM(ft: number): number { return ft * 0.3048 }
function msToMph(ms: number): number { return ms * 2.23694 } // m/s → mph

/**
 * Apply unit conversion for fields where the raw value is in a non-canonical unit.
 */
function applyUnitConversion(canonicalField: string, rawFieldName: string, value: number): number {
  const hint = FIELD_UNIT_HINTS[rawFieldName.toLowerCase().replace(/[-\s]/g, '_')] ?? 'none'

  if (canonicalField === 'speed' || canonicalField === 'groundSpeed') {
    if (hint === 'kph') return kphToMph(value)
    // Garmin exports speed in m/s in FIT-derived CSVs
    if (rawFieldName.toLowerCase().includes('m/s') || rawFieldName.toLowerCase() === 'speed' && value < 30) {
      return msToMph(value)
    }
  }
  if (canonicalField === 'temperature' || canonicalField === 'engineTemp') {
    if (hint === 'fahrenheit') return fToC(value)
  }
  if (canonicalField === 'elevation') {
    if (hint === 'feet') return ftToM(value)
  }
  if (canonicalField === 'lapTimeMs') {
    if (hint === 'seconds') return value * 1000
  }
  // Westhold time(s) → ms
  if (canonicalField === 'timestamp' && rawFieldName.toLowerCase().includes('(s)')) {
    return value * 1000
  }
  return value
}

// ── Core normalization ─────────────────────────────────────────────────────────

/**
 * Normalize a raw field name using a device-specific table first, then generic.
 * Returns the canonical field name (or the original if no mapping found).
 */
export function normalizeFieldName(rawFieldName: string, deviceType?: DeviceType | null): string {
  const key = rawFieldName.toLowerCase().trim().replace(/[-\s]/g, '_')

  // 1. Device-specific alias table
  if (deviceType) {
    const deviceMap = DEVICE_FIELD_MAPS[deviceType]
    if (deviceMap) {
      // Try exact match with original name (lowercase) first
      const exactKey = rawFieldName.toLowerCase().trim()
      if (deviceMap[exactKey]) return deviceMap[exactKey]
      // Then normalized key
      if (deviceMap[key]) return deviceMap[key]
    }
  }

  // 2. Generic table
  return GENERIC_FIELD_MAP[key] || rawFieldName
}

/**
 * Convert a single raw telemetry point to canonical format.
 */
export function mapTelemetryPoint(
  point: Record<string, unknown>,
  deviceType?: DeviceType | null
): CanonicalTelemetryRecord {
  const canonical: CanonicalTelemetryRecord = {
    timestamp: Date.now(),
  }

  const numericFields = new Set([
    'heartRate', 'power', 'cadence', 'speed', 'temperature', 'humidity', 'lapNumber',
    'throttlePercent', 'gForce', 'timestamp', 'lapTimeMs', 'totalDurationMs', 'distance',
    'elevation', 'suspensionTravel', 'brakePressure', 'latitude', 'longitude', 'groundSpeed',
    'gpsAccuracy', 'rpm', 'engineTemp', 'fuelLevel', 'airPressure',
  ])

  for (const [rawKey, value] of Object.entries(point)) {
    if (value === undefined || value === null) continue
    // Skip private/internal fields (prefixed with _)
    const canonicalKey = normalizeFieldName(rawKey, deviceType)
    if (canonicalKey.startsWith('_')) continue

    if (numericFields.has(canonicalKey)) {
      let num = Number(value)
      if (!isNaN(num)) {
        num = applyUnitConversion(canonicalKey, rawKey, num)
        ;(canonical as Record<string, unknown>)[canonicalKey] = num
      }
    } else if (canonicalKey === 'crashDetected') {
      ;(canonical as Record<string, unknown>)[canonicalKey] = Boolean(value)
    } else {
      ;(canonical as Record<string, unknown>)[canonicalKey] = value
    }
  }

  return canonical
}

/**
 * Map a full array of parsed telemetry points to a canonical session object.
 * Aggregates session-level stats automatically.
 */
export function mapSessionData(
  parsedData: ParsedTelemetry[],
  trackName?: string,
  deviceType?: DeviceType | null
): CanonicalSessionData {
  const canonical: CanonicalSessionData = {
    trackName: trackName || 'Unknown Track',
    trackConditions: 'Unknown',
    surface: 'Unknown',
    telemetryPoints: [],
  }

  const heartRates: number[] = []
  const powers: number[] = []
  const lapTimes: number[] = []
  const speeds: number[] = []
  let maxLapNumber = 0

  for (const point of parsedData) {
    const cp = mapTelemetryPoint(point as Record<string, unknown>, deviceType)
    canonical.telemetryPoints.push(cp)

    if (cp.heartRate) heartRates.push(cp.heartRate)
    if (cp.power) powers.push(cp.power)
    if (cp.lapTimeMs) lapTimes.push(cp.lapTimeMs)
    if (cp.speed) speeds.push(cp.speed)
    if (cp.lapNumber) maxLapNumber = Math.max(maxLapNumber, cp.lapNumber)
  }

  if (heartRates.length > 0) {
    canonical.avgHeartRate = Math.round(heartRates.reduce((a, b) => a + b) / heartRates.length)
    canonical.maxHeartRate = Math.max(...heartRates)
  }
  if (powers.length > 0) {
    canonical.avgPower = Math.round(powers.reduce((a, b) => a + b) / powers.length)
    canonical.maxPower = Math.max(...powers)
  }
  if (lapTimes.length > 0) {
    canonical.bestLapMs = Math.min(...lapTimes)
  }
  if (speeds.length > 0) {
    canonical.maxSpeed = Math.round(Math.max(...speeds) * 10) / 10
    canonical.avgSpeed = Math.round((speeds.reduce((a, b) => a + b) / speeds.length) * 10) / 10
  }
  if (maxLapNumber > 0) {
    canonical.lapCount = maxLapNumber
  }
  if (canonical.telemetryPoints.length > 1) {
    const first = canonical.telemetryPoints[0].timestamp
    const last = canonical.telemetryPoints[canonical.telemetryPoints.length - 1].timestamp
    canonical.totalDurationMs = last - first
  }

  return canonical
}

/**
 * Attempt to identify the device type from a set of raw field names.
 * Useful for auto-detecting device type before committing an import.
 */
export function inferDeviceType(rawFields: string[]): DeviceType | null {
  const lower = rawFields.map(f => f.toLowerCase().trim())

  // Check each device's alias table for a match density ≥ 2
  for (const [deviceType, aliasMap] of Object.entries(DEVICE_FIELD_MAPS) as [DeviceType, Record<string, string>][]) {
    const deviceKeys = Object.keys(aliasMap)
    const matches = lower.filter(f => deviceKeys.includes(f)).length
    if (matches >= 2) return deviceType
  }

  // Heuristic fallbacks
  if (lower.includes('passingtime') || lower.includes('transpondernumber')) return 'mylapstr2'
  if (lower.some(f => f.includes('(g)') || f.includes('(deg/s)'))) return 'westhold_g3'
  if (lower.includes('engine_rpm') && lower.includes('lambda')) return 'crossbox_cbx20'
  if (lower.includes('utc_time') && lower.includes('gps_nsat')) return 'aim_solo'
  if (lower.some(f => f.includes('hrv') || f.includes('oxygenation'))) return 'apple_watch'

  return null
}

/**
 * Auto-detect track from GPS bounding box.
 * Returns null in production if no match — caller should prompt for manual selection.
 */
export function inferTrackFromGPS(points: CanonicalTelemetryRecord[]): string | null {
  const gpsPoints = points.filter(p => p.latitude && p.longitude)
  if (gpsPoints.length === 0) return null
  // Future: use geohash + known track bounding boxes
  return null
}
