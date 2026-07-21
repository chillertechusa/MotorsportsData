/**
 * MD Spec DB — search + lookup helpers.
 * All searches operate on the static data array — no DB queries.
 */

export type { BikeSpec, ServiceInterval, TorqueSpec, SuspensionBaseline } from './types'
export { MD_SPEC_DATA } from './data'

import { MD_SPEC_DATA } from './data'
import type { BikeSpec } from './types'

/** Exact key lookup. */
export function getSpecByKey(key: string): BikeSpec | undefined {
  return MD_SPEC_DATA.find((s) => s.key === key)
}

/** Return all unique makes (sorted). */
export function getAllMakes(): string[] {
  return [...new Set(MD_SPEC_DATA.map((s) => s.make))].sort()
}

/** All specs for a given make (case-insensitive). */
export function getSpecsByMake(make: string): BikeSpec[] {
  return MD_SPEC_DATA.filter((s) => s.make.toLowerCase() === make.toLowerCase())
}

/** Simple text search across make, model, year, engine type. */
export function searchSpecs(query: string): BikeSpec[] {
  const q = query.toLowerCase().trim()
  if (!q) return MD_SPEC_DATA
  return MD_SPEC_DATA.filter((s) =>
    [s.make, s.model, String(s.year), s.engineType, s.displacement]
      .some((f) => f.toLowerCase().includes(q)),
  )
}

/** Build a short summary string for use in AI grounding prompts. */
export function buildSpecGroundingText(spec: BikeSpec): string {
  return [
    `${spec.year} ${spec.make} ${spec.model}`,
    `Engine: ${spec.displacement} ${spec.engineType}`,
    `Bore×Stroke: ${spec.boreStrokeMm} | CR: ${spec.compressionRatio}`,
    `Oil: ${spec.engineOilL} L ${spec.engineOilSpec}`,
    `Coolant: ${spec.coolantL} L | Fuel: ${spec.fuelTankL} L (${spec.fuelSpec})`,
    `Spark plug: ${spec.sparkPlug} gap ${spec.sparkPlugGapMm} mm`,
    `Idle: ${spec.idleRpm} rpm`,
    `Valve clearance IN: ${spec.valveInletClearanceMm} mm / EX: ${spec.valveExhaustClearanceMm} mm`,
    `Gearing: ${spec.frontSprocketTeeth}/${spec.rearSprocketTeeth} ${spec.chainPitch} chain ${spec.chainLinks}L`,
    `Tires: ${spec.frontTireSize} / ${spec.rearTireSize}`,
    `Chain slack: ${spec.chainSlackMm} mm`,
    `Weight: ${spec.weightKg} kg | Seat: ${spec.seatHeightMm} mm | WB: ${spec.wheelbaseMm} mm`,
    '',
    'Key service intervals (hours):',
    ...spec.serviceIntervals.map(
      (s) => `  • ${s.taskDescription} @ ${s.intervalHours} hr${s.note ? ` (${s.note})` : ''}`,
    ),
  ].join('\n')
}
