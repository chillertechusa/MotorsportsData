import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  mdTeams,
  mdTeamMembers,
  mdVehicles,
  mdSessions,
  mdSetupLogs,
  user as userTable,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'

/**
 * GET /api/md-owner/seed-privateers?token=<MD_OWNER_SEED_PASSWORD>
 *
 * Cohort simulation — real-world signup lifecycle, stage 1.
 * Creates 5 Privateer-tier riders (self-funded amateurs), each with a rider
 * profile, one bike, three setup-sheet sessions (weather + tires + jetting +
 * lap times) and per-session setup-log tweaks.
 *
 * Tier is seeded directly (no Square charge). Fully idempotent — re-running
 * refreshes the tier and skips rider data that already exists.
 */

const SHARED_PASSWORD = 'PrivateerLife#1'

type SessionSeed = {
  trackName: string
  trackConditions: string
  trackSurface: string
  riderFeedback: string
  bestLapSeconds: number
  sessionHours: number
  daysAgo: number
  ambientTempF: number
  humidityPct: number
  windMph: number
  tireFront: string
  tireRear: string
  tirePressureFront: number
  tirePressureRear: number
  fuelMix: string
  jetNeedle: string
  airFilterCondition: string
  engineMap: string
  logs: { key: string; value: string }[]
}

type RiderSeed = {
  email: string
  name: string
  teamName: string
  riderName: string
  riderBirthYear: number
  riderClass: string
  vehicleName: string
  vehicleSpecKey: string
  vehicleType: string
  sessions: SessionSeed[]
}

function sessionsFor(bike: string): SessionSeed[] {
  return [
    {
      trackName: 'Fox Raceway (Pala)',
      trackConditions: 'Prepped clay, watered heavy AM',
      trackSurface: 'clay',
      riderFeedback:
        'Front end pushing in the sweeper after lunch break. Dropped a click on compression and it settled down. Bike felt planted on the faces.',
      bestLapSeconds: 118.4,
      sessionHours: 1.5,
      daysAgo: 21,
      ambientTempF: 74,
      humidityPct: 38,
      windMph: 6,
      tireFront: 'Dunlop MX33 80/100-21',
      tireRear: 'Dunlop MX33 110/90-19',
      tirePressureFront: 12.5,
      tirePressureRear: 12.0,
      fuelMix: 'VP MRX01 pump',
      jetNeedle: 'Stock EFI — map 1',
      airFilterCondition: 'Fresh',
      engineMap: 'Map 1 (standard)',
      logs: [
        { key: 'Fork compression', value: '12 clicks out' },
        { key: 'Fork rebound', value: '10 clicks out' },
        { key: 'Sag (race)', value: '105mm' },
        { key: 'Front tire pressure', value: '12.5 psi' },
      ],
    },
    {
      trackName: 'Hangtown Motocross Classic',
      trackConditions: 'Hard-pack with afternoon dust',
      trackSurface: 'hard-pack',
      riderFeedback:
        'Rear stepping out on throttle in the off-cambers. Went up 2 psi rear and softened low-speed compression. Hooked up much better second moto.',
      bestLapSeconds: 121.9,
      sessionHours: 1.2,
      daysAgo: 12,
      ambientTempF: 81,
      humidityPct: 29,
      windMph: 11,
      tireFront: 'Dunlop MX33 80/100-21',
      tireRear: 'Dunlop MX33 110/90-19',
      tirePressureFront: 12.5,
      tirePressureRear: 13.5,
      fuelMix: 'VP MRX01 pump',
      jetNeedle: 'Stock EFI — map 2',
      airFilterCondition: 'Good',
      engineMap: 'Map 2 (aggressive)',
      logs: [
        { key: 'Rear compression (low)', value: '10 clicks out' },
        { key: 'Rear tire pressure', value: '13.5 psi' },
        { key: 'Engine map', value: 'Aggressive' },
      ],
    },
    {
      trackName: 'Thunder Valley (Lakewood)',
      trackConditions: 'Loamy, altitude 5,800 ft',
      trackSurface: 'loam',
      riderFeedback:
        'Altitude killing bottom-end. Switched to mellow map to keep traction on the ruts. Suspension great — no changes. Best laps of the year here.',
      bestLapSeconds: 116.7,
      sessionHours: 1.8,
      daysAgo: 4,
      ambientTempF: 68,
      humidityPct: 22,
      windMph: 8,
      tireFront: 'Dunlop MX33 80/100-21',
      tireRear: 'Dunlop MX33 120/90-19',
      tirePressureFront: 12.0,
      tirePressureRear: 12.5,
      fuelMix: 'VP T4 race',
      jetNeedle: 'Stock EFI — map 3 (altitude)',
      airFilterCondition: 'Fresh',
      engineMap: 'Map 3 (mellow / altitude)',
      logs: [
        { key: 'Engine map', value: 'Mellow (altitude)' },
        { key: 'Rear tire', value: '120/90-19 (soft terrain)' },
        { key: 'Sag (race)', value: '104mm' },
        { key: 'Fuel', value: 'VP T4 race' },
      ],
    },
  ]
}

