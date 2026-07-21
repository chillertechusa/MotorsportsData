import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  mdTeams,
  mdTeamMembers,
  mdCoachTemplates,
  mdCoachAssignments,
  user as userTable,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const BRIAN_EMAIL = 'briandeegan@motorsportsdata.io'
const BRIAN_PASSWORD = 'TheGeneral#1'
const BRIAN_NAME = 'Brian Deegan'
const TEAM_NAME = 'Deegan MX'

/**
 * GET /api/md-owner/seed-brian?token=<MD_OWNER_SEED_PASSWORD>
 * Creates Brian Deegan's dedicated coach account (coaches his son Haiden).
 * Safe to run multiple times — idempotent.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const expected = process.env.MD_OWNER_SEED_PASSWORD

  if (!expected) return NextResponse.json({ error: 'MD_OWNER_SEED_PASSWORD is not set' }, { status: 500 })
  if (!token || token !== expected) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  try {
    // 1. Create user directly via auth API (server-side, no cookie redirect)
    let userId: string | null = null

    try {
      const ctx = await auth.api.signUpEmail({
        body: { email: BRIAN_EMAIL, password: BRIAN_PASSWORD, name: BRIAN_NAME },
        asResponse: false,
      })
      userId = (ctx as any)?.user?.id ?? null
    } catch {
      // Already exists — find them
    }

    if (!userId) {
      const [existing] = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, BRIAN_EMAIL))
        .limit(1)
      userId = existing?.id ?? null
    }

    if (!userId) return NextResponse.json({ error: 'Could not create or find Brian Deegan user' }, { status: 500 })

    // 2. Create or find "Deegan MX" team
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
        .values({
          name: TEAM_NAME,
          subscriptionTier: 'coach',
          subscriptionStatus: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        .returning({ id: mdTeams.id })
      teamId = team?.id ?? null
      if (teamId) {
        await db.insert(mdTeamMembers).values({ teamId, userId, role: 'owner' })
      }
    }

    if (!teamId) return NextResponse.json({ error: 'Could not create Deegan MX team' }, { status: 500 })

    // Always ensure tier is correct
    await db.update(mdTeams).set({
      subscriptionTier: 'coach',
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }).where(eq(mdTeams.id, teamId))

    // 3. Seed coaching templates (idempotent — skip if exist)
    const [existingTemplate] = await db
      .select({ id: mdCoachTemplates.id })
      .from(mdCoachTemplates)
      .where(eq(mdCoachTemplates.teamId, teamId))
      .limit(1)

    let templatesCreated = 0
    if (!existingTemplate) {
      const templates = [
        {
          type: 'periodization',
          name: 'Deegan MX — Outdoor National Prep',
          encryptedContent: JSON.stringify({
            description: 'The General\u2019s outdoor prep — build a motor that never quits when the moto goes 35 minutes.',
            weeks: [
              { week: '1-2', phase: 'Volume Base', focus: 'Long motos, sand riding, aerobic engine', volume: 'Very High', intensity: 'Low' },
              { week: '3-5', phase: 'Fitness + Sprint', focus: 'Cycling intervals, sprint motos, arm-pump prevention', volume: 'High', intensity: 'Medium' },
              { week: '6-8', phase: 'Moto Simulation', focus: 'Back-to-back 35-min motos, deep-into-the-moto starts', volume: 'High', intensity: 'High' },
              { week: '9-10', phase: 'Speed + Sharpen', focus: 'Sprint speed, holeshot practice, technique clean-up', volume: 'Medium', intensity: 'Very High' },
              { week: '11-12', phase: 'Peak + Taper', focus: 'Freshness, gate drops, mental prep', volume: 'Low', intensity: 'High' },
            ],
            notes: 'Deegans don\u2019t get outworked. Fitness wins the second moto.',
          }),
          accessLevel: 'coach_only',
          displayWatermark: true,
        },
        {
          type: 'workout',
          name: 'Deegan MX — Strength & Conditioning',
          encryptedContent: JSON.stringify({
            description: 'Full-body power and endurance program built around moto demands.',
            sessions: [
              { day: 'Monday', focus: 'Legs + Explosiveness', exercises: ['Box Jumps 4x6', 'Squats 4x8', 'Lunges 3x12', 'Calf Raises 3x20'] },
              { day: 'Tuesday', focus: 'Moto + Cardio', exercises: ['2x 30-min motos', 'MTB endurance 60 min', 'Stretch'] },
              { day: 'Wednesday', focus: 'Upper + Grip', exercises: ['Pull-Ups 4x8', 'Push Press 4x6', 'Farmer Carries 3x40m', 'Wrist Rollers 3x'] },
              { day: 'Thursday', focus: 'Moto + Sprints', exercises: ['Sprint motos 6x5min', 'Holeshot practice 20 starts', 'Cold recovery'] },
              { day: 'Friday', focus: 'Core + Mobility', exercises: ['Weighted Planks 4x60s', 'Hanging Leg Raises 3x15', 'Neck harness 4x30s', 'Mobility flow'] },
              { day: 'Saturday', focus: 'Race Simulation', exercises: ['Full 2-moto format', 'Video debrief', 'Setup notes'] },
              { day: 'Sunday', focus: 'Recovery', exercises: ['Rest or light spin', 'Nutrition reset', 'Sleep 9+ hrs'] },
            ],
          }),
          accessLevel: 'team_only',
          displayWatermark: true,
        },
        {
          type: 'custom',
          name: 'Deegan MX — Holeshot & Start Protocol',
          encryptedContent: JSON.stringify({
            description: 'Starts win championships. The General\u2019s gate-drop system.',
            drills: [
              { drill: 'Body Position', detail: 'Weight forward, elbows up, eyes down-track not at the gate' },
              { drill: 'Clutch/Throttle Sync', detail: '20 reps daily — find the bite point without wheelie or bog' },
              { drill: 'First Turn Commitment', detail: 'Pick the line before the gate drops. Never hesitate.' },
              { drill: 'Rep Volume', detail: 'Minimum 20 filmed starts per session. Review every one.' },
              { drill: 'Pressure Reps', detail: 'Start against teammates for real gate-drop pressure' },
            ],
            notes: 'Haiden\u2019s starts are a weapon because we drill them like nothing else.',
          }),
          accessLevel: 'coach_only',
          displayWatermark: true,
        },
        {
          type: 'taper',
          name: 'Deegan MX — Race Weekend Protocol',
          encryptedContent: JSON.stringify({
            days: [
              { day: 'Thursday', activity: 'Travel + light spin, bike prep', nutrition: 'High carb', sleep: '9 hrs' },
              { day: 'Friday', activity: 'Track walk, practice/qualifying, setup lock', nutrition: 'Normal', sleep: '9 hrs' },
              { day: 'Saturday', activity: 'Warm-up moto, gate picks, visualization', nutrition: 'Race protocol', sleep: '9 hrs' },
              { day: 'Race Day', activity: 'Sighting lap, start drills, execute the plan', nutrition: 'Race protocol', sleep: 'N/A' },
            ],
            notes: 'Bike setup is locked Friday night. Race day is about the rider, not the wrench.',
          }),
          accessLevel: 'coach_only',
          displayWatermark: true,
        },
      ]
      for (const t of templates) {
        await db.insert(mdCoachTemplates).values({ teamId, ...t })
        templatesCreated++
      }
    }

    // 4. Seed rider assignments — Haiden is the headliner (idempotent)
    const [existingAssignment] = await db
      .select({ id: mdCoachAssignments.id })
      .from(mdCoachAssignments)
      .where(eq(mdCoachAssignments.teamId, teamId))
      .limit(1)

    let assignmentsCreated = 0
    if (!existingAssignment) {
      const assignments = [
        {
          riderEmail: 'haidendeegan@motorsportsdata.io',
          assignmentSpec: 'Outdoor National Prep — Moto Sim block: 2x back-to-back 35-min motos at race pace. Log lap times, HR, and where fatigue sets in. Film the last 5 min of moto 2.',
          status: 'acknowledged',
          dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
        {
          riderEmail: 'haidendeegan@motorsportsdata.io',
          assignmentSpec: 'Holeshot Protocol: 25 filmed gate drops. Focus on clutch/throttle sync and first-turn commitment. Review every start and log the ones that bogged.',
          status: 'completed',
          dueAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          riderEmail: 'haidendeegan@motorsportsdata.io',
          assignmentSpec: 'Strength & Conditioning Friday: Core + Mobility session. Neck harness work is non-negotiable — 4x30s. Log all sets.',
          status: 'pending',
          dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      ]
      for (const a of assignments) {
        await db.insert(mdCoachAssignments).values({ teamId, ...a })
        assignmentsCreated++
      }
    }

    return NextResponse.json({
      ok: true,
      message: existingTemplate
        ? 'Brian Deegan account already exists — tier refreshed to coach'
        : 'Brian Deegan account created with Deegan MX coaching data',
      credentials: {
        email: BRIAN_EMAIL,
        password: BRIAN_PASSWORD,
      },
      loginUrl: 'https://motorsportsdata.io/data/sign-in',
      team: TEAM_NAME,
      tier: 'Coach',
      athlete: 'Haiden Deegan',
      templatesCreated,
      assignmentsCreated,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
