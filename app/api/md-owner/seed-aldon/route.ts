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

const ALDON_EMAIL = 'aldonbaker@motorsportsdata.io'
const ALDON_PASSWORD = 'Baker#Compound1'
const ALDON_NAME = 'Aldon Baker'

/**
 * GET /api/md-owner/seed-aldon?token=<MD_OWNER_SEED_PASSWORD>
 * Creates Aldon Baker's dedicated coach account — safe to run multiple times.
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
        body: { email: ALDON_EMAIL, password: ALDON_PASSWORD, name: ALDON_NAME },
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
        .where(eq(userTable.email, ALDON_EMAIL))
        .limit(1)
      userId = existing?.id ?? null
    }

    if (!userId) return NextResponse.json({ error: 'Could not create or find Aldon Baker user' }, { status: 500 })

    // 2. Create or find "Baker Factory" team
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
          name: 'Baker Factory',
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

    if (!teamId) return NextResponse.json({ error: 'Could not create Baker Factory team' }, { status: 500 })

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
          name: 'Baker Factory — 12-Week Supercross Prep',
          encryptedContent: JSON.stringify({
            description: 'Championship-winning 12-week periodization block used by multiple AMA title holders.',
            weeks: [
              { week: '1-3', phase: 'Base Build', focus: '3x weekly moto at Zone 2 HR, technique fundamentals', volume: 'High', intensity: 'Low' },
              { week: '4-6', phase: 'Strength Block', focus: 'Gym 5x/week, reduced moto, body armor', volume: 'Medium', intensity: 'High' },
              { week: '7-9', phase: 'Race Simulation', focus: 'Full 30+2 motos, gate drops, pressure simulation', volume: 'Medium', intensity: 'Very High' },
              { week: '10-11', phase: 'Sharpening', focus: 'Short sharp motos, technique, mental prep', volume: 'Low', intensity: 'Max' },
              { week: '12', phase: 'Taper', focus: 'Light riding, rest, visualization, travel prep', volume: 'Very Low', intensity: 'Low' },
            ],
            notes: 'No shortcuts. The compound life is a lifestyle not a training camp.',
          }),
          accessLevel: 'coach_only',
          displayWatermark: true,
        },
        {
          type: 'hrz_zones',
          name: 'Baker Factory — Heart Rate Zone Protocol',
          encryptedContent: JSON.stringify({
            zones: [
              { zone: 1, name: 'Recovery', bpm: '< 130', usage: 'Active recovery, cool-down laps' },
              { zone: 2, name: 'Aerobic Base', bpm: '130–150', usage: 'Long motos, trail rides, cycling base' },
              { zone: 3, name: 'Aerobic Threshold', bpm: '150–165', usage: 'Race pace simulation, 20-min motos' },
              { zone: 4, name: 'Lactate Threshold', bpm: '165–178', usage: 'Gate drop sprints, rhythm section push' },
              { zone: 5, name: 'Max Effort', bpm: '178+', usage: 'Sprint intervals only — 30 sec max per rep' },
            ],
            weeklyTarget: 'Zone 2: 4+ hrs | Zone 3: 2 hrs | Zone 4: 45 min | Zone 5: 10 min',
            notes: 'Most amateurs overtrain Zone 4-5 and neglect Zone 2. Fix the base, the speed follows.',
          }),
          accessLevel: 'team_only',
          displayWatermark: true,
        },
        {
          type: 'workout',
          name: 'Baker Factory — Daily Gym Protocol (In-Season)',
          encryptedContent: JSON.stringify({
            description: 'In-season maintenance. Keep the engine running without burning it out.',
            sessions: [
              { day: 'Monday', focus: 'Upper Body Push', exercises: ['Bench Press 4x8', 'Shoulder Press 3x10', 'Tricep Dips 3x12', 'Neck Isometrics 4x30s'] },
              { day: 'Tuesday', focus: 'Moto + Bike', exercises: ['90-min technical moto', '45-min road cycling Z2', 'Stretch & recovery'] },
              { day: 'Wednesday', focus: 'Lower Body + Core', exercises: ['Squat 4x8', 'Romanian Deadlift 3x10', 'Hip Flexor 3x12', 'Forearm Roller 3x'] },
              { day: 'Thursday', focus: 'Moto + Run', exercises: ['Full 30+2 moto', '30-min trail run', 'Cold plunge'] },
              { day: 'Friday', focus: 'Pull + Grip', exercises: ['Pull-Ups 4x8', 'Rows 3x10', 'Grip Endurance 3x60s', 'Wrist Curls 3x15'] },
              { day: 'Saturday', focus: 'Race Sim or Gate Practice', exercises: ['Full race simulation', 'Video review', 'Setup debrief'] },
              { day: 'Sunday', focus: 'Full Rest', exercises: ['No training', 'Nutrition focus', 'Sleep 9+ hours'] },
            ],
          }),
          accessLevel: 'team_only',
          displayWatermark: true,
        },
        {
          type: 'taper',
          name: 'Baker Factory — Race Week Taper (Non-Negotiable)',
          encryptedContent: JSON.stringify({
            days: [
              { day: 'Monday (-7)', activity: '45-min light moto, no intensity', nutrition: 'High carb', sleep: '9 hrs' },
              { day: 'Tuesday (-6)', activity: 'Gym — upper body only, 60% effort', nutrition: 'High carb', sleep: '9 hrs' },
              { day: 'Wednesday (-5)', activity: '20-min technical moto, gate drops only', nutrition: 'High carb', sleep: '9 hrs' },
              { day: 'Thursday (-4)', activity: 'Travel or rest — no training', nutrition: 'Normal', sleep: '9 hrs' },
              { day: 'Friday (-3)', activity: 'Track walk, bike setup, practice day', nutrition: 'Normal', sleep: '9 hrs' },
              { day: 'Saturday (-2)', activity: 'Light spin or walk only', nutrition: 'High carb', sleep: '10 hrs' },
              { day: 'Race Day', activity: '20-min warm-up moto only', nutrition: 'Race protocol', sleep: 'N/A' },
            ],
            notes: 'No changes to bike setup after Wednesday. What you built in 12 weeks is what wins on Sunday.',
          }),
          accessLevel: 'coach_only',
          displayWatermark: true,
        },
        {
          type: 'custom',
          name: 'Baker Factory — Mental Performance Protocol',
          encryptedContent: JSON.stringify({
            pillars: [
              { pillar: 'Visualization', practice: '10 min eyes-closed track walkthrough each night before sleep' },
              { pillar: 'Pressure Inoculation', practice: 'Filmed gate drops with clock running and team watching' },
              { pillar: 'Debrief Protocol', practice: '3 things done well + 1 to improve. Never 3 negatives.' },
              { pillar: 'Distraction Control', practice: 'Phone off 2 hrs before moto. No social media race week.' },
              { pillar: 'Recovery Mindset', practice: 'Rest days are training days. Sleep is a weapon.' },
            ],
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

    // 4. Seed rider assignments (idempotent)
    const [existingAssignment] = await db
      .select({ id: mdCoachAssignments.id })
      .from(mdCoachAssignments)
      .where(eq(mdCoachAssignments.teamId, teamId))
      .limit(1)

    let assignmentsCreated = 0
    if (!existingAssignment) {
      const assignments = [
        {
          riderEmail: 'briandeegan@motorsportsdata.io',
          assignmentSpec: 'Week 1 Base Build: 3x 45-min motos at Zone 2 HR (130-150 BPM). No gate drops. Focus on smooth lines and body position. Log all 3 sessions with setup notes.',
          status: 'completed',
          dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          riderEmail: 'marissadeegan@motorsportsdata.io',
          assignmentSpec: 'Strength Block Day 1: Full gym session per Baker Factory Daily Gym Protocol. Upload HR data. Focus on neck and forearm conditioning.',
          status: 'acknowledged',
          dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        {
          riderEmail: 'test-privateer@motorsportsdata.io',
          assignmentSpec: 'Race Simulation: 30+2 moto filmed from outside berm of turn 3. Submit lap times and rider feedback within 24hrs.',
          status: 'pending',
          dueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
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
        ? 'Aldon Baker account already exists — tier refreshed to coach'
        : 'Aldon Baker account created with Baker Factory coaching data',
      credentials: {
        email: ALDON_EMAIL,
        password: ALDON_PASSWORD,
      },
      loginUrl: 'https://motorsportsdata.io/data/sign-in',
      team: 'Baker Factory',
      tier: 'Coach',
      templatesCreated,
      assignmentsCreated,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
