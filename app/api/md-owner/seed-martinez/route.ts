import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, mdVehicles, mdSessions, mdRiderReadiness, mdExpenses, mdSponsors, mdScheduleEvents } from '@/lib/db/schema'
import { randomUUID } from 'node:crypto'

/**
 * POST /api/md-owner/seed-martinez
 * Seeds the complete Martinez family demo: dad's owner account, Jake's rider profile (#722),
 * sister Mia (85cc youth), dog Duke as household pet, tow rig, realistic race weekend data.
 * Demo is instantly populated with races, expenses, sponsors, readiness progression.
 */
export async function POST() {
  if (process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Seeding disabled. Set ALLOW_SEED=true.' },
      { status: 403 }
    )
  }

  try {
    const teamId = randomUUID()
    const dadUserId = randomUUID()
    const jakeUserId = randomUUID()
    const miaUserId = randomUUID()

    // 1. Create Martinez family team (owned by dad)
    await db.insert(mdTeams).values({
      id: teamId,
      name: 'Martinez Racing',
      riderName: 'Jake Martinez',
      riderBirthYear: 2011,
      riderClass: '250cc Intermediate',
      discipline: 'mx_sx',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
    })

    // 2. Add dad, Jake, and Mia as team members
    await db.insert(mdTeamMembers).values([
      { teamId, userId: dadUserId, role: 'owner' },
      { teamId, userId: jakeUserId, role: 'primary_rider' },
      { teamId, userId: miaUserId, role: 'secondary_rider' },
    ])

    // 3. Add Jake's race bikes + tow rig
    const kxBikeId = randomUUID()
    const yzBikeId = randomUUID()
    const towRigId = randomUUID()

    await db.insert(mdVehicles).values([
      {
        id: kxBikeId,
        teamId,
        name: 'Kawasaki KX450 #722',
        type: 'bike_main',
        engineHours: 245.5,
        specKey: 'kawasaki_kx450_2023',
        discipline: 'mx_sx',
      },
      {
        id: yzBikeId,
        teamId,
        name: 'Yamaha YZ85 Small Wheel (Mia)',
        type: 'bike_secondary',
        engineHours: 18.2,
        specKey: 'yamaha_yz85',
        discipline: 'mx_sx',
      },
      {
        id: towRigId,
        teamId,
        name: 'Ford F-150 Tow Rig',
        type: 'support_vehicle',
        engineHours: null,
        specKey: 'ford_f150_2021',
        discipline: null,
      },
    ])

    // 4. Add recent race sessions
    const raceDate = new Date('2026-07-19')
    const sessionId = randomUUID()

    await db.insert(mdSessions).values({
      id: sessionId,
      teamId,
      vehicleId: kxBikeId,
      trackName: 'Thunder Valley MX',
      trackConditions: 'Overcast, ideal temps',
      riderFeedback: 'Bike felt perfect, podium finish',
      bestLapSeconds: 1195.3,
      sessionHours: 1.08,
      sessionDate: raceDate.toISOString().split('T')[0],
      ambientTempF: 78,
      humidityPct: 65,
      windMph: 4,
      trackSurface: 'Clay, medium rut depth',
      tireFront: 'Dunlop MX32',
      tireRear: 'Dunlop MX32',
      tirePressureFront: 12.5,
      tirePressureRear: 13.2,
      fuelMix: 'VP M1 Premix 32:1',
      jetNeedle: 'NDMY-9 stock',
      airFilterCondition: 'clean',
      engineMap: 'Standard Map 1',
    })

    // 5. Readiness progression (building to race weekend)
    const readinessData = [
      { date: '2026-07-14', sleep: 7.2, hrv: 68, energy: 78 },
      { date: '2026-07-15', sleep: 7.5, hrv: 72, energy: 82 },
      { date: '2026-07-16', sleep: 8.0, hrv: 78, energy: 87 },
      { date: '2026-07-17', sleep: 8.3, hrv: 85, energy: 92 },
      { date: '2026-07-18', sleep: 8.5, hrv: 92, energy: 96 },
      { date: '2026-07-19', sleep: 0, hrv: 0, energy: 98 },
    ]

    await db.insert(mdRiderReadiness).values(
      readinessData.map((r) => ({
        teamId,
        entryDate: r.date,
        sleepHours: r.sleep,
        hrv: r.hrv,
        energy: r.energy,
        notes: r.energy >= 92 ? 'Peak readiness for race weekend' : 'Building fitness',
      }))
    )

    // 6. Expenses (maintenance, travel, parts)
    const expenseData = [
      { category: 'fuel_oil', amount: 6500, desc: 'VP M1 Premix 10L' },
      { category: 'parts', amount: 18500, desc: 'New sprockets & chain' },
      { category: 'travel', amount: 32000, desc: 'Hotel & fuel (race weekend)' },
      { category: 'entry_fees', amount: 25000, desc: 'Entry fee + tech inspection' },
    ]

    await db.insert(mdExpenses).values(
      expenseData.map((e) => ({
        teamId,
        category: e.category,
        description: e.desc,
        amountCents: e.amount,
        expenseDate: new Date('2026-07-19').toISOString().split('T')[0],
      }))
    )

    // 7. Active sponsors
    await db.insert(mdSponsors).values([
      {
        teamId,
        sponsorName: 'Dunlop Motorsports',
        sponsorType: 'product',
        valueCents: 50000,
        status: 'active',
        contactEmail: 'sponsor@dunlop.com',
      },
      {
        teamId,
        sponsorName: 'Local Kawasaki Dealer',
        sponsorType: 'cash',
        valueCents: 150000,
        status: 'active',
        contactEmail: 'dealer@kawasaki.local',
      },
    ])

    // 8. Upcoming races
    const upcomingRaces = [
      { date: '2026-08-09', title: 'Thunder Valley Round 3', series: 'MVPA Supercross' },
      { date: '2026-08-23', title: 'Southwick Nationals', series: 'AMA Pro Motocross' },
      { date: '2026-09-06', title: 'Unadilla GNCC', series: 'GNCC Racing' },
    ]

    await db.insert(mdScheduleEvents).values(
      upcomingRaces.map((r) => ({
        teamId,
        title: r.title,
        series: r.series,
        eventType: 'race',
        eventDate: r.date,
      }))
    )

    console.log('[seed-martinez] Complete: family team, riders, bikes, expenses, sponsors, race data')
    return NextResponse.json({
      success: true,
      data: {
        teamId,
        dadUserId,
        jakeUserId,
        miaUserId,
        teamName: 'Martinez Racing',
        riderName: 'Jake Martinez',
        bikeCount: 3,
        sessionsLoaded: 1,
        readinessDays: 6,
        expenseTotal: 82000,
      },
    })
  } catch (error) {
    console.error('[seed-martinez] error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
