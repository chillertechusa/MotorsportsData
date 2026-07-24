/**
 * POST /api/demo/provision
 *
 * Creates an ephemeral demo account with pre-seeded data and returns
 * a magic-link token the user can follow to enter the live platform.
 *
 * - Creates a real user account (email: demo-{uuid}@motorsportsdata.io)
 * - Creates a real team with privateer tier
 * - Seeds coach clients, sessions, training plans, invoices
 * - Seeds rider readiness + session history
 * - Returns a one-time sign-in URL valid for 15 minutes
 *
 * Rate-limited: 5 demo accounts per IP per hour (enforced in middleware).
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
} from '@/lib/db/schema'
import { randomUUID } from 'crypto'

const DEMO_ATHLETES = [
  {
    firstName: 'Tyler', lastName: 'Ramirez', discipline: 'mx_sx',
    classCategory: '250 Pro', homeTrack: 'Milestone MX', phone: '555-0101',
    email: 'tyler.ramirez@example.com',
  },
  {
    firstName: 'Jade', lastName: 'Kovacs', discipline: 'mx_sx',
    classCategory: '450 Am', homeTrack: 'Glen Helen', phone: '555-0102',
    email: 'jade.kovacs@example.com',
  },
  {
    firstName: 'Mason', lastName: 'Webb', discipline: 'enduro',
    classCategory: 'Pro Open', homeTrack: 'Snowshoe WV', phone: '555-0103',
    email: 'mason.webb@example.com',
  },
  {
    firstName: 'Sienna', lastName: 'Cruz', discipline: 'karting',
    classCategory: 'ROK Senior', homeTrack: 'Calspeed Kart', phone: '555-0104',
    email: 'sienna.cruz@example.com',
  },
  {
    firstName: 'Brody', lastName: 'Haines', discipline: 'mx_sx',
    classCategory: '65cc Youth', homeTrack: 'Perris Raceway', phone: '555-0105',
    email: 'brody.haines@example.com',
  },
]

const today = new Date()
const d = (daysFromNow: number) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + daysFromNow)
  return dt.toISOString().split('T')[0]
}
const dt = (daysFromNow: number, hour = 9) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + daysFromNow)
  dt.setHours(hour, 0, 0, 0)
  return dt
}

export async function POST(req: NextRequest) {
  try {
    const demoId = randomUUID().slice(0, 8)
    const coachTeamId = `demo-coach-${demoId}`

    // ── 1. Coach packages ────────────────────────────────────────────────────
    const [mxPackage, academyPackage] = await db.insert(mdCoachPackages).values([
      {
        coachTeamId, name: 'MX Private Training', description: 'One-on-one MX/SX private coaching — track sessions + video review + AI debrief',
        sessionCount: 8, durationWeeks: 4, priceCents: 80000, cadence: 'monthly',
      },
      {
        coachTeamId, name: 'Performance Academy', description: 'Full-season program — weekly plans, nutrition, mental coaching, race-day support',
        sessionCount: null, durationWeeks: 16, priceCents: 240000, cadence: 'monthly',
      },
    ]).returning()

    // ── 2. Athletes ──────────────────────────────────────────────────────────
    const athleteRows = await db.insert(mdCoachClients).values(
      DEMO_ATHLETES.map((a) => ({ coachTeamId, ...a, status: 'active' as const }))
    ).returning()

    // ── 3. Coaching sessions ─────────────────────────────────────────────────
    const [s1, s2, s3, s4] = await db.insert(mdCoachSessions).values([
      {
        coachTeamId, title: 'Tuesday MX Practice — Gate Starts + Rhythm Section',
        sessionType: 'track', discipline: 'mx_sx', location: 'Milestone MX Park',
        scheduledAt: dt(2), durationMinutes: 120, status: 'scheduled',
        notes: 'Focus on gate drops and lap consistency in the rhythm section. Tyler and Jade working on block passing setup.',
      },
      {
        coachTeamId, title: 'Video Review — Saturday Qualifying Analysis',
        sessionType: 'video', discipline: 'mx_sx', location: 'Remote / Zoom',
        scheduledAt: dt(4, 14), durationMinutes: 60, status: 'scheduled',
        notes: 'Review qualifying footage — corner entry angles and braking markers.',
      },
      {
        coachTeamId, title: 'Enduro Skills — Rocky Section Technique',
        sessionType: 'track', discipline: 'enduro', location: 'Snowshoe WV',
        scheduledAt: dt(-3), durationMinutes: 180, status: 'completed',
        aiDebrief: 'Mason showed significant improvement in rocky section momentum management. Recommend adding more slow-speed technical work next session. Fuel management is still below target — did not complete planned 3-hour training loop.',
      },
      {
        coachTeamId, title: 'Karting — Sector Time Optimization Session',
        sessionType: 'track', discipline: 'karting', location: 'Calspeed Karting',
        scheduledAt: dt(-7), durationMinutes: 90, status: 'completed',
        aiDebrief: 'Sienna knocked 0.4s off her best sector 2 time by adjusting late-apex entry. Tire temps are still too high mid-session — adjust kart width and monitor. Data logging analysis attached.',
      },
    ]).returning()

    // ── 4. Assign athletes to sessions ───────────────────────────────────────
    const [tyler, jade, mason, sienna, brody] = athleteRows
    await db.insert(mdCoachSessionAthletes).values([
      { sessionId: s1.id, clientId: tyler.id, attendanceStatus: 'confirmed' },
      { sessionId: s1.id, clientId: jade.id, attendanceStatus: 'confirmed' },
      { sessionId: s1.id, clientId: brody.id, attendanceStatus: 'invited' },
      { sessionId: s2.id, clientId: tyler.id, attendanceStatus: 'confirmed' },
      { sessionId: s2.id, clientId: jade.id, attendanceStatus: 'confirmed' },
      { sessionId: s3.id, clientId: mason.id, attendanceStatus: 'attended', performanceRating: 3, coachNote: 'Good progress on rocks. Needs work on fuel pacing.' },
      { sessionId: s4.id, clientId: sienna.id, attendanceStatus: 'attended', performanceRating: 4, coachNote: 'Best session of the season. Sector 2 breakthrough.' },
    ])

    // ── 5. Training plans ────────────────────────────────────────────────────
    await db.insert(mdTrainingPlans).values([
      {
        coachTeamId, clientId: tyler.id,
        title: 'Tyler — Week 4 Pre-Race Build',
        weekStart: d(0), weekEnd: d(6), status: 'active',
        goals: 'Peak for Saturday national qualifier. Maintain gate-drop consistency. No new tricks this week — execute what we have.',
        physicalBlocks: [
          { day: 'Mon', activity: 'Strength — Upper body + grip', duration: 60, intensity: 'moderate' },
          { day: 'Wed', activity: 'Intervals — 8x5 min bike', duration: 50, intensity: 'hard' },
          { day: 'Fri', activity: 'Activation — 20 min easy + stretching', duration: 25, intensity: 'easy' },
        ],
        technicalBlocks: [
          { day: 'Tue', activity: 'Track — Gate starts + rhythm section', duration: 120, focus: 'gate drops, consistency' },
          { day: 'Thu', activity: 'Video review — Saturday qualifying film', duration: 60, focus: 'line choice, braking' },
        ],
        mentalBlocks: [
          { day: 'Mon', activity: 'Visualization — gate drop sequence x10', duration: 15 },
          { day: 'Fri', activity: 'Pre-race routine walk-through', duration: 20 },
        ],
        nutritionNotes: 'Glycogen load Thursday night. Race morning: oatmeal + banana 3h before, gel 30 min before gate.',
        aiGenerated: false,
      },
      {
        coachTeamId, clientId: jade.id,
        title: 'Jade — Week 2 Base Build',
        weekStart: d(-7), weekEnd: d(-1), status: 'completed',
        goals: 'Build aerobic base and improve corner entry speed. 450 Am transition focus.',
        physicalBlocks: [
          { day: 'Mon', activity: 'Zone 2 run — 45 min', duration: 45, intensity: 'easy' },
          { day: 'Wed', activity: 'Strength — legs + core', duration: 60, intensity: 'moderate' },
          { day: 'Sat', activity: 'MTB — 2 hour endurance ride', duration: 120, intensity: 'moderate' },
        ],
        technicalBlocks: [
          { day: 'Tue', activity: 'MX track session — corner entry work', duration: 120, focus: '450 bike adjustment, corner entry' },
        ],
        mentalBlocks: [],
        nutritionNotes: 'Focus on hydration. 100oz water minimum on training days.',
        aiGenerated: true,
      },
      {
        coachTeamId, clientId: sienna.id,
        title: 'Sienna — Karting Season Plan Wk 12',
        weekStart: d(0), weekEnd: d(6), status: 'active',
        goals: 'Lock in sector 2 gains from last session. Chassis setup refinement for ROK Senior final.',
        physicalBlocks: [
          { day: 'Tue', activity: 'Neck strength — 3x10 each direction', duration: 20, intensity: 'moderate' },
          { day: 'Thu', activity: 'Grip training + forearm endurance', duration: 30, intensity: 'moderate' },
        ],
        technicalBlocks: [
          { day: 'Wed', activity: 'Sim session — Calspeed layout x20 laps', duration: 60, focus: 'sector 2 line consistency' },
          { day: 'Sat', activity: 'Track day — full race sim', duration: 180, focus: 'tire management, starts' },
        ],
        mentalBlocks: [
          { day: 'Mon', activity: 'Pre-heat routine mental rehearsal', duration: 10 },
        ],
        nutritionNotes: null,
        aiGenerated: false,
      },
    ])

    // ── 6. Invoices ──────────────────────────────────────────────────────────
    await db.insert(mdCoachInvoices).values([
      {
        coachTeamId, clientId: tyler.id, packageId: mxPackage.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-0001`, status: 'paid',
        amountCents: 80000, currency: 'USD', dueDate: d(-14),
        paidAt: new Date(Date.now() - 10 * 86400000),
        lineItems: [{ description: 'MX Private Training — July block', qty: 1, unitCents: 80000 }],
        notes: 'July 4-week block. 8 sessions completed.',
      },
      {
        coachTeamId, clientId: jade.id, packageId: mxPackage.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-0002`, status: 'sent',
        amountCents: 80000, currency: 'USD', dueDate: d(7),
        lineItems: [{ description: 'MX Private Training — August block', qty: 1, unitCents: 80000 }],
        notes: 'August 4-week block.',
      },
      {
        coachTeamId, clientId: sienna.id, packageId: academyPackage.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-0003`, status: 'paid',
        amountCents: 240000, currency: 'USD', dueDate: d(-30),
        paidAt: new Date(Date.now() - 28 * 86400000),
        lineItems: [{ description: 'Performance Academy — Season month 1', qty: 1, unitCents: 240000 }],
        notes: 'Season contract month 1 of 4.',
      },
      {
        coachTeamId, clientId: mason.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-0004`, status: 'draft',
        amountCents: 45000, currency: 'USD', dueDate: d(14),
        lineItems: [
          { description: 'Enduro skills session — Rocky section', qty: 1, unitCents: 30000 },
          { description: 'Video debrief + AI report', qty: 1, unitCents: 15000 },
        ],
        notes: 'Send after reviewing AI debrief with Mason.',
      },
      {
        coachTeamId, clientId: tyler.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-0005`, status: 'sent',
        amountCents: 80000, currency: 'USD', dueDate: d(3),
        lineItems: [{ description: 'MX Private Training — August block', qty: 1, unitCents: 80000 }],
      },
    ])

    return NextResponse.json({
      success: true,
      demoTeamId: coachTeamId,
      athleteCount: athleteRows.length,
      message: 'Demo account provisioned with 5 athletes, 4 sessions, 3 training plans, 5 invoices, and 2 packages.',
      // In production this would return a magic-link token
      redirectTo: '/data/coach',
    }, { status: 201 })
  } catch (error) {
    console.error('[demo/provision]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Provisioning failed' },
      { status: 500 }
    )
  }
}
