/**
 * Telemetry Channel Normalization
 *
 * Every discipline reports performance data under different field names,
 * units, and display labels. This library is the single source of truth
 * for how raw device data maps to the platform's canonical channel vocabulary.
 *
 * Architecture:
 *  - Each discipline defines a ChannelMap: a set of named channels with
 *    their device alias(es), unit, label, and sensible display range.
 *  - The normalizer accepts raw ingest payloads (keyed by device alias)
 *    and returns a canonical TelemetryFrame (keyed by ChannelId).
 *  - The UI reads ChannelMeta to know what label/unit to display for
 *    any given discipline — no hardcoded "Lap Time" strings in components.
 */

import type { DisciplineId } from '@/lib/md-discipline'

// ─── Canonical channel IDs ────────────────────────────────────────────────────
// These are stable keys used in the DB and across the platform.
// NEVER rename them — add new ones if needed.
export type ChannelId =
  // Universal
  | 'heart_rate'
  | 'hrv_ms'
  | 'speed'
  | 'power_watts'
  | 'lap_number'
  | 'session_elapsed_ms'
  // Lap / time channels (meaning varies by discipline)
  | 'primary_time_ms'       // best lap / ET / stage time / sector best
  | 'secondary_time_ms'     // sector split / 60-foot / SS split
  | 'tertiary_time_ms'      // 330-foot / intermediate checkpoint
  | 'gap_to_leader_ms'
  // Position / movement
  | 'lean_angle_deg'
  | 'throttle_pct'
  | 'brake_pct'
  | 'rpm'
  | 'latitude'
  | 'longitude'
  | 'altitude_ft'
  // Discipline-specific
  | 'tire_temp_f'            // NASCAR, karting
  | 'pit_stop_elapsed_ms'    // NASCAR
  | 'fuel_remaining_pct'     // rally, enduro, NASCAR
  | 'suspension_travel_mm'   // MX/SX, enduro
  | 'g_force_lateral'        // NASCAR, karting, rally
  | 'g_force_longitudinal'
  | 'drag_reaction_time_ms'  // drag racing
  | 'stage_number'           // rally
  | 'trick_air_time_ms'      // FMX
  | 'trick_amplitude_ft'     // FMX

export interface ChannelMeta {
  id: ChannelId
  /** Human label shown in UI for this discipline */
  label: string
  /** Unit string (e.g. 'mph', 'ms', '°', '%') */
  unit: string
  /** Raw device field aliases that map to this channel */
  aliases: string[]
  /** Reasonable display min/max for charts */
  displayMin: number
  displayMax: number
  /** Is this channel a headline metric on the session card? */
  headline: boolean
  /** Decimal precision for display */
  precision: number
}

export type DisciplineChannelMap = Partial<Record<ChannelId, ChannelMeta>>

// ─── Per-discipline channel maps ──────────────────────────────────────────────

const UNIVERSAL_CHANNELS: DisciplineChannelMap = {
  heart_rate: {
    id: 'heart_rate', label: 'Heart Rate', unit: 'bpm',
    aliases: ['heartRate', 'heart_rate', 'hr'],
    displayMin: 40, displayMax: 220, headline: false, precision: 0,
  },
  hrv_ms: {
    id: 'hrv_ms', label: 'HRV', unit: 'ms',
    aliases: ['hrvMs', 'hrv_ms', 'hrv'],
    displayMin: 10, displayMax: 120, headline: false, precision: 0,
  },
  power_watts: {
    id: 'power_watts', label: 'Power', unit: 'W',
    aliases: ['powerWatts', 'power_watts', 'power'],
    displayMin: 0, displayMax: 1500, headline: false, precision: 0,
  },
  session_elapsed_ms: {
    id: 'session_elapsed_ms', label: 'Elapsed', unit: 'ms',
    aliases: ['timestamp', 'elapsed', 'session_elapsed_ms'],
    displayMin: 0, displayMax: 7200000, headline: false, precision: 0,
  },
  latitude: {
    id: 'latitude', label: 'Lat', unit: '°',
    aliases: ['latitude', 'lat'],
    displayMin: -90, displayMax: 90, headline: false, precision: 6,
  },
  longitude: {
    id: 'longitude', label: 'Lon', unit: '°',
    aliases: ['longitude', 'lon', 'lng'],
    displayMin: -180, displayMax: 180, headline: false, precision: 6,
  },
}

