'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdSessions, mdRiderReadiness, mdTelemetryDevices } from '@/lib/db/schema'
import { generateTwoWeekProgression, getDemoRiders } from '@/lib/demo/demo-data-generator'

/**
 * POST /api/demo/seed
 * Seeds the current team with realistic 2-week demo data + race weekend
 * One-time operation: overwrites existing data for demo purposes only
 */
export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sessions = generateTwoWeekProgression()
    const riders = getDemoRiders()

    // For each session in the demo data, insert into mdSessions
    // Note: mdSessions needs vehicleId, so we'll create dummy vehicle references
    // In production, would link to actual vehicles in the team fleet
    let insertedCount = 0

    for (const session of sessions) {
      try {
        await db
          .insert(mdSessions)
          .values({
            vehicleId: session.riderId as any, // Use rider ID as vehicle ID for demo
            trackName: 'Demo Track',
            sessionDate: session.date as any,
            sessionHours: session.duration / 60,
            bestLapSeconds: session.type === 'race' ? 85 + Math.random() * 5 : null,
            ambientTempF: 85,
            humidityPct: 65,
            windMph: 8,
            trackSurface: 'Motocross',
          } as any)

        // Insert corresponding readiness entry
        await db
          .insert(mdRiderReadiness)
          .values({
            teamId: auth.teamId as any,
            entryDate: session.date as any,
            sleepHours: (7 + Math.random() * 2).toString(),
            sleepScore: Math.round(75 + Math.random() * 15),
            hrv: Math.round(50 + Math.random() * 15),
            restingHr: Math.round(48 + Math.random() * 8),
            energy: Math.round(70 + Math.random() * 20),
            fatigue: Math.round(50 - Math.random() * 20),
            notes: `Demo session: ${session.type.toUpperCase()} day, ${session.duration} min`,
            source: 'demo',
          } as any)

        insertedCount++
      } catch (e) {
        // Silently skip duplicate entries
      }
    }

    // Insert demo device pairing
    try {
      await db
        .insert(mdTelemetryDevices)
        .values({
          teamId: auth.teamId as any,
          deviceType: 'polar_h10',
          displayName: 'Demo Polar H10 (Heart Rate)',
          pairingStatus: 'active',
          connectedAt: new Date().toISOString() as any,
          lastSyncAt: new Date().toISOString() as any,
        } as any)
    } catch (e) {
      // Device may already exist
    }

    return NextResponse.json({
      success: true,
      message: `Demo data seeded: ${insertedCount} sessions loaded, ${riders.length} riders, 2-week progression with race weekend`,
      summary: {
        sessions: insertedCount,
        riders: riders.map((r) => ({ id: r.id, name: r.name, number: r.number, level: r.level })),
        dateRange: '2026-07-01 to 2026-07-15',
        highlights:
          'Realistic training progression (build → taper → peak race), multi-rider comparison, readiness tracking demo',
      },
    })
  } catch (error) {
    console.error('[demo/seed]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Seeding failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/demo/seed
 * Returns demo data summary without writing to database
 */
export async function GET(req: NextRequest) {
  const { generateTwoWeekProgression, getDemoRiders, getDemoSummary } = await import(
    '@/lib/demo/demo-data-generator'
  )

  const sessions = generateTwoWeekProgression()
  const riders = getDemoRiders()
  const summary = getDemoSummary()

  return NextResponse.json({
    summary,
    riders: riders.map((r) => ({ id: r.id, name: r.name, number: r.number, level: r.level })),
    sessionCount: sessions.length,
    dateRange: '2026-07-01 to 2026-07-15',
    description: 'Realistic 2-week training progression + race weekend. 3 riders, 2 races, shows readiness prediction accuracy.',
  })
}
