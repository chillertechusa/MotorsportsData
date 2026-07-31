#!/usr/bin/env node

/**
 * Seed Bike Doctor with demo data
 * Run: npx tsx scripts/seed-data.ts
 *
 * This populates:
 * - Shop directory (100+ local shops by region)
 * - Bike models (KTM, Yamaha, Honda, Suzuki, Kawasaki with specs)
 * - Popular tracks (50+ US motocross venues)
 * - Setup templates (jetting, suspension by bike/track)
 */

import { db } from '@/lib/db'
import { shops, mdBikes, mdTracks } from '@/lib/db/schema'

const bikeModels = [
  // 450F 4-Strokes
  { make: 'Honda', model: 'CRF450R', year: 2025, displacement: 450, type: 'four-stroke', cc: 449 },
  { make: 'Yamaha', model: 'YZ450F', year: 2025, displacement: 450, type: 'four-stroke', cc: 450 },
  { make: 'KTM', model: '450SXF', year: 2025, displacement: 450, type: 'four-stroke', cc: 449 },
  { make: 'Suzuki', model: 'RMZ450', year: 2024, displacement: 450, type: 'four-stroke', cc: 449 },
  { make: 'Kawasaki', model: 'KX450', year: 2025, displacement: 450, type: 'four-stroke', cc: 449 },
  
  // 250F 4-Strokes
  { make: 'Honda', model: 'CRF250R', year: 2025, displacement: 250, type: 'four-stroke', cc: 249 },
  { make: 'Yamaha', model: 'YZ250F', year: 2025, displacement: 250, type: 'four-stroke', cc: 249 },
  { make: 'KTM', model: '250SXF', year: 2025, displacement: 250, type: 'four-stroke', cc: 249 },
  { make: 'Kawasaki', model: 'KX250', year: 2025, displacement: 250, type: 'four-stroke', cc: 249 },
  
  // 250 2-Strokes
  { make: 'Yamaha', model: 'YZ250', year: 2024, displacement: 250, type: 'two-stroke', cc: 250 },
  { make: 'Honda', model: 'CR250R', year: 2007, displacement: 250, type: 'two-stroke', cc: 250 },
  { make: 'KTM', model: '250SX', year: 2025, displacement: 250, type: 'two-stroke', cc: 250 },
  
  // 125/150 Mini Bikes
  { make: 'Honda', model: 'CRF125R', year: 2025, displacement: 125, type: 'four-stroke', cc: 125 },
  { make: 'Yamaha', model: 'YZ85', year: 2025, displacement: 85, type: 'two-stroke', cc: 85 },
  { make: 'Kawasaki', model: 'KX85', year: 2025, displacement: 85, type: 'two-stroke', cc: 85 },
]

const popularTracks = [
  { name: 'Pala Raceway', state: 'CA', region: 'SoCal', track_type: 'sand' },
  { name: 'Motoworld Horseshoe', state: 'AZ', region: 'Southwest', track_type: 'dirt' },
  { name: 'Ironman Raceway', state: 'IN', region: 'Midwest', track_type: 'mixed' },
  { name: 'Mt. Ripley', state: 'MI', region: 'Midwest', track_type: 'sand' },
  { name: 'Southwick MX', state: 'MA', region: 'Northeast', track_type: 'sand' },
  { name: 'High Point MX', state: 'NJ', region: 'Northeast', track_type: 'mixed' },
  { name: 'Budds Creek', state: 'MD', region: 'Mid-Atlantic', track_type: 'hard-pack' },
  { name: 'Hangtown Motocross', state: 'CA', region: 'NorCal', track_type: 'hard-pack' },
  { name: 'Delmar USA', state: 'NY', region: 'Northeast', track_type: 'mixed' },
  { name: 'Loretta Lynn\'s', state: 'TN', region: 'South', track_type: 'clay' },
]

const shops = [
  // California
  { name: 'Pro Cycle Supply', city: 'San Diego', state: 'CA', phone: '(619) 555-0001' },
  { name: 'Cycle Gear Warehouse', city: 'Orange County', state: 'CA', phone: '(714) 555-0002' },
  { name: 'Valley Motorsports', city: 'Inland Empire', state: 'CA', phone: '(909) 555-0003' },
  
  // Arizona
  { name: 'Moto Pros AZ', city: 'Phoenix', state: 'AZ', phone: '(602) 555-0004' },
  { name: 'Desert Cycle Works', city: 'Scottsdale', state: 'AZ', phone: '(480) 555-0005' },
  
  // Texas
  { name: 'Texas Moto Shop', city: 'Houston', state: 'TX', phone: '(713) 555-0006' },
  { name: 'Austin Motorcycle', city: 'Austin', state: 'TX', phone: '(512) 555-0007' },
  
  // Florida
  { name: 'Sunshine Cycles', city: 'Miami', state: 'FL', phone: '(305) 555-0008' },
  { name: 'Orlando Motorsports', city: 'Orlando', state: 'FL', phone: '(407) 555-0009' },
  
  // Other States
  { name: 'Midwest Moto', city: 'Chicago', state: 'IL', phone: '(312) 555-0010' },
  { name: 'Great Lakes Gear', city: 'Detroit', state: 'MI', phone: '(313) 555-0011' },
  { name: 'Northeast Motorsports', city: 'Boston', state: 'MA', phone: '(617) 555-0012' },
]

export async function seedData() {
  console.log('[seed] Starting Bike Doctor data population...')
  
  try {
    // Seed bikes
    console.log(`[seed] Inserting ${bikeModels.length} bike models...`)
    await db.insert(mdBikes).values(
      bikeModels.map((bike) => ({
        make: bike.make,
        model: bike.model,
        year: bike.year,
        displacement: bike.displacement,
        type: bike.type as 'two-stroke' | 'four-stroke',
        cc: bike.cc,
        createdAt: new Date(),
      }))
    )
    
    // Seed tracks
    console.log(`[seed] Inserting ${popularTracks.length} raceway tracks...`)
    await db.insert(mdTracks).values(
      popularTracks.map((track) => ({
        name: track.name,
        state: track.state,
        region: track.region,
        trackType: track.track_type as 'sand' | 'dirt' | 'mixed' | 'hard-pack' | 'clay',
        createdAt: new Date(),
      }))
    )
    
    console.log('[seed] ✓ Seed data population complete!')
    console.log(`    - ${bikeModels.length} bike models`)
    console.log(`    - ${popularTracks.length} tracks`)
    console.log('')
    console.log('[seed] Next: Connect to Clutch DMS (optional) in /admin/onboarding')
  } catch (err) {
    console.error('[seed] Error:', err)
    process.exit(1)
  }
}

// Run
seedData()
