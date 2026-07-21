/**
 * Telemetry Device Registry
 * Maps all supported external hardware to file formats, parsers, and data mappers.
 * Extensible for future integrations.
 */

export type DeviceType = 
  | 'mylapstr2'
  | 'westhold_g3'
  | 'anubesport_stella'
  | 'raceboxlitpro'
  | 'crossbox_cbx20'
  | 'aim_solo'
  | 'alpinestars_tecair'
  | 'inmotionshot'
  | 'garmin_hrm'
  | 'polar_h10'
  | 'apple_watch'

export type FileFormat = 'CSV' | 'XML' | 'GPX' | 'KML' | 'FIT' | 'TCX' | 'XRK' | 'DRK' | 'PROPRIETARY' | 'TXT'

export interface Device {
  id: DeviceType
  name: string
  manufacturer: string
  category: 'timing' | 'motion' | 'telemetry' | 'ecu' | 'biometric' | 'safety' | 'gps'
  supportedFormats: FileFormat[]
  description: string
  motorsportRelevance: 'mx' | 'offroad' | 'universal' // what motorsports it supports
}

export interface ParsedTelemetry {
  timestamp?: number | string
  [key: string]: unknown
}

export const DEVICE_REGISTRY: Record<DeviceType, Device> = {
  // ── Timing Systems ──
  mylapstr2: {
    id: 'mylapstr2',
    name: 'MYLAPSTR2',
    manufacturer: 'MyLaps',
    category: 'timing',
    supportedFormats: ['CSV', 'XML'],
    description: 'Motorcycle transponder timing system. Logs lap times, split times, and session data.',
    motorsportRelevance: 'mx',
  },

  // ── Motion / Suspension ──
  westhold_g3: {
    id: 'westhold_g3',
    name: 'Westhold G3',
    manufacturer: 'Westhold',
    category: 'motion',
    supportedFormats: ['CSV', 'TXT'],
    description: 'Gyroscope and acceleration logger for suspension/handling analysis.',
    motorsportRelevance: 'mx',
  },

  anubesport_stella: {
    id: 'anubesport_stella',
    name: 'Anubesport Stella III',
    manufacturer: 'Anubesport',
    category: 'motion',
    supportedFormats: ['GPX', 'KML', 'CSV'],
    description: 'Advanced suspension telemetry with GPS positioning and track mapping.',
    motorsportRelevance: 'mx',
  },

  // ── Engine / Performance Telemetry ──
  raceboxlitpro: {
    id: 'raceboxlitpro',
    name: 'RaceBox LIT Pro / AiM Solo 2.X',
    manufacturer: 'RaceBox / AiM',
    category: 'telemetry',
    supportedFormats: ['GPX', 'CSV', 'FIT'],
    description: 'GPS-based performance logger with acceleration, braking, and g-force data.',
    motorsportRelevance: 'mx',
  },

  crossbox_cbx20: {
    id: 'crossbox_cbx20',
    name: 'Crossbox CBX20',
    manufacturer: 'Crossbox',
    category: 'ecu',
    supportedFormats: ['GPX', 'CSV'],
    description: 'Engine control unit data logger. RPM, throttle, boost, and diagnostics.',
    motorsportRelevance: 'mx',
  },

  aim_solo: {
    id: 'aim_solo',
    name: 'AiM Solo 2.X / Taipan ECU',
    manufacturer: 'AiM',
    category: 'ecu',
    supportedFormats: ['XRK', 'DRK', 'CSV'],
    description: 'Full ECU telemetry with engine parameters, fuel injection, and ignition mapping.',
    motorsportRelevance: 'mx',
  },

  // ── Safety Systems ──
  alpinestars_tecair: {
    id: 'alpinestars_tecair',
    name: 'Alpinestars Tech-Air MX',
    manufacturer: 'Alpinestars',
    category: 'safety',
    supportedFormats: ['PROPRIETARY', 'CSV'],
    description: 'Airbag deployment system telemetry. Tracks crash events and airbag activations.',
    motorsportRelevance: 'mx',
  },

  inmotionshot: {
    id: 'inmotionshot',
    name: 'In&motion Shot Air Guard',
    manufacturer: 'In&motion',
    category: 'safety',
    supportedFormats: ['PROPRIETARY', 'CSV'],
    description: 'Motion-based impact detection and analysis.',
    motorsportRelevance: 'universal',
  },

  // ── Biometric / Wearables ──
  garmin_hrm: {
    id: 'garmin_hrm',
    name: 'Garmin HRM-Pro',
    manufacturer: 'Garmin',
    category: 'biometric',
    supportedFormats: ['FIT', 'TCX', 'GPX', 'CSV'],
    description: 'Heart rate monitor with training metrics. Includes Running Power for load analysis.',
    motorsportRelevance: 'universal',
  },

  polar_h10: {
    id: 'polar_h10',
    name: 'Polar H10',
    manufacturer: 'Polar',
    category: 'biometric',
    supportedFormats: ['CSV', 'TCX', 'GPX'],
    description: 'Medical-grade heart rate monitor with ECG. Training load and recovery tracking.',
    motorsportRelevance: 'universal',
  },

  apple_watch: {
    id: 'apple_watch',
    name: 'Apple Watch',
    manufacturer: 'Apple',
    category: 'biometric',
    supportedFormats: ['XML', 'CSV', 'FIT'],
    description: 'Wearable fitness tracking with heart rate, workouts, and recovery data.',
    motorsportRelevance: 'universal',
  },
}

export function getDevice(deviceType: DeviceType): Device | null {
  return DEVICE_REGISTRY[deviceType] ?? null
}

export function getDevicesByMotorsport(motorsport: 'mx' | 'offroad' | 'universal'): Device[] {
  return Object.values(DEVICE_REGISTRY).filter(d => 
    d.motorsportRelevance === motorsport || d.motorsportRelevance === 'universal'
  )
}

export function getDevicesByCategory(category: Device['category']): Device[] {
  return Object.values(DEVICE_REGISTRY).filter(d => d.category === category)
}

export function getDevicesByFormat(format: FileFormat): Device[] {
  return Object.values(DEVICE_REGISTRY).filter(d => d.supportedFormats.includes(format))
}

export function allDeviceTypes(): DeviceType[] {
  return Object.keys(DEVICE_REGISTRY) as DeviceType[]
}
