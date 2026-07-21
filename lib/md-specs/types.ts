/**
 * MD Spec DB — Static type definitions.
 * All values sourced directly from OEM service manuals.
 */

export interface ServiceInterval {
  taskDescription: string
  intervalHours: number
  note?: string
}

export interface TorqueSpec {
  fastener: string
  nmValue: number
  ftLbValue: number
  note?: string
}

export interface SuspensionBaseline {
  forkType: string
  forkAirPsi?: number
  forkSpringRate?: string
  forkOilType?: string
  forkOilVolumeMl?: number
  forkRidingSagMm?: number
  forkCompressionClicks?: number
  forkReboundClicks?: number
  shockSpringRate?: string
  shockRidingSagMm?: number
  shockHighSpeedCompClicks?: number
  shockLowSpeedCompClicks?: number
  shockReboundClicks?: number
  standardRiderWeightKg?: string
}

export interface BikeSpec {
  /** Unique key used to link md_vehicles.spec_key to this record */
  key: string
  // Identity
  make: string
  model: string
  year: number | string
  displacement: string
  boreStrokeMm: string
  compressionRatio: string
  engineType: string
  transmissionSpeeds: number
  weightKg: number
  seatHeightMm: number
  wheelbaseMm: number
  msrpUsd?: number

  // Capacities
  engineOilL: number
  engineOilSpec: string
  coolantL: number
  coolantSpec?: string
  fuelTankL: number
  fuelSpec: string
  forkOilMlPerLeg?: number

  // Tune
  sparkPlug: string
  sparkPlugGapMm: number
  idleRpm: number
  valveInletClearanceMm: string
  valveExhaustClearanceMm: string

  // Drive
  frontSprocketTeeth: number
  rearSprocketTeeth: number
  chainPitch: string
  chainLinks: number
  chainSlackMm: string

  // Tires
  frontTireSize: string
  rearTireSize: string
  frontTirePressureKpa?: number
  rearTirePressureKpa?: number

  // Suspension
  suspension: SuspensionBaseline

  // Key torque specs (most safety-critical)
  torqueSpecs: TorqueSpec[]

  // Service intervals (by engine hours)
  serviceIntervals: ServiceInterval[]

  // Source
  manualTitle: string
  manualPartNumber?: string
  sourceNotes?: string
}