const DISCIPLINE_CHANNEL_MAPS: Record<DisciplineId, DisciplineChannelMap> = {

  mx_sx: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Lap Time', unit: 'ms',
      aliases: ['lapTimeMs', 'lap_time_ms', 'bestLap', 'best_lap_ms'],
      displayMin: 60000, displayMax: 180000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: 'Sector Split', unit: 'ms',
      aliases: ['sectorSplit', 'sector_split_ms'],
      displayMin: 5000, displayMax: 60000, headline: false, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed_mph', 'speed'],
      displayMin: 0, displayMax: 80, headline: false, precision: 1,
    },
    lean_angle_deg: {
      id: 'lean_angle_deg', label: 'Lean Angle', unit: '°',
      aliases: ['leanAngle', 'lean_angle', 'lean'],
      displayMin: 0, displayMax: 70, headline: false, precision: 1,
    },
    throttle_pct: {
      id: 'throttle_pct', label: 'Throttle', unit: '%',
      aliases: ['throttle', 'throttle_pct', 'throttlePct'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    brake_pct: {
      id: 'brake_pct', label: 'Brake', unit: '%',
      aliases: ['brake', 'brake_pct', 'brakePct'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    rpm: {
      id: 'rpm', label: 'RPM', unit: 'rpm',
      aliases: ['rpm', 'engineRpm', 'engine_rpm'],
      displayMin: 0, displayMax: 14000, headline: false, precision: 0,
    },
    suspension_travel_mm: {
      id: 'suspension_travel_mm', label: 'Suspension Travel', unit: 'mm',
      aliases: ['suspensionTravel', 'suspension_travel_mm', 'fork_travel'],
      displayMin: 0, displayMax: 320, headline: false, precision: 1,
    },
    lap_number: {
      id: 'lap_number', label: 'Lap', unit: '',
      aliases: ['lapNumber', 'lap_number', 'lap'],
      displayMin: 1, displayMax: 40, headline: false, precision: 0,
    },
  },

  enduro: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Stage Time', unit: 'ms',
      aliases: ['stageTimeMs', 'stage_time_ms', 'specialTestTime'],
      displayMin: 60000, displayMax: 1800000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: 'Test Split', unit: 'ms',
      aliases: ['testSplit', 'test_split_ms'],
      displayMin: 10000, displayMax: 300000, headline: false, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 70, headline: false, precision: 1,
    },
    fuel_remaining_pct: {
      id: 'fuel_remaining_pct', label: 'Fuel Remaining', unit: '%',
      aliases: ['fuelPct', 'fuel_remaining_pct', 'fuel'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    suspension_travel_mm: {
      id: 'suspension_travel_mm', label: 'Suspension Travel', unit: 'mm',
      aliases: ['suspensionTravel', 'suspension_travel_mm'],
      displayMin: 0, displayMax: 320, headline: false, precision: 1,
    },
    lap_number: {
      id: 'lap_number', label: 'Stage #', unit: '',
      aliases: ['stageNumber', 'stage_number', 'lapNumber'],
      displayMin: 1, displayMax: 20, headline: false, precision: 0,
    },
  },

  nascar: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Lap Time', unit: 'ms',
      aliases: ['lapTimeMs', 'lap_time_ms'],
      displayMin: 20000, displayMax: 60000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: 'Pit Stop Time', unit: 'ms',
      aliases: ['pitStopMs', 'pit_stop_ms', 'pit_elapsed'],
      displayMin: 8000, displayMax: 30000, headline: false, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 220, headline: false, precision: 1,
    },
    tire_temp_f: {
      id: 'tire_temp_f', label: 'Tire Temp', unit: '°F',
      aliases: ['tireTemp', 'tire_temp_f', 'tire_temperature'],
      displayMin: 100, displayMax: 280, headline: false, precision: 0,
    },
    g_force_lateral: {
      id: 'g_force_lateral', label: 'Lateral G', unit: 'G',
      aliases: ['gForceLateral', 'g_force_lateral', 'lat_g'],
      displayMin: -3, displayMax: 3, headline: false, precision: 2,
    },
    fuel_remaining_pct: {
      id: 'fuel_remaining_pct', label: 'Fuel Remaining', unit: '%',
      aliases: ['fuelPct', 'fuel_remaining_pct'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    lap_number: {
      id: 'lap_number', label: 'Lap', unit: '',
      aliases: ['lapNumber', 'lap'],
      displayMin: 1, displayMax: 500, headline: false, precision: 0,
    },
  },

  drag: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'ET (1/4 mi)', unit: 'ms',
      aliases: ['etMs', 'et_ms', 'quarter_mile_ms', 'elapsed_time_ms'],
      displayMin: 3500, displayMax: 30000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: '60-Foot', unit: 'ms',
      aliases: ['sixtyFootMs', 'sixty_foot_ms', '60ft_ms'],
      displayMin: 800, displayMax: 2500, headline: true, precision: 3,
    },
    tertiary_time_ms: {
      id: 'tertiary_time_ms', label: '330-Foot', unit: 'ms',
      aliases: ['threeThirtyMs', '330ft_ms'],
      displayMin: 2000, displayMax: 8000, headline: false, precision: 3,
    },
    drag_reaction_time_ms: {
      id: 'drag_reaction_time_ms', label: 'Reaction Time', unit: 'ms',
      aliases: ['reactionTimeMs', 'reaction_time_ms', 'rt_ms'],
      displayMin: 0, displayMax: 600, headline: true, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Trap Speed', unit: 'mph',
      aliases: ['trapSpeedMph', 'trap_speed', 'speedMph'],
      displayMin: 0, displayMax: 340, headline: true, precision: 2,
    },
    rpm: {
      id: 'rpm', label: 'RPM', unit: 'rpm',
      aliases: ['rpm', 'engineRpm'],
      displayMin: 0, displayMax: 10000, headline: false, precision: 0,
    },
  },

  karting: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Lap Time', unit: 'ms',
      aliases: ['lapTimeMs', 'lap_time_ms'],
      displayMin: 40000, displayMax: 120000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: 'Sector', unit: 'ms',
      aliases: ['sectorMs', 'sector_ms', 'mini_sector'],
      displayMin: 5000, displayMax: 40000, headline: false, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 100, headline: false, precision: 1,
    },
    tire_temp_f: {
      id: 'tire_temp_f', label: 'Tire Temp', unit: '°F',
      aliases: ['tireTemp', 'tire_temp_f'],
      displayMin: 60, displayMax: 220, headline: false, precision: 0,
    },
    g_force_lateral: {
      id: 'g_force_lateral', label: 'Lateral G', unit: 'G',
      aliases: ['gForceLateral', 'g_force_lateral'],
      displayMin: -3, displayMax: 3, headline: false, precision: 2,
    },
    g_force_longitudinal: {
      id: 'g_force_longitudinal', label: 'Long G', unit: 'G',
      aliases: ['gForceLongitudinal', 'g_force_longitudinal'],
      displayMin: -3, displayMax: 3, headline: false, precision: 2,
    },
    rpm: {
      id: 'rpm', label: 'RPM', unit: 'rpm',
      aliases: ['rpm', 'engineRpm'],
      displayMin: 0, displayMax: 16000, headline: false, precision: 0,
    },
    lap_number: {
      id: 'lap_number', label: 'Lap', unit: '',
      aliases: ['lapNumber', 'lap'],
      displayMin: 1, displayMax: 60, headline: false, precision: 0,
    },
  },

  rally: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Stage Time', unit: 'ms',
      aliases: ['stageTimeMs', 'stage_time_ms'],
      displayMin: 60000, displayMax: 1800000, headline: true, precision: 3,
    },
    secondary_time_ms: {
      id: 'secondary_time_ms', label: 'SS Split', unit: 'ms',
      aliases: ['ssSplitMs', 'ss_split_ms', 'checkpoint_ms'],
      displayMin: 10000, displayMax: 600000, headline: false, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 130, headline: false, precision: 1,
    },
    fuel_remaining_pct: {
      id: 'fuel_remaining_pct', label: 'Fuel Remaining', unit: '%',
      aliases: ['fuelPct', 'fuel_remaining_pct'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    stage_number: {
      id: 'stage_number', label: 'Stage', unit: '',
      aliases: ['stageNumber', 'stage_number', 'ss_number'],
      displayMin: 1, displayMax: 30, headline: false, precision: 0,
    },
    g_force_lateral: {
      id: 'g_force_lateral', label: 'Lateral G', unit: 'G',
      aliases: ['gForceLateral', 'g_force_lateral'],
      displayMin: -3, displayMax: 3, headline: false, precision: 2,
    },
  },

  fmx: {
    ...UNIVERSAL_CHANNELS,
    trick_air_time_ms: {
      id: 'trick_air_time_ms', label: 'Air Time', unit: 'ms',
      aliases: ['airTimeMs', 'air_time_ms', 'airtime'],
      displayMin: 500, displayMax: 5000, headline: true, precision: 2,
    },
    trick_amplitude_ft: {
      id: 'trick_amplitude_ft', label: 'Amplitude', unit: 'ft',
      aliases: ['amplitudeFt', 'amplitude_ft', 'height'],
      displayMin: 0, displayMax: 80, headline: true, precision: 1,
    },
    speed: {
      id: 'speed', label: 'Ramp Speed', unit: 'mph',
      aliases: ['speedMph', 'ramp_speed', 'approach_speed'],
      displayMin: 0, displayMax: 50, headline: false, precision: 1,
    },
    lean_angle_deg: {
      id: 'lean_angle_deg', label: 'Pitch Angle', unit: '°',
      aliases: ['pitchAngle', 'pitch', 'lean_angle'],
      displayMin: -180, displayMax: 180, headline: false, precision: 1,
    },
  },

  flat_track: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Lap Time', unit: 'ms',
      aliases: ['lapTimeMs', 'lap_time_ms'],
      displayMin: 20000, displayMax: 90000, headline: true, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 130, headline: false, precision: 1,
    },
    lean_angle_deg: {
      id: 'lean_angle_deg', label: 'Slide Angle', unit: '°',
      aliases: ['slideAngle', 'lean_angle', 'leanAngle'],
      displayMin: 0, displayMax: 60, headline: false, precision: 1,
    },
    throttle_pct: {
      id: 'throttle_pct', label: 'Throttle', unit: '%',
      aliases: ['throttle', 'throttle_pct'],
      displayMin: 0, displayMax: 100, headline: false, precision: 0,
    },
    rpm: {
      id: 'rpm', label: 'RPM', unit: 'rpm',
      aliases: ['rpm', 'engineRpm'],
      displayMin: 0, displayMax: 12000, headline: false, precision: 0,
    },
    lap_number: {
      id: 'lap_number', label: 'Lap', unit: '',
      aliases: ['lapNumber', 'lap'],
      displayMin: 1, displayMax: 30, headline: false, precision: 0,
    },
  },

  // trail, pit_bike — use MX defaults
  trail: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Segment Time', unit: 'ms',
      aliases: ['segmentTimeMs', 'lapTimeMs', 'lap_time_ms'],
      displayMin: 60000, displayMax: 3600000, headline: true, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 60, headline: false, precision: 1,
    },
    lap_number: {
      id: 'lap_number', label: 'Segment', unit: '',
      aliases: ['lapNumber', 'segmentNumber'],
      displayMin: 1, displayMax: 99, headline: false, precision: 0,
    },
  },

  pit_bike: {
    ...UNIVERSAL_CHANNELS,
    primary_time_ms: {
      id: 'primary_time_ms', label: 'Lap Time', unit: 'ms',
      aliases: ['lapTimeMs', 'lap_time_ms'],
      displayMin: 30000, displayMax: 120000, headline: true, precision: 3,
    },
    speed: {
      id: 'speed', label: 'Speed', unit: 'mph',
      aliases: ['speedMph', 'speed'],
      displayMin: 0, displayMax: 55, headline: false, precision: 1,
    },
    rpm: {
      id: 'rpm', label: 'RPM', unit: 'rpm',
      aliases: ['rpm', 'engineRpm'],
      displayMin: 0, displayMax: 13000, headline: false, precision: 0,
    },
    lap_number: {
      id: 'lap_number', label: 'Lap', unit: '',
      aliases: ['lapNumber', 'lap'],
      displayMin: 1, displayMax: 40, headline: false, precision: 0,
    },
  },
}

