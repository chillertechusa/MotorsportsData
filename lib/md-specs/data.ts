/**
 * MD Spec DB — Curated OEM data.
 *
 * Sources:
 *   1. 2020 KTM 450 SX-F Owner's Manual (KTM Part No. 3402119en)
 *   2. 2020 Honda CRF450R/RWE/RX Owner's Manual (00X37-MKE-A100)
 *   3. 2006-2008 Kawasaki KX450F Service Manual (99924-1366-03)
 *
 * All values verified against OEM source pages. Do not modify without a
 * corrected citation — these numbers have safety implications.
 */

import type { BikeSpec } from './types'

export const MD_SPEC_DATA: BikeSpec[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // KTM 450 SX-F 2020
  // Source: KTM Owner's Manual 3402119en, pp. 34–36, 139
  // ──────────────────────────────────────────────────────────────────────────
  {
    key: 'ktm-450sxf-2020',
    make: 'KTM',
    model: '450 SX-F',
    year: 2020,
    displacement: '449.3 cc',
    boreStrokeMm: '95.0 × 63.5 mm',
    compressionRatio: '13.5:1',
    engineType: 'Single-cylinder 4-stroke, DOHC, liquid-cooled, fuel-injected',
    transmissionSpeeds: 5,
    weightKg: 99.6,
    seatHeightMm: 955,
    wheelbaseMm: 1485,
    msrpUsd: 10499,

    engineOilL: 0.9,
    engineOilSpec: 'KTM PowerPart 10W-60 4T Racing Oil',
    coolantL: 0.9,
    coolantSpec: 'KTM PowerPart Antifreeze — 50/50 premix',
    fuelTankL: 7.0, // SX-F models (XC-F US is 8.5 L)
    fuelSpec: 'RON 95 / PON 91 — Super Unleaded minimum',

    sparkPlug: 'NGK LKAR9BI-9',
    sparkPlugGapMm: 0.9,
    idleRpm: 1900,
    valveInletClearanceMm: '0.10–0.15',
    valveExhaustClearanceMm: '0.15–0.20',

    frontSprocketTeeth: 13,
    rearSprocketTeeth: 50,
    chainPitch: '520',
    chainLinks: 116,
    chainSlackMm: '55–58', // measured at chain sliding piece end, lower strand taut

    frontTireSize: '80/100-21',
    rearTireSize: '110/90-19',

    suspension: {
      forkType: 'WP XACT 5548 Air Suspension — air in left leg, damping in right',
      forkAirPsi: 158, // factory baseline ~10.9 bar for 75–85 kg rider
      forkOilType: 'WP 5W Fork Oil',
      forkRidingSagMm: 105,
      forkCompressionClicks: 20,
      forkReboundClicks: 20,
      shockSpringRate: 'WP 4-CS Coil — progressive',
      shockRidingSagMm: 105,
      shockHighSpeedCompClicks: 2,
      shockLowSpeedCompClicks: 15,
      shockReboundClicks: 15,
      standardRiderWeightKg: '75–85 kg (165–187 lb)',
    },

    torqueSpecs: [
      { fastener: 'Top triple clamp screw (M8)', nmValue: 17, ftLbValue: 12.5 },
      { fastener: 'Bottom triple clamp screw (M8)', nmValue: 12, ftLbValue: 8.9 },
      { fastener: 'Front brake caliper screw (M8)', nmValue: 25, ftLbValue: 18.4, note: 'Loctite 243' },
      { fastener: 'Top steering head screw (M20×1.5)', nmValue: 12, ftLbValue: 8.9 },
      { fastener: 'Chassis remaining screws M6', nmValue: 10, ftLbValue: 7.4 },
    ],

    serviceIntervals: [
      { taskDescription: 'Change engine oil + oil filter, clean oil screens', intervalHours: 10 },
      { taskDescription: 'Check valve clearance', intervalHours: 20, note: 'One-time at 20 hr, then every 40 hr' },
      { taskDescription: 'Change fuel screen', intervalHours: 20 },
      { taskDescription: 'Fork service', intervalHours: 50, note: 'Recommended — can be every 20 hr in severe use' },
      { taskDescription: 'Shock absorber service', intervalHours: 50 },
      { taskDescription: 'Minor engine service (spark plug, piston, cylinder head check, cam/rocker check)', intervalHours: 50 },
      { taskDescription: 'Major engine service (valves, conrod, bearings, timing chain)', intervalHours: 100 },
      { taskDescription: 'Change front + rear brake fluid', intervalHours: 100, note: 'Or every 12 months' },
      { taskDescription: 'Change hydraulic clutch fluid', intervalHours: 100, note: 'Or every 12 months' },
    ],

    manualTitle: '2020 KTM 450 SX-F / XC-F Owner\'s Manual',
    manualPartNumber: '3402119en',
    sourceNotes: 'Fuel tank capacity is 7.0 L for SX-F models; 8.5 L for XC-F US. Weight is without fuel.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Honda CRF450R 2020
  // Source: Honda Owner's Manual 00X37-MKE-A100, pp. 24–32, 63–86
  // ──────────────────────────────────────────────────────────────────────────
  {
    key: 'honda-crf450r-2020',
    make: 'Honda',
    model: 'CRF450R',
    year: 2020,
    displacement: '449 cc',
    boreStrokeMm: '96.0 × 62.1 mm',
    compressionRatio: '13.5:1',
    engineType: 'Single-cylinder 4-stroke, DOHC, liquid-cooled, PGM-FI',
    transmissionSpeeds: 5,
    weightKg: 110.0, // with oil and fuel
    seatHeightMm: 969,
    wheelbaseMm: 1494,
    msrpUsd: 9899,

    engineOilL: 0.85, // periodic change with filter
    engineOilSpec: 'Honda GN4 or HP4 10W-30 (HP4 preferred for competition)',
    coolantL: 1.25,
    coolantSpec: 'Honda Pre-Mix Coolant or 50/50 antifreeze+distilled water',
    fuelTankL: 6.3, // CRF450R; CRF450RX is 7.9 L
    fuelSpec: 'Regular unleaded 87 octane or higher (no E85)',

    sparkPlug: 'NGK LMAR8A-9',
    sparkPlugGapMm: 0.9,
    idleRpm: 1800,
    // From Honda Service Manual — valve clearance at cold, TDC compression
    valveInletClearanceMm: '0.12–0.18',
    valveExhaustClearanceMm: '0.22–0.28',

    frontSprocketTeeth: 13,
    rearSprocketTeeth: 48,
    chainPitch: '520',
    chainLinks: 114,
    chainSlackMm: '25–35', // measured at midpoint, bike on stand

    frontTireSize: '80/100-21 51M',
    rearTireSize: '120/80-19 63M',

    suspension: {
      forkType: 'Showa 49 mm Dual Bending Valve (DBV) — spring fork',
      forkSpringRate: '4.6 N/mm (standard)',
      forkOilType: 'Showa SS-8',
      forkRidingSagMm: 100,
      forkCompressionClicks: 11, // stock
      forkReboundClicks: 9,      // stock
      shockSpringRate: '52 N/mm (standard)',
      shockRidingSagMm: 102,
      shockHighSpeedCompClicks: 3,
      shockLowSpeedCompClicks: 10,
      shockReboundClicks: 12,
      standardRiderWeightKg: '72–90 kg (159–198 lb)',
    },

    torqueSpecs: [
      { fastener: 'Cylinder head bolt (M10)', nmValue: 59, ftLbValue: 44 },
      { fastener: 'Water pump cover bolts', nmValue: 9.8, ftLbValue: 7.2 },
      { fastener: 'Radiator mounting bolts', nmValue: 9.8, ftLbValue: 7.2 },
      { fastener: 'Throttle pulley cover bolt', nmValue: 3.4, ftLbValue: 2.5 },
    ],

    serviceIntervals: [
      { taskDescription: 'Air filter clean', intervalHours: 3.5, note: 'Every race/moto — more often in dusty conditions' },
      { taskDescription: 'Engine oil change', intervalHours: 7.5, note: 'Every 2 races' },
      { taskDescription: 'Spark plug — clean and inspect', intervalHours: 7.5 },
      { taskDescription: 'Throttle cable inspect and adjust', intervalHours: 7.5 },
      { taskDescription: 'Piston and rings replace', intervalHours: 15, note: 'Every 6 races for race use; sooner if KFM data shows wear' },
      { taskDescription: 'Valve clearance inspect', intervalHours: 15 },
      { taskDescription: 'Front fork oil change (each leg)', intervalHours: 15 },
      { taskDescription: 'Rear shock oil change', intervalHours: 15 },
      { taskDescription: 'Coolant level inspect', intervalHours: 7.5 },
      { taskDescription: 'Drive chain — inspect and adjust', intervalHours: 3.5, note: 'Every race' },
    ],

    manualTitle: '2020 Honda CRF450R/RWE/RX Owner\'s Manual',
    manualPartNumber: '00X37-MKE-A100',
    sourceNotes: 'Valve clearances from Honda Service Manual. Oil capacity 0.85 L at oil+filter change.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Kawasaki KX450F 2006–2008
  // Source: Kawasaki Service Manual 99924-1366-03, pp. 2-5 to 2-9, 5-6 to 5-7
  // ──────────────────────────────────────────────────────────────────────────
  {
    key: 'kawasaki-kx450f-2006',
    make: 'Kawasaki',
    model: 'KX450F',
    year: '2006–2008',
    displacement: '449 cc',
    boreStrokeMm: '96.0 × 62.1 mm',
    compressionRatio: '12.3:1',
    engineType: 'Single-cylinder 4-stroke, DOHC, liquid-cooled, carburetor',
    transmissionSpeeds: 5,
    weightKg: 109.0,
    seatHeightMm: 980,
    wheelbaseMm: 1490,
    msrpUsd: 6699, // 2006 MSRP

    engineOilL: 1.1, // oil change; 1.25 L after filter + drain
    engineOilSpec: 'Kawasaki 10W-40 4-stroke engine oil or API SE/SF/SG 10W-40',
    coolantL: 0.97,
    coolantSpec: 'Soft water + 50% antifreeze (−35°C minimum)',
    fuelTankL: 7.5,
    fuelSpec: 'Regular unleaded 87 octane or higher',

    sparkPlug: 'NGK CR9EK',
    sparkPlugGapMm: 0.7,
    idleRpm: 1800,
    // From KX450F service manual pp. 5-6 to 5-7 — at cold, TDC
    valveInletClearanceMm: '0.10–0.15',
    valveExhaustClearanceMm: '0.17–0.22',

    frontSprocketTeeth: 13,
    rearSprocketTeeth: 49,
    chainPitch: '520',
    chainLinks: 114,
    chainSlackMm: '30–40', // standard play at midpoint between sprockets

    frontTireSize: '80/100-21 51M',
    rearTireSize: '110/90-19 62M',

    suspension: {
      forkType: 'Kayaba 46 mm USD cartridge fork (KX450D6F/D7F); Kayaba 48 mm USD (D8F)',
      forkSpringRate: '4.5 N/mm (D6F/D7F); 5.0 N/mm (D8F)',
      forkOilType: 'KHL15-10 (KAYABA01) or equivalent',
      forkOilVolumeMl: 170, // D6F — 170 mL cylinder unit; 345 mL outer tube total
      forkRidingSagMm: 105,
      forkCompressionClicks: 12,
      forkReboundClicks: 13,
      shockSpringRate: '52 N/mm',
      shockRidingSagMm: 110,
      shockHighSpeedCompClicks: 2,
      shockLowSpeedCompClicks: 13,
      shockReboundClicks: 14,
      standardRiderWeightKg: '70–90 kg (154–198 lb)',
    },

    torqueSpecs: [
      { fastener: 'Cylinder head bolt (M10)', nmValue: 59, ftLbValue: 44 },
      { fastener: 'Exhaust pipe holder nuts', nmValue: 21, ftLbValue: 15 },
      { fastener: 'Muffler mounting bolts', nmValue: 21, ftLbValue: 15 },
      { fastener: 'Cylinder bolt', nmValue: 12, ftLbValue: 8.8, note: 'Follow sequence (S)' },
      { fastener: 'Fork base valve assembly (subtank)', nmValue: 28, ftLbValue: 21 },
      { fastener: 'Fork adjuster assembly', nmValue: 58, ftLbValue: 43 },
      { fastener: 'Fork locknut/adjuster assembly', nmValue: 29, ftLbValue: 22 },
    ],

    serviceIntervals: [
      { taskDescription: 'Spark plug — clean and inspect', intervalHours: 2.5, note: 'Every race or 2.5 hr' },
      { taskDescription: 'Engine oil change', intervalHours: 2.5, note: 'Every race or 2.5 hr' },
      { taskDescription: 'Air cleaner element clean', intervalHours: 2.5, note: 'Every race — more often in dusty conditions' },
      { taskDescription: 'Clutch cable inspect and adjust', intervalHours: 2.5 },
      { taskDescription: 'Spark plug replace', intervalHours: 7.5, note: 'Every 3 races or 7.5 hr' },
      { taskDescription: 'Valve clearance inspect', intervalHours: 15, note: 'Every 6 races or 15 hr' },
      { taskDescription: 'Piston and piston rings replace', intervalHours: 15, note: 'Every 6 races for race use' },
      { taskDescription: 'Oil filter replace', intervalHours: 7.5 },
      { taskDescription: 'Front fork oil change (each leg)', intervalHours: 7.5, note: 'Every 3 races' },
      { taskDescription: 'Rear shock oil change', intervalHours: 7.5, note: 'Every 3 races' },
      { taskDescription: 'Drive chain inspect and adjust', intervalHours: 2.5 },
    ],

    manualTitle: '2006–2008 Kawasaki KX450F Service Manual',
    manualPartNumber: '99924-1366-03',
    sourceNotes: 'Valve clearances from spec table pp. 5-6 (KX450D6F). Fork oil volume: 170 mL cylinder unit + 345 mL outer tube for D6F.',
  },
]
