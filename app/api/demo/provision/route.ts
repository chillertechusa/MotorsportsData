/**
 * POST /api/demo/provision
 *
 * Creates a real ephemeral demo coaching account with a Better Auth session,
 * seeds rich data (athletes, sessions, plans, invoices), and returns a
 * Set-Cookie response so the user lands in the live authenticated platform.
 *
 * Flow:
 *  1. signUpEmail — creates a real auth user (demo-{uuid}@motorsportsdata.io)
 *  2. Insert mdTeams + mdTeamMembers so getSessionTeamId() resolves correctly
 *  3. Seed all coach data under that teamId
 *  4. signInEmail — gets a real session + cookies
 *  5. Return { redirectTo: '/data/coach/roster' } with all session cookies forwarded
 *
 * Cleanup: /api/cron/demo-cleanup deletes demo- teams older than 2 hrs nightly.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  mdCoachClients,
  mdCoachSessions,
  mdCoachSessionAthletes,
  mdTrainingPlans,
  mdCoachInvoices,
  mdCoachPackages,
  mdTeams,
  mdTeamMembers,
} from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { randomUUID } from 'crypto'

const DEMO_ATHLETES = [
  { firstName: 'Tyler',  lastName: 'Ramirez', discipline: 'mx_sx',   classCategory: '250 Pro',    homeTrack: 'Milestone MX Park' },
  { firstName: 'Jade',   lastName: 'Kovacs',  discipline: 'mx_sx',   classCategory: '450 Am',     homeTrack: 'Glen Helen Raceway' },
  { firstName: 'Mason',  lastName: 'Webb',    discipline: 'enduro',  classCategory: 'Pro Open',   homeTrack: 'Snowshoe WV' },
  { firstName: 'Sienna', lastName: 'Cruz',    discipline: 'karting', classCategory: 'ROK Senior', homeTrack: 'Calspeed Karting' },
  { firstName: 'Brody',  lastName: 'Haines',  discipline: 'mx_sx',   classCategory: '65cc Youth', homeTrack: 'Perris Raceway' },
]

const d = (daysFromNow: number) => {
  const dt = new Date(); dt.setDate(dt.getDate() + daysFromNow)
  return dt.toISOString().split('T')[0]
}
const dt = (daysFromNow: number, hour = 9) => {
  const x = new Date(); x.setDate(x.getDate() + daysFromNow); x.setHours(hour, 0, 0, 0)
  return x
}

export async function POST(req: NextRequest) {
  try {
    const demoId  = randomUUID().slice(0, 8)
    const email   = `demo-${demoId}@motorsportsdata.io`
    const password = randomUUID() // never shown — single-use ephemeral
    const teamId  = `demo-coach-${demoId}`
    const name    = 'Demo Coach'

    // ── 1. Create real auth user ─────────────────────────────────────────────
    const signUpRes = await auth.api.signUpEmail({
      body: { name, email, password },
    })
    if (!signUpRes?.user?.id) {
      return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 })
    }
    const userId = signUpRes.user.id

    // ── 2. Create team + membership so getSessionTeamId() resolves ───────────
    await db.insert(mdTeams).values({
      id: teamId,
      name: 'Demo Coaching Account',
      subscriptionTier: 'coach_pro',
      subscriptionStatus: 'active',
    })
    await db.insert(mdTeamMembers).values({
      userId,
      teamId,
      role: 'owner',
    })

    // ── 3. Seed data ─────────────────────────────────────────────────────────
    const [mxPkg, acaPkg] = await db.insert(mdCoachPackages).values([
      {
        coachTeamId: teamId, name: 'MX Private Training',
        description: 'One-on-one MX/SX private coaching — track sessions + video review + AI debrief',
        sessionCount: 8, durationWeeks: 4, priceCents: 80000, cadence: 'monthly',
      },
      {
        coachTeamId: teamId, name: 'Performance Academy',
        description: 'Full-season program — weekly plans, nutrition, mental coaching, race-day support',
        sessionCount: null, durationWeeks: 16, priceCents: 240000, cadence: 'monthly',
      },
    ]).returning()

    const athletes = await db.insert(mdCoachClients).values(
      DEMO_ATHLETES.map(a => ({ coachTeamId: teamId, ...a, status: 'active' as const }))
    ).returning()
    const [tyler, jade, mason, sienna, brody] = athletes

    const [s1, s2, s3, s4] = await db.insert(mdCoachSessions).values([
      {
        coachTeamId: teamId, title: 'Tuesday MX — Gate Starts + Rhythm Section',
        sessionType: 'track', discipline: 'mx_sx', location: 'Milestone MX Park',
        scheduledAt: dt(2), durationMinutes: 120, status: 'scheduled',
        notes: 'Focus on gate drops and lap consistency in the rhythm section. Tyler and Jade working on block-passing setup.',
      },
      {
        coachTeamId: teamId, title: 'Video Review — Saturday Qualifying Analysis',
        sessionType: 'video', discipline: 'mx_sx', location: 'Remote / Zoom',
        scheduledAt: dt(4, 14), durationMinutes: 60, status: 'scheduled',
        notes: 'Review qualifying footage — corner entry angles and braking markers.',
      },
      {
        coachTeamId: teamId, title: 'Enduro Skills — Rocky Section Technique',
        sessionType: 'track', discipline: 'enduro', location: 'Snowshoe WV',
        scheduledAt: dt(-3), durationMinutes: 180, status: 'completed',
        aiDebrief: 'Mason showed significant improvement in rocky section momentum management. Recommend adding more slow-speed technical work next session. Fuel management is still below target — did not complete planned 3-hour training loop.',
      },
      {
        coachTeamId: teamId, title: 'Karting — Sector Time Optimization',
        sessionType: 'track', discipline: 'karting', location: 'Calspeed Karting',
        scheduledAt: dt(-7), durationMinutes: 90, status: 'completed',
        aiDebrief: 'Sienna knocked 0.4s off sector 2 by adjusting late-apex entry. Tire temps still too high mid-session — adjust kart width and monitor. Best session of the season.',
      },
    ]).returning()

    await db.insert(mdCoachSessionAthletes).values([
      { sessionId: s1.id, clientId: tyler.id,  attendanceStatus: 'confirmed' },
      { sessionId: s1.id, clientId: jade.id,   attendanceStatus: 'confirmed' },
      { sessionId: s1.id, clientId: brody.id,  attendanceStatus: 'invited' },
      { sessionId: s2.id, clientId: tyler.id,  attendanceStatus: 'confirmed' },
      { sessionId: s2.id, clientId: jade.id,   attendanceStatus: 'confirmed' },
      { sessionId: s3.id, clientId: mason.id,  attendanceStatus: 'attended', performanceRating: 3, coachNote: 'Good progress on rocks. Needs work on fuel pacing.' },
      { sessionId: s4.id, clientId: sienna.id, attendanceStatus: 'attended', performanceRating: 4, coachNote: 'Best session of the season. Sector 2 breakthrough.' },
    ])

    await db.insert(mdTrainingPlans).values([
      {
        coachTeamId: teamId, clientId: tyler.id,
        title: 'Tyler — Week 4 Pre-Race Build', weekStart: d(0), weekEnd: d(6), status: 'active',
        goals: 'Peak for Saturday national qualifier. Maintain gate-drop consistency. No new tricks this week — execute what we have.',
        physicalBlocks: [
          { day: 'Mon', activity: 'Strength — upper body + grip', duration: 60, intensity: 'moderate' },
          { day: 'Wed', activity: 'Intervals — 8x5 min bike',    duration: 50, intensity: 'hard' },
          { day: 'Fri', activity: 'Activation — 20 min easy',    duration: 25, intensity: 'easy' },
        ],
        technicalBlocks: [
          { day: 'Tue', activity: 'Track — gate starts + rhythm', duration: 120, focus: 'gate drops, consistency' },
          { day: 'Thu', activity: 'Video review — qualifying film', duration: 60, focus: 'line choice, braking' },
        ],
        mentalBlocks: [
          { day: 'Mon', activity: 'Visualization — gate drop sequence x10', duration: 15 },
          { day: 'Fri', activity: 'Pre-race routine walk-through',           duration: 20 },
        ],
        nutritionNotes: 'Glycogen load Thursday night. Race morning: oatmeal + banana 3h before, gel 30 min before gate.',
        aiGenerated: false,
      },
      {
        coachTeamId: teamId, clientId: jade.id,
        title: 'Jade — Week 2 Base Build', weekStart: d(-7), weekEnd: d(-1), status: 'completed',
        goals: 'Build aerobic base and improve corner entry speed. 450 Am transition focus.',
        physicalBlocks: [
          { day: 'Mon', activity: 'Zone 2 run — 45 min',       duration: 45, intensity: 'easy' },
          { day: 'Wed', activity: 'Strength — legs + core',    duration: 60, intensity: 'moderate' },
          { day: 'Sat', activity: 'MTB — 2 hour endurance ride', duration: 120, intensity: 'moderate' },
        ],
        technicalBlocks: [
          { day: 'Tue', activity: 'MX track — corner entry work', duration: 120, focus: '450 adjustment, corner entry' },
        ],
        mentalBlocks: [], nutritionNotes: 'Focus on hydration. 100oz water minimum on training days.', aiGenerated: true,
      },
      {
        coachTeamId: teamId, clientId: sienna.id,
        title: 'Sienna — Karting Season Wk 12', weekStart: d(0), weekEnd: d(6), status: 'active',
        goals: 'Lock in sector 2 gains. Chassis refinement for ROK Senior final.',
        physicalBlocks: [
          { day: 'Tue', activity: 'Neck strength — 3x10 each direction', duration: 20, intensity: 'moderate' },
          { day: 'Thu', activity: 'Grip training + forearm endurance',   duration: 30, intensity: 'moderate' },
        ],
        technicalBlocks: [
          { day: 'Wed', activity: 'Sim — Calspeed layout x20 laps', duration: 60,  focus: 'sector 2 consistency' },
          { day: 'Sat', activity: 'Track day — full race sim',       duration: 180, focus: 'tire mgmt, starts' },
        ],
        mentalBlocks: [{ day: 'Mon', activity: 'Pre-heat mental rehearsal', duration: 10 }],
        nutritionNotes: null, aiGenerated: false,
      },
    ])

    const yr = new Date().getFullYear()
    await db.insert(mdCoachInvoices).values([
      {
        coachTeamId: teamId, clientId: tyler.id, packageId: mxPkg.id,
        invoiceNumber: `INV-${yr}-0001`, status: 'paid', amountCents: 80000,
        currency: 'USD', dueDate: d(-14), paidAt: new Date(Date.now() - 10 * 86400000),
        lineItems: [{ description: 'MX Private Training — July block', qty: 1, unitCents: 80000 }],
      },
      {
        coachTeamId: teamId, clientId: jade.id, packageId: mxPkg.id,
        invoiceNumber: `INV-${yr}-0002`, status: 'sent', amountCents: 80000,
        currency: 'USD', dueDate: d(7),
        lineItems: [{ description: 'MX Private Training — August block', qty: 1, unitCents: 80000 }],
      },
      {
        coachTeamId: teamId, clientId: sienna.id, packageId: acaPkg.id,
        invoiceNumber: `INV-${yr}-0003`, status: 'paid', amountCents: 240000,
        currency: 'USD', dueDate: d(-30), paidAt: new Date(Date.now() - 28 * 86400000),
        lineItems: [{ description: 'Performance Academy — Season month 1', qty: 1, unitCents: 240000 }],
      },
      {
        coachTeamId: teamId, clientId: mason.id,
        invoiceNumber: `INV-${yr}-0004`, status: 'draft', amountCents: 45000,
        currency: 'USD', dueDate: d(14),
        lineItems: [
          { description: 'Enduro skills session', qty: 1, unitCents: 30000 },
          { description: 'Video debrief + AI report', qty: 1, unitCents: 15000 },
        ],
      },
      {
        coachTeamId: teamId, clientId: tyler.id,
        invoiceNumber: `INV-${yr}-0005`, status: 'sent', amountCents: 80000,
        currency: 'USD', dueDate: d(3),
        lineItems: [{ description: 'MX Private Training — August block', qty: 1, unitCents: 80000 }],
      },
    ])

    // ── 4. Sign in to get a real session ─────────────────────────────────────
    const signInRes = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    })

    // ── 5. Forward all session cookies from Better Auth onto our response ─────
    const cookieHeader = (signInRes as Response).headers.get('set-cookie') ?? ''
    const response = NextResponse.json({
      success: true,
      redirectTo: '/data/coach/roster',
      demoId,
    }, { status: 201 })

    if (cookieHeader) {
      // Forward each session cookie from Better Auth
      cookieHeader.split(/,(?=[^ ].*?=)/).forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie.trim())
      })
    }

    // Set demo identity cookies so the coach layout can show the demo banner
    const cookieOpts = 'Path=/; SameSite=None; Secure; Max-Age=7200'
    response.headers.append('Set-Cookie', `x-demo-team=${teamId}; ${cookieOpts}`)
    response.headers.append('Set-Cookie', `x-demo-created=${new Date().toISOString()}; ${cookieOpts}`)

    return response
  } catch (error) {
    console.error('[demo/provision]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Provisioning failed' },
      { status: 500 }
    )
  }
}