// ─── Build reverse alias lookup (per discipline) ──────────────────────────────

type AliasMap = Map<string, ChannelId>

const ALIAS_MAPS = new Map<DisciplineId, AliasMap>()

for (const [disciplineId, channelMap] of Object.entries(DISCIPLINE_CHANNEL_MAPS)) {
  const aliasMap: AliasMap = new Map()
  for (const meta of Object.values(channelMap) as ChannelMeta[]) {
    for (const alias of meta.aliases) {
      aliasMap.set(alias.toLowerCase(), meta.id)
    }
  }
  ALIAS_MAPS.set(disciplineId as DisciplineId, aliasMap)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the ChannelMeta for a given discipline.
 * Falls back to mx_sx if discipline is unknown.
 */
export function getChannelMap(disciplineId: string | null | undefined): DisciplineChannelMap {
  return DISCIPLINE_CHANNEL_MAPS[(disciplineId ?? 'mx_sx') as DisciplineId]
    ?? DISCIPLINE_CHANNEL_MAPS.mx_sx
}

/**
 * Returns headline channels for a discipline — used on session card KPI tiles.
 */
export function getHeadlineChannels(disciplineId: string | null | undefined): ChannelMeta[] {
  const map = getChannelMap(disciplineId)
  return Object.values(map).filter((c): c is ChannelMeta => !!c && c.headline)
}

/**
 * Normalizes a raw telemetry payload (keyed by device alias) into
 * canonical channel IDs for a given discipline.
 *
 * Unknown keys are passed through under their original name.
 */
export function normalizeTelemetryFrame(
  raw: Record<string, unknown>,
  disciplineId: string | null | undefined,
): Record<string, unknown> {
  const aliasMap = ALIAS_MAPS.get((disciplineId ?? 'mx_sx') as DisciplineId)
    ?? ALIAS_MAPS.get('mx_sx')!

  const normalized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(raw)) {
    const canonicalId = aliasMap.get(key.toLowerCase())
    normalized[canonicalId ?? key] = value
  }

  return normalized
}

/**
 * Returns the human label + unit for a channel in a given discipline.
 * Safe to call from UI — returns the raw channelId string if unknown.
 */
export function getChannelLabel(
  channelId: ChannelId | string,
  disciplineId: string | null | undefined,
): { label: string; unit: string } {
  const map = getChannelMap(disciplineId)
  const meta = map[channelId as ChannelId]
  if (meta) return { label: meta.label, unit: meta.unit }
  return { label: channelId, unit: '' }
}

/**
 * Formats a channel value for display with correct precision and unit.
 */
export function formatChannelValue(
  channelId: ChannelId | string,
  value: number | null | undefined,
  disciplineId: string | null | undefined,
): string {
  if (value == null) return '—'
  const map = getChannelMap(disciplineId)
  const meta = map[channelId as ChannelId]
  if (!meta) return String(value)

  // Special formatting for time channels (ms → seconds display)
  if (channelId.endsWith('_ms') || channelId === 'session_elapsed_ms') {
    const seconds = value / 1000
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3)
    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs
  }

  return `${value.toFixed(meta.precision)}${meta.unit ? ' ' + meta.unit : ''}`
}
