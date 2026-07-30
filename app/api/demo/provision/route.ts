/**
 * POST /api/demo/provision
 *
 * Creates a real ephemeral demo account with a Better Auth session,
 * seeds rich persona-specific data, and returns Set-Cookie headers so the
 * user lands inside the live authenticated platform immediately.
 *
 * Roles:
 *   coach       → Coach OS (/data/coach/roster)
 *   family_team → Team OS  (/data/team)
 *   facility    → Facility OS (/data/facility)
 *
 * Cleanup: /api/cron/demo-cleanup deletes demo accounts older than 2 hrs.
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
  mdVehicles,
  mdScheduleEvents,
  mdExpenses,
  mdSponsors,
  mdRiderReadiness,
  mdWorkOrders,
} from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { randomUUID } from 'crypto'

type DemoRole = 'coach' | 'family_team' | 'facility' | 'rider'

const d = (daysFromNow: number): string => {
  const dt = new Date()
  dt.setDate(dt.getDate() + daysFromNow)
  return dt.toISOString().split('T')[0]
}
const dt = (daysFromNow: number, hour = 9): Date => {
  const x = new Date()
  x.setDate(x.getDate() + daysFromNow)
  x.setHours(hour, 0, 0, 0)
  return x
}

// ─────────────────────────────────────────────────────────────────────────────
// COACH SEED
// ─────────────────────────────────────────────────────────────────────────────
async function seedCoach(teamId: string) {
  const [mxPkg, acaPkg] = await db.insert(mdCoachPackages).values([
    {
      coachTeamId: teamId,
      name: 'MX Private Training',
      description: 'One-on-one MX/SX private coaching — track sessions + video review + AI debrief',
      sessionCount: 8,
      durationWeeks: 4,
      priceCents: 80000,
      cadence: 'monthly',
    },
    {
      coachTeamId: teamId,
      name: 'Performance Academy',
      description: 'Full-season program — weekly plans, nutrition, mental coaching, race-day support',
      sessionCount: null,
      durationWeeks: 16,
      priceCents: 240000,
      cadence: 'monthly',
    },
  ]).returning()

  const athletes = await db.insert(mdCoachClients).values([
    { coachTeamId: teamId, firstName: 'Tyler',  lastName: 'Ramirez', discipline: 'mx_sx',   classCategory: '250 Pro',    homeTrack: 'Milestone MX Park',  status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Jade',   lastName: 'Kovacs',  discipline: 'mx_sx',   classCategory: '450 Am',     homeTrack: 'Glen Helen Raceway', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Mason',  lastName: 'Webb',    discipline: 'enduro',  classCategory: 'Pro Open',   homeTrack: 'Snowshoe WV',        status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Sienna', lastName: 'Cruz',    discipline: 'karting', classCategory: 'ROK Senior', homeTrack: 'Calspeed Karting',   status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Brody',  lastName: 'Haines',  discipline: 'mx_sx',   classCategory: '65cc Youth', homeTrack: 'Perris Raceway',     status: 'active' as const },
  ]).returning()

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
      aiDebrief: 'Mason showed significant improvement in rocky section momentum management. Recommend adding more slow-speed technical work next session.',
    },
    {
      coachTeamId: teamId, title: 'Karting — Sector Time Optimization',
      sessionType: 'track', discipline: 'karting', location: 'Calspeed Karting',
      scheduledAt: dt(-7), durationMinutes: 90, status: 'completed',
      aiDebrief: 'Sienna knocked 0.4s off sector 2 by adjusting late-apex entry. Tire temps still too high mid-session. Best session of the season.',
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
      goals: 'Peak for Saturday national qualifier. Maintain gate-drop consistency.',
      physicalBlocks: [
        { day: 'Mon', activity: 'Strength — upper body + grip', duration: 60, intensity: 'moderate' },
        { day: 'Wed', activity: 'Intervals — 8x5 min bike',    duration: 50, intensity: 'hard' },
        { day: 'Fri', activity: 'Activation — 20 min easy',    duration: 25, intensity: 'easy' },
      ],
      technicalBlocks: [
        { day: 'Tue', activity: 'Track — gate starts + rhythm', duration: 120, focus: 'gate drops, consistency' },
        { day: 'Thu', activity: 'Video review — qualifying film', duration: 60, focus: 'line choice, braking' },
      ],
      mentalBlocks: [{ day: 'Mon', activity: 'Visualization — gate drop sequence x10', duration: 15 }],
      nutritionNotes: 'Glycogen load Thursday night. Race morning: oatmeal + banana 3h before.',
      aiGenerated: false,
    },
    {
      coachTeamId: teamId, clientId: sienna.id,
      title: 'Sienna — Karting Season Wk 12', weekStart: d(0), weekEnd: d(6), status: 'active',
      goals: 'Lock in sector 2 gains. Chassis refinement for ROK Senior final.',
      physicalBlocks: [
        { day: 'Tue', activity: 'Neck strength — 3x10 each direction', duration: 20, intensity: 'moderate' },
      ],
      technicalBlocks: [
        { day: 'Wed', activity: 'Sim — Calspeed layout x20 laps', duration: 60,  focus: 'sector 2 consistency' },
        { day: 'Sat', activity: 'Track day — full race sim',       duration: 180, focus: 'tire mgmt, starts' },
      ],
      mentalBlocks: [], nutritionNotes: null, aiGenerated: false,
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
}

// ─────────────────────────────────────────────────────────────────────────────
// FAMILY TEAM SEED
// ─────────────────────────────────────────────────────────────────────────────
async function seedFamilyTeam(teamId: string) {
  // Bike
  const [bike] = await db.insert(mdVehicles).values({
    teamId,
    name: 'Chase #82 — 2024 KTM 250 SX-F',
    type: 'Motocross Bike',
    discipline: 'mx_sx',
    engineHours: 62.5,
    specKey: 'ktm_250sxf_2024',
  }).returning()

  // Race calendar — mix of past results and upcoming events
  const events = await db.insert(mdScheduleEvents).values([
    { teamId, vehicleId: bike.id, title: "Loretta Lynn's — Regional Qualifier", eventType: 'race', eventDate: d(-45), series: 'AMA Amateur National', finishPosition: 3, entryFeeCents: 27500, notes: 'P3 in 250 B. Chase was solid but lost time in the whoops. Setup was off — too soft in front.' },
    { teamId, vehicleId: bike.id, title: 'Budds Creek National Practice',         eventType: 'practice', eventDate: d(-21), series: null, finishPosition: null, entryFeeCents: 6500, notes: 'Good day. Worked on corner speed in the second half. Suspension felt better after last week\'s revalve.' },
    { teamId, vehicleId: bike.id, title: 'Unadilla — 250 B Amateur',              eventType: 'race', eventDate: d(-7),  series: 'NESC Series', finishPosition: 1, entryFeeCents: 22000, notes: 'P1! Holeshot moto 1, checked out. Moto 2 went down on lap 3 but came back to 4th. Overall win on points.' },
    { teamId, vehicleId: bike.id, title: 'Southwick MX — Saturday Practice',      eventType: 'practice', eventDate: d(5),  series: null, finishPosition: null, entryFeeCents: 5500, notes: 'Pre-race prep for RedBud. Sand conditions expected.' },
    { teamId, vehicleId: bike.id, title: 'RedBud Regional — 250 B',               eventType: 'race', eventDate: d(12), series: 'AMA District 6', finishPosition: null, entryFeeCents: 28500, notes: 'Gate fee paid. Hotel booked. Leaving Friday 5am.' },
    { teamId, vehicleId: bike.id, title: 'Loretta Lynn\'s National — Week 1',     eventType: 'race', eventDate: d(34), series: 'AMA Amateur National', finishPosition: null, entryFeeCents: 32000, notes: 'The big one. Full week at Hurricane Mills. Dad + Chase + coach Matt driving down Sunday.' },
  ]).returning()

  const [, , , , redBud, loretta] = events

  // Expenses — realistic family team budget
  await db.insert(mdExpenses).values([
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 27500, expenseDate: d(-46), description: 'Loretta Lynn\'s Regional entry — 250 B class', linkedScheduleEventId: events[0].id },
    { teamId, vehicleId: bike.id, category: 'Travel',       amountCents: 38400, expenseDate: d(-44), description: 'Hotel 3 nights + gas — Loretta qualifier trip' },
    { teamId, vehicleId: bike.id, category: 'Parts',        amountCents: 22800, expenseDate: d(-35), description: 'RaceTech fork revalve + spring swap — prep for Budds Creek' },
    { teamId, vehicleId: bike.id, category: 'Parts',        amountCents: 8900,  expenseDate: d(-30), description: 'Front rotor + pads + chain + sprockets' },
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 6500,  expenseDate: d(-22), description: 'Budds Creek practice day', linkedScheduleEventId: events[1].id },
    { teamId, vehicleId: bike.id, category: 'Gear',         amountCents: 31200, expenseDate: d(-20), description: 'Fox V3 helmet + new boots — Chase grew out of old gear' },
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 22000, expenseDate: d(-8),  description: 'Unadilla entry fee', linkedScheduleEventId: events[2].id },
    { teamId, vehicleId: bike.id, category: 'Coaching',     amountCents: 45000, expenseDate: d(-6),  description: 'Matt Hansen — monthly training block July' },
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 5500,  expenseDate: d(4),   description: 'Southwick practice day', linkedScheduleEventId: events[3].id },
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 28500, expenseDate: d(4),   description: 'RedBud Regional entry', linkedScheduleEventId: redBud.id },
    { teamId, vehicleId: bike.id, category: 'Travel',       amountCents: 52000, expenseDate: d(4),   description: 'RedBud — hotel 2 nights + van rental + gas estimate' },
    { teamId, vehicleId: bike.id, category: 'Entry Fees',   amountCents: 32000, expenseDate: d(4),   description: 'Loretta Lynn\'s National entry — 250 B + Open B', linkedScheduleEventId: loretta.id },
    { teamId, vehicleId: bike.id, category: 'Travel',       amountCents: 96000, expenseDate: d(4),   description: 'Hurricane Mills — 7 nights hotel + 1400mi round trip estimate' },
  ])

  // Sponsors
  await db.insert(mdSponsors).values([
    { teamId, sponsorName: 'ProMX Components',  sponsorType: 'product', valueCents: 180000, season: '2026', status: 'active',  deliverables: ['Logo on bike graphics', 'Instagram tag per race', '2x product posts/month'], notes: 'Send them photo from Loretta win ASAP — good content opportunity.' },
    { teamId, sponsorName: 'Miller Motorsports', sponsorType: 'cash',    valueCents: 120000, season: '2026', status: 'active',  deliverables: ['Decal on chest protector', 'Monthly recap email', 'Mention in result posts'],   notes: 'Bob Miller — personal contact of dad. $1,200 paid Q1. Q2 invoice due.' },
    { teamId, sponsorName: 'Local Pizza King',  sponsorType: 'cash',    valueCents: 50000,  season: '2026', status: 'pending', deliverables: ['Helmet sticker', 'Shoutout at local races'], notes: 'Dad\'s buddy from high school. Verbal commitment, no contract yet. Follow up.' },
    { teamId, sponsorName: 'Fox Racing',        sponsorType: 'product', valueCents: 85000,  season: '2026', status: 'active',  deliverables: ['Wear Fox gear at all events', 'Tag @foxracing every race post'], notes: 'Gear hook-up program. Contact is Jake T at Fox. Renewal due Nov.' },
  ])

  // Rider readiness log
  await db.insert(mdRiderReadiness).values([
    { teamId, entryDate: d(-6), sleepHours: '7.5', sleepScore: 78, hrv: 58, restingHr: 52 },
    { teamId, entryDate: d(-5), sleepHours: '8.0', sleepScore: 82, hrv: 61, restingHr: 50 },
    { teamId, entryDate: d(-4), sleepHours: '6.5', sleepScore: 65, hrv: 48, restingHr: 56 },
    { teamId, entryDate: d(-3), sleepHours: '9.0', sleepScore: 91, hrv: 71, restingHr: 46 },
    { teamId, entryDate: d(-2), sleepHours: '8.5', sleepScore: 88, hrv: 68, restingHr: 47 },
    { teamId, entryDate: d(-1), sleepHours: '7.0', sleepScore: 72, hrv: 54, restingHr: 53 },
    { teamId, entryDate: d(0),  sleepHours: '8.0', sleepScore: 84, hrv: 63, restingHr: 49 },
  ])

  // Mechanic / work orders
  await db.insert(mdWorkOrders).values([
    {
      teamId, vehicleId: bike.id,
      title: 'Post-Unadilla inspection + chain/sprocket swap',
      description: 'Full post-race inspection. Chain was stretched. Front wheel bearing making noise — check and replace if needed. Clean airbox.',
      status: 'closed',
      laborHours: 3.5,
      laborStartedAt: dt(-6), laborClosedAt: dt(-5),
      suspensionBefore: { 'Fork compression': '12 clicks', 'Fork rebound': '8 clicks', 'Shock compression': '10 clicks', 'Shock rebound': '9 clicks' },
      suspensionAfter:  { 'Fork compression': '12 clicks', 'Fork rebound': '8 clicks', 'Shock compression': '10 clicks', 'Shock rebound': '9 clicks' },
    },
    {
      teamId, vehicleId: bike.id,
      title: 'Prep for Southwick — soften suspension for sand',
      description: 'Southwick is deep sand. Soften fork and shock for better traction. Check tire pressure — run lower in sand. Fresh rear tire. Air filter.',
      status: 'open',
      laborHours: 0,
      suspensionBefore: { 'Fork compression': '12 clicks', 'Fork rebound': '8 clicks', 'Shock compression': '10 clicks', 'Shock rebound': '9 clicks' },
    },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// FACILITY SEED  (reuses coach data model with facility-specific content)
// ─────────────────────────────────────────────────────────────────────────────
async function seedFacility(teamId: string) {
  // Use coach clients as camp participants / facility members
  const [annualPkg, campPkg, dayPkg] = await db.insert(mdCoachPackages).values([
    { coachTeamId: teamId, name: 'Annual Membership',     description: 'Unlimited track days + 2 camps/year + AI coach access', sessionCount: null, durationWeeks: 52, priceCents: 189900, cadence: 'monthly' },
    { coachTeamId: teamId, name: 'Youth Development Camp', description: '3-day intensive for 65cc–125cc youth riders. Skills + gate work + video review.', sessionCount: 12, durationWeeks: 0, priceCents: 79900, cadence: 'monthly' },
    { coachTeamId: teamId, name: 'Track Day Pass',         description: 'Single gate-open practice day with coach on-site. Lunch included.', sessionCount: 1, durationWeeks: 0, priceCents: 8500, cadence: 'monthly' },
  ]).returning()

  const members = await db.insert(mdCoachClients).values([
    { coachTeamId: teamId, firstName: 'Ryan',   lastName: 'Tanner',  discipline: 'mx_sx',   classCategory: '250 Am',     homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Logan',  lastName: 'Pierce',  discipline: 'mx_sx',   classCategory: '450 Pro-Am', homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Avery',  lastName: 'Shaw',    discipline: 'mx_sx',   classCategory: '85cc',       homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Carter', lastName: 'Nichols', discipline: 'enduro',  classCategory: 'A Class',    homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Mia',    lastName: 'Delgado', discipline: 'mx_sx',   classCategory: '65cc',       homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Dante',  lastName: 'Russo',   discipline: 'mx_sx',   classCategory: '125 B',      homeTrack: 'Your Facility', status: 'active' as const },
    { coachTeamId: teamId, firstName: 'Harper', lastName: 'Quinn',   discipline: 'mx_sx',   classCategory: '250 B',      homeTrack: 'Your Facility', status: 'pending' as const },
  ]).returning()

  const [ryan, logan, avery, carter, mia, dante] = members

  // Upcoming camps / track days as sessions
  const [s1, s2, s3] = await db.insert(mdCoachSessions).values([
    {
      coachTeamId: teamId, title: 'Thursday Open Practice — Track A',
      sessionType: 'track', discipline: 'mx_sx', location: 'Your Facility — Track A',
      scheduledAt: dt(1, 7), durationMinutes: 480, status: 'scheduled',
      notes: '14 riders pre-registered. Waiver system closes tonight at midnight. Start time 7am sharp.',
    },
    {
      coachTeamId: teamId, title: 'Youth Development Camp — Day 1 of 3',
      sessionType: 'track', discipline: 'mx_sx', location: 'Your Facility — Skills Loop',
      scheduledAt: dt(8, 8), durationMinutes: 360, status: 'scheduled',
      notes: '8 campers enrolled. 65cc + 85cc split groups. Video debrief at end of each day.',
    },
    {
      coachTeamId: teamId, title: 'Saturday Open Practice — 450/250 Intermediate',
      sessionType: 'track', discipline: 'mx_sx', location: 'Your Facility — Track B',
      scheduledAt: dt(-3, 7), durationMinutes: 480, status: 'completed',
      aiDebrief: 'Strong turnout — 22 riders. No incidents. Ryan and Logan both posted personal bests. Recommend separating 65cc/85cc from full-size bikes on Saturday — it felt crowded in the start straight.',
    },
  ]).returning()

  await db.insert(mdCoachSessionAthletes).values([
    { sessionId: s1.id, clientId: ryan.id,   attendanceStatus: 'confirmed' },
    { sessionId: s1.id, clientId: logan.id,  attendanceStatus: 'confirmed' },
    { sessionId: s1.id, clientId: avery.id,  attendanceStatus: 'invited' },
    { sessionId: s1.id, clientId: dante.id,  attendanceStatus: 'confirmed' },
    { sessionId: s2.id, clientId: avery.id,  attendanceStatus: 'confirmed' },
    { sessionId: s2.id, clientId: mia.id,    attendanceStatus: 'confirmed' },
    { sessionId: s3.id, clientId: ryan.id,   attendanceStatus: 'attended', performanceRating: 4 },
    { sessionId: s3.id, clientId: logan.id,  attendanceStatus: 'attended', performanceRating: 4 },
    { sessionId: s3.id, clientId: carter.id, attendanceStatus: 'attended', performanceRating: 3 },
  ])

  const yr = new Date().getFullYear()
  await db.insert(mdCoachInvoices).values([
    { coachTeamId: teamId, clientId: ryan.id,  packageId: annualPkg.id, invoiceNumber: `INV-${yr}-0001`, status: 'paid',  amountCents: 189900, currency: 'USD', dueDate: d(-90), paidAt: new Date(Date.now() - 88 * 86400000), lineItems: [{ description: 'Annual Membership 2026', qty: 1, unitCents: 189900 }] },
    { coachTeamId: teamId, clientId: logan.id, packageId: annualPkg.id, invoiceNumber: `INV-${yr}-0002`, status: 'paid',  amountCents: 189900, currency: 'USD', dueDate: d(-90), paidAt: new Date(Date.now() - 85 * 86400000), lineItems: [{ description: 'Annual Membership 2026', qty: 1, unitCents: 189900 }] },
    { coachTeamId: teamId, clientId: avery.id, packageId: campPkg.id,   invoiceNumber: `INV-${yr}-0003`, status: 'sent',  amountCents: 79900,  currency: 'USD', dueDate: d(5),   lineItems: [{ description: 'Youth Development Camp Aug 8-10', qty: 1, unitCents: 79900 }] },
    { coachTeamId: teamId, clientId: mia.id,   packageId: campPkg.id,   invoiceNumber: `INV-${yr}-0004`, status: 'sent',  amountCents: 79900,  currency: 'USD', dueDate: d(5),   lineItems: [{ description: 'Youth Development Camp Aug 8-10', qty: 1, unitCents: 79900 }] },
    { coachTeamId: teamId, clientId: dante.id, packageId: dayPkg.id,    invoiceNumber: `INV-${yr}-0005`, status: 'draft', amountCents: 8500,   currency: 'USD', dueDate: d(2),   lineItems: [{ description: 'Thursday Open Practice Day', qty: 1, unitCents: 8500 }] },
    { coachTeamId: teamId, clientId: carter.id, packageId: dayPkg.id,   invoiceNumber: `INV-${yr}-0006`, status: 'paid',  amountCents: 8500,   currency: 'USD', dueDate: d(-4),  paidAt: new Date(Date.now() - 3 * 86400000), lineItems: [{ description: 'Saturday Open Practice Day', qty: 1, unitCents: 8500 }] },
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<DemoRole, {
  tier: string
  name: string
  redirectTo: string
}> = {
  coach:       { tier: 'coach_pro', name: 'Demo Coaching Business',    redirectTo: '/data/coach/roster' },
  family_team: { tier: 'privateer', name: 'Demo Family Race Team',      redirectTo: '/data/team' },
  facility:    { tier: 'academy',   name: 'Demo Training Facility',     redirectTo: '/data/facility' },
  rider:       { tier: 'free',      name: 'Demo Rider — Jake Martinez', redirectTo: '/data/rider' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const role: DemoRole = (['coach', 'family_team', 'facility', 'rider'].includes(body.role))
      ? body.role
      : 'coach'

    const demoId   = randomUUID().slice(0, 8)
    const teamId   = randomUUID() // ← valid UUID — fixes previous string-id bug
    const email    = `demo-${role}-${demoId}@motorsportsdata.io`
    const password = randomUUID()
    const config   = ROLE_CONFIG[role]

    // 1. Create real auth user
    const signUpRes = await auth.api.signUpEmail({
      body: { name: config.name, email, password },
    })
    if (!signUpRes?.user?.id) {
      return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 })
    }
    const userId = signUpRes.user.id

    // 2. Create team + membership
    await db.insert(mdTeams).values({
      id: teamId,
      name: config.name,
      subscriptionTier: config.tier,
      subscriptionStatus: 'active',
    })
    await db.insert(mdTeamMembers).values({ userId, teamId, role: 'owner' })

    // 3. Seed persona-specific data
    if (role === 'coach')       await seedCoach(teamId)
    if (role === 'family_team') await seedFamilyTeam(teamId)
    if (role === 'facility')    await seedFacility(teamId)
    if (role === 'rider')       {
      // For rider demos, call the Martinez seed endpoint to populate the real rider data
      const martínezSeedRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/md-owner/seed-martinez`,
        { method: 'POST' }
      )
      if (!martínezSeedRes.ok) {
        console.error('[demo-provision] Martinez seed failed:', await martínezSeedRes.text())
      }
    }

    // 4. Sign in — get real session cookies
    const signInRes = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    })

    // 5. Forward session cookies + set demo identity cookies
    const cookieHeader = (signInRes as Response).headers.get('set-cookie') ?? ''
    const response = NextResponse.json({
      success: true,
      redirectTo: config.redirectTo,
      demoId,
      role,
    }, { status: 201 })

    if (cookieHeader) {
      cookieHeader.split(/,(?=[^ ].*?=)/).forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie.trim())
      })
    }

    const isSecure = process.env.NODE_ENV === 'production'
    const cookieOpts = `Path=/; SameSite=Lax; Max-Age=7200${isSecure ? '; Secure' : ''}`
    response.headers.append('Set-Cookie', `x-demo-team=${teamId}; ${cookieOpts}`)
    response.headers.append('Set-Cookie', `x-demo-role=${role}; ${cookieOpts}`)
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