const RIDERS: RiderSeed[] = [
  {
    email: 'privateer1@motorsportsdata.io',
    name: 'John Pruett',
    teamName: 'P-Town Racing',
    riderName: 'John "P-Town" Pruett',
    riderBirthYear: 2004,
    riderClass: '250 B',
    vehicleName: '#47 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
  {
    email: 'privateer2@motorsportsdata.io',
    name: 'Cole Ramirez',
    teamName: 'Ramirez Privateer Effort',
    riderName: 'Cole Ramirez',
    riderBirthYear: 1999,
    riderClass: '450 A',
    vehicleName: '#212 Honda CRF450R',
    vehicleSpecKey: 'honda-crf450r-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('honda'),
  },
  {
    email: 'privateer3@motorsportsdata.io',
    name: 'Dylan Foster',
    teamName: 'Foster Moto',
    riderName: 'Dylan Foster',
    riderBirthYear: 2006,
    riderClass: '250 C',
    vehicleName: '#88 Kawasaki KX450F',
    vehicleSpecKey: 'kawasaki-kx450f-2006',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('kawasaki'),
  },
  {
    email: 'privateer4@motorsportsdata.io',
    name: 'Marcus Webb',
    teamName: 'Webb Vet Racing',
    riderName: 'Marcus Webb',
    riderBirthYear: 1991,
    riderClass: 'Vet 30+',
    vehicleName: '#19 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
  {
    email: 'privateer5@motorsportsdata.io',
    name: 'Tyler Nunez',
    teamName: 'Nunez Racing',
    riderName: 'Tyler Nunez',
    riderBirthYear: 2003,
    riderClass: '250 B',
    vehicleName: '#305 Honda CRF450R',
    vehicleSpecKey: 'honda-crf450r-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('honda'),
  },
  {
    email: 'privateer6@motorsportsdata.io',
    name: 'Aiden Brooks',
    teamName: 'Brooks Racing',
    riderName: 'Aiden Brooks',
    riderBirthYear: 2005,
    riderClass: '250 A',
    vehicleName: '#61 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
  {
    email: 'privateer7@motorsportsdata.io',
    name: 'Mateo Silva',
    teamName: 'Silva Moto',
    riderName: 'Mateo Silva',
    riderBirthYear: 2001,
    riderClass: '450 B',
    vehicleName: '#144 Honda CRF450R',
    vehicleSpecKey: 'honda-crf450r-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('honda'),
  },
  {
    email: 'privateer8@motorsportsdata.io',
    name: 'Hunter Cross',
    teamName: 'Cross Country Racing',
    riderName: 'Hunter Cross',
    riderBirthYear: 2007,
    riderClass: '250 C',
    vehicleName: '#233 Kawasaki KX450F',
    vehicleSpecKey: 'kawasaki-kx450f-2006',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('kawasaki'),
  },
  {
    email: 'privateer9@motorsportsdata.io',
    name: 'Ethan Wolfe',
    teamName: 'Wolfe Pack Racing',
    riderName: 'Ethan Wolfe',
    riderBirthYear: 2000,
    riderClass: '450 A',
    vehicleName: '#7 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
  {
    email: 'privateer10@motorsportsdata.io',
    name: 'Logan Reyes',
    teamName: 'Reyes Racing',
    riderName: 'Logan Reyes',
    riderBirthYear: 2002,
    riderClass: '250 B',
    vehicleName: '#118 Honda CRF450R',
    vehicleSpecKey: 'honda-crf450r-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('honda'),
  },
  {
    email: 'privateer11@motorsportsdata.io',
    name: 'Blake Turner',
    teamName: 'Turner Moto',
    riderName: 'Blake Turner',
    riderBirthYear: 1994,
    riderClass: 'Vet 30+',
    vehicleName: '#40 Kawasaki KX450F',
    vehicleSpecKey: 'kawasaki-kx450f-2006',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('kawasaki'),
  },
  {
    email: 'privateer12@motorsportsdata.io',
    name: 'Carson Vega',
    teamName: 'Vega Racing',
    riderName: 'Carson Vega',
    riderBirthYear: 2006,
    riderClass: '250 C',
    vehicleName: '#256 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
  {
    email: 'privateer13@motorsportsdata.io',
    name: 'Nathan Poole',
    teamName: 'Poole Position Racing',
    riderName: 'Nathan Poole',
    riderBirthYear: 1998,
    riderClass: '450 A',
    vehicleName: '#22 Honda CRF450R',
    vehicleSpecKey: 'honda-crf450r-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('honda'),
  },
  {
    email: 'privateer14@motorsportsdata.io',
    name: 'Owen Marsh',
    teamName: 'Marsh Motorsports',
    riderName: 'Owen Marsh',
    riderBirthYear: 2004,
    riderClass: '250 A',
    vehicleName: '#71 Kawasaki KX450F',
    vehicleSpecKey: 'kawasaki-kx450f-2006',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('kawasaki'),
  },
  {
    email: 'privateer15@motorsportsdata.io',
    name: 'Gavin Hale',
    teamName: 'Hale Storm Racing',
    riderName: 'Gavin Hale',
    riderBirthYear: 2001,
    riderClass: '450 B',
    vehicleName: '#93 KTM 450 SX-F',
    vehicleSpecKey: 'ktm-450sxf-2020',
    vehicleType: '450 4-stroke',
    sessions: sessionsFor('ktm'),
  },
]

function dateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD for the `date` column
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const expected = process.env.MD_OWNER_SEED_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'MD_OWNER_SEED_PASSWORD is not set' }, { status: 500 })
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const results: Array<Record<string, unknown>> = []

  for (const rider of RIDERS) {
    try {
      // 1. Create (or find) the user via Better Auth so the password hashes.
      let userId: string | null = null
      let userStatus: 'created' | 'existing' = 'created'

      try {
        const ctx = await auth.api.signUpEmail({
          body: { email: rider.email, password: SHARED_PASSWORD, name: rider.name },
          asResponse: false,
        })
        userId = (ctx as { user?: { id?: string } })?.user?.id ?? null
      } catch {
        userStatus = 'existing'
      }

      if (!userId) {
        const [existing] = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.email, rider.email))
          .limit(1)
        userId = existing?.id ?? null
        userStatus = 'existing'
      }

      if (!userId) {
        results.push({ email: rider.email, status: 'error', detail: 'Could not create or find user' })
        continue
      }

      // 2. Create or find the rider's team.
      let teamId: string | null = null
      const [membership] = await db
        .select({ teamId: mdTeamMembers.teamId })
        .from(mdTeamMembers)
        .where(eq(mdTeamMembers.userId, userId))
        .limit(1)

      if (membership?.teamId) {
        teamId = membership.teamId
      } else {
        const [team] = await db
          .insert(mdTeams)
          .values({ name: rider.teamName })
          .returning({ id: mdTeams.id })
        teamId = team?.id ?? null
        if (teamId) {
          await db.insert(mdTeamMembers).values({ teamId, userId, role: 'owner' })
        }
      }

      if (!teamId) {
        results.push({ email: rider.email, status: 'error', detail: 'Could not create team' })
        continue
      }

      // 3. Set Privateer tier + rider profile (always refresh — idempotent).
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)

      await db
        .update(mdTeams)
        .set({
          subscriptionTier: 'privateer',
          subscriptionStatus: 'active',
          paymentStatus: 'active',
          billingFrequency: 'annual',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          riderName: rider.riderName,
          riderBirthYear: rider.riderBirthYear,
          riderClass: rider.riderClass,
          discipline: 'mx_sx',
        })
        .where(eq(mdTeams.id, teamId))

      // 4. Vehicle — skip all data seeding if one already exists (idempotent).
      const [existingVehicle] = await db
        .select({ id: mdVehicles.id })
        .from(mdVehicles)
        .where(eq(mdVehicles.teamId, teamId))
        .limit(1)

      let vehicleId = existingVehicle?.id ?? null
      let sessionsCreated = 0
      let logsCreated = 0

      if (!vehicleId) {
        const [vehicle] = await db
          .insert(mdVehicles)
          .values({
            teamId,
            name: rider.vehicleName,
            type: rider.vehicleType,
            specKey: rider.vehicleSpecKey,
            discipline: 'mx_sx',
            engineHours: 0,
          })
          .returning({ id: mdVehicles.id })
        vehicleId = vehicle?.id ?? null
      }

      // 5. Sessions (setup sheets) + setup logs.
      // Gated on whether this vehicle already has sessions — NOT on whether the
      // vehicle was just created — so a prior partial seed (vehicle made but
      // sessions failed) is completed on re-run.
      if (vehicleId) {
        const [existingSession] = await db
          .select({ id: mdSessions.id })
          .from(mdSessions)
          .where(eq(mdSessions.vehicleId, vehicleId))
          .limit(1)

        if (!existingSession) {
          let totalHours = 0
          for (const s of rider.sessions) {
            const [session] = await db
              .insert(mdSessions)
              .values({
                teamId,
                vehicleId,
                trackName: s.trackName,
                trackConditions: s.trackConditions,
                trackSurface: s.trackSurface,
                riderFeedback: s.riderFeedback,
                bestLapSeconds: s.bestLapSeconds,
                sessionHours: s.sessionHours,
                sessionDate: dateDaysAgo(s.daysAgo),
                ambientTempF: s.ambientTempF,
                humidityPct: s.humidityPct,
                windMph: s.windMph,
                tireFront: s.tireFront,
                tireRear: s.tireRear,
                tirePressureFront: s.tirePressureFront,
                tirePressureRear: s.tirePressureRear,
                fuelMix: s.fuelMix,
                jetNeedle: s.jetNeedle,
                airFilterCondition: s.airFilterCondition,
                engineMap: s.engineMap,
                shareToken: randomBytes(12).toString('hex'),
                isPublic: false,
              })
              .returning({ id: mdSessions.id })
            sessionsCreated++
            totalHours += s.sessionHours

            if (session?.id && s.logs.length) {
              await db.insert(mdSetupLogs).values(
                s.logs.map((l) => ({
                  teamId: teamId as string,
                  sessionId: session.id,
                  parameterKey: l.key,
                  parameterValue: l.value,
                })),
              )
              logsCreated += s.logs.length
            }
          }
          // Advance engine hours to match logged sessions.
          await db
            .update(mdVehicles)
            .set({ engineHours: Math.round(totalHours * 10) / 10 })
            .where(eq(mdVehicles.id, vehicleId))
        }
      }

      results.push({
        email: rider.email,
        password: SHARED_PASSWORD,
        rider: rider.riderName,
        team: rider.teamName,
        tier: 'privateer',
        user: userStatus,
        vehicle: existingVehicle ? 'existing' : 'created',
        sessionsCreated,
        logsCreated,
        status: 'ok',
      })
    } catch (err) {
      results.push({
        email: rider.email,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length
  return NextResponse.json({
    ok: true,
    message: `Privateer cohort seed complete — ${ok}/${RIDERS.length} riders ready`,
    loginUrl: 'https://motorsportsdata.io/data/sign-in',
    sharedPassword: SHARED_PASSWORD,
    riders: results,
  })
}
