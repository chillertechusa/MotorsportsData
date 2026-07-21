// Race Coach AI — full-context aggregator.
// Pulls every athlete + machine + money signal for a team into one structured
// object that grounds the Gemini 2.5 Pro pocket coach. All queries are strictly
// team-scoped. Read-only; safe to call on every coach request.
import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  mdTeams,
  mdVehicles,
  mdSessions,
  mdScheduleEvents,
  mdExpenses,
  mdSponsors,
  mdRiderReadiness,
  mdNutritionLog,
  mdHydrationLog,
  mdMentalLog,
  mdInjuries,
  mdVideoAnalyses,
} from '@/lib/db/schema'
import { getDisciplineProtocol, getDiscipline } from '@/lib/md-discipline'
import { getSpecByKey, buildSpecGroundingText } from '@/lib/md-specs/index'

export interface CoachContext {
  /** Team-level primary discipline (from md_teams.discipline) */
  discipline: string
  /** Human-readable discipline label */
  disciplineLabel: string
  /** Full AI protocol text injected into system prompt */
  disciplineProtocol: string
  fleet: { id: string; name: string; specKey: string | null; discipline: string | null }[]
  specSheets: string[]
  recentSessions: {
    track: string
    date: string
    conditions: string
    feedback: string
  }[]
  nextEvent: {
    title: string
    type: string
    date: string
    track: string | null
    series: string | null
    entryFeeDollars: number
    weather: string | null
    priorFinishesHere: number[]
  } | null
  upcomingEvents: { title: string; type: string; date: string }[]
  finances: {
    seasonSpendDollars: number
    byCategory: Record<string, number>
    last30Dollars: number
  }
  sponsors: {
    totalCashDollars: number
    totalProductDollars: number
    outstandingDeliverables: number
    active: { name: string; type: string; valueDollars: number; deliverables: string[] }[]
  }
  readiness: {
    date: string
    sleepHours: number | null
    hrv: number | null
    restingHr: number | null
    energy: number | null
    fatigue: number | null
  } | null
  nutritionToday: { calories: number; proteinG: number; carbsG: number; fatG: number; waterMl: number }
  mental: {
    date: string
    mood: number | null
    focus: number | null
    anxiety: number | null
    confidence: number | null
    motivation: number | null
  } | null
  activeInjuries: {
    region: string
    type: string
    severity: number
    isConcussion: boolean
    rtrStage: number
    status: string
  }[]
  latestVideo: { summary: string; overallScore: number; topImprovements: string[] } | null
}

function centsToDollars(cents: number | null | undefined): number {
  return Math.round(((cents ?? 0) / 100) * 100) / 100
}

function num(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? parseFloat(v) : v
  return Number.isFinite(n) ? n : null
}

// Open-Meteo forecast for an event's coordinates + date. Free, no key.
async function fetchEventWeather(lat: number, lng: number, dateISO: string): Promise<string | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&start_date=${dateISO}&end_date=${dateISO}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    const d = data?.daily
    if (!d?.temperature_2m_max?.[0] && d?.temperature_2m_max?.[0] !== 0) return null
    return `High ${Math.round(d.temperature_2m_max[0])}°F / Low ${Math.round(d.temperature_2m_min[0])}°F, ${d.precipitation_probability_max[0]}% rain, wind to ${Math.round(d.wind_speed_10m_max[0])}mph, UV ${d.uv_index_max[0]}`
  } catch {
    return null
  }
}

export async function buildCoachContext(teamId: string): Promise<CoachContext> {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)

  // Team discipline
  const [teamRow] = await db
    .select({ discipline: mdTeams.discipline })
    .from(mdTeams)
    .where(eq(mdTeams.id, teamId))
    .limit(1)
  const teamDisciplineId = teamRow?.discipline ?? null
  const disciplineObj = getDiscipline(teamDisciplineId)
  const disciplineProtocol = getDisciplineProtocol(teamDisciplineId)

  // Fleet + spec sheets
  const fleetRows = await db
    .select({ id: mdVehicles.id, name: mdVehicles.name, specKey: mdVehicles.specKey, discipline: mdVehicles.discipline })
    .from(mdVehicles)
    .where(eq(mdVehicles.teamId, teamId))
  const fleet = fleetRows.map((v) => ({ id: v.id, name: v.name ?? 'Vehicle', specKey: v.specKey ?? null, discipline: v.discipline ?? null }))
  const specSheets: string[] = []
  for (const v of fleet) {
    if (v.specKey) {
      const spec = getSpecByKey(v.specKey)
      if (spec) specSheets.push(`${v.name}:\n${buildSpecGroundingText(spec)}`)
    }
  }

  const teamVehicleIds = fleet.map((v) => v.id)

  // Recent sessions (last 5)
  const sessionRows =
    teamVehicleIds.length > 0
      ? await db
          .select()
          .from(mdSessions)
          .where(inArray(mdSessions.vehicleId, teamVehicleIds))
          .orderBy(desc(mdSessions.sessionDate))
          .limit(5)
      : []
  const recentSessions = sessionRows.map((s) => ({
    track: s.trackName,
    date: s.sessionDate ?? '',
    conditions: s.trackConditions ?? 'Unknown',
    feedback: s.riderFeedback ?? '',
  }))

  // Schedule — next upcoming event + prior finishes at same track
  const upcoming = await db
    .select()
    .from(mdScheduleEvents)
    .where(and(eq(mdScheduleEvents.teamId, teamId), gte(mdScheduleEvents.eventDate, today)))
    .orderBy(mdScheduleEvents.eventDate)
    .limit(6)

  let nextEvent: CoachContext['nextEvent'] = null
  if (upcoming.length > 0) {
    const e = upcoming[0]
    // Prior finishes at same track (past races with a finish position)
    const priors = e.trackId
      ? await db
          .select({ finish: mdScheduleEvents.finishPosition })
          .from(mdScheduleEvents)
          .where(and(eq(mdScheduleEvents.teamId, teamId), eq(mdScheduleEvents.trackId, e.trackId)))
          .orderBy(desc(mdScheduleEvents.eventDate))
          .limit(5)
      : []
    const weather = e.lat != null && e.lng != null ? await fetchEventWeather(e.lat, e.lng, e.eventDate) : null
    nextEvent = {
      title: e.title,
      type: e.eventType,
      date: e.eventDate,
      track: e.series ?? null,
      series: e.series ?? null,
      entryFeeDollars: centsToDollars(e.entryFeeCents),
      weather,
      priorFinishesHere: priors.map((p) => p.finish).filter((f): f is number => f != null),
    }
  }
  const upcomingEvents = upcoming.map((e) => ({ title: e.title, type: e.eventType, date: e.eventDate }))

  // Finances — season + last 30 days + by category
  const expenseRows = await db.select().from(mdExpenses).where(eq(mdExpenses.teamId, teamId))
  const byCategory: Record<string, number> = {}
  let seasonSpend = 0
  let last30 = 0
  for (const ex of expenseRows) {
    const dollars = centsToDollars(ex.amountCents)
    seasonSpend += dollars
    byCategory[ex.category] = (byCategory[ex.category] ?? 0) + dollars
    if (ex.expenseDate >= thirtyDaysAgo) last30 += dollars
  }

  // Sponsors
  const sponsorRows = await db.select().from(mdSponsors).where(eq(mdSponsors.teamId, teamId))
  let totalCash = 0
  let totalProduct = 0
  let outstanding = 0
  const activeSponsors: CoachContext['sponsors']['active'] = []
  for (const sp of sponsorRows) {
    const dollars = centsToDollars(sp.valueCents)
    if (sp.sponsorType === 'cash') totalCash += dollars
    else if (sp.sponsorType === 'product') totalProduct += dollars
    const deliverables = sp.deliverables ?? []
    outstanding += deliverables.length
    if (sp.status === 'active') {
      activeSponsors.push({ name: sp.sponsorName, type: sp.sponsorType, valueDollars: dollars, deliverables })
    }
  }

  // Readiness (latest)
  const [readinessRow] = await db
    .select()
    .from(mdRiderReadiness)
    .where(eq(mdRiderReadiness.teamId, teamId))
    .orderBy(desc(mdRiderReadiness.entryDate))
    .limit(1)
  const readiness = readinessRow
    ? {
        date: readinessRow.entryDate,
        sleepHours: num(readinessRow.sleepHours),
        hrv: readinessRow.hrv,
        restingHr: readinessRow.restingHr,
        energy: readinessRow.energy,
        fatigue: readinessRow.fatigue,
      }
    : null

  // Nutrition today (aggregate)
  const nutritionRows = await db
    .select()
    .from(mdNutritionLog)
    .where(and(eq(mdNutritionLog.teamId, teamId), eq(mdNutritionLog.logDate, today)))
  const nutritionToday = nutritionRows.reduce(
    (acc, r) => ({
      calories: acc.calories + (num(r.calories) ?? 0),
      proteinG: acc.proteinG + (num(r.proteinG) ?? 0),
      carbsG: acc.carbsG + (num(r.carbsG) ?? 0),
      fatG: acc.fatG + (num(r.fatG) ?? 0),
      waterMl: acc.waterMl + (r.waterMl ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, waterMl: 0 },
  )
  // Fold in today's hydration log water
  const hydrationRows = await db
    .select()
    .from(mdHydrationLog)
    .where(and(eq(mdHydrationLog.teamId, teamId), eq(mdHydrationLog.logDate, today)))
  for (const h of hydrationRows) nutritionToday.waterMl += h.waterConsumedMl ?? 0

  // Mental (latest)
  const [mentalRow] = await db
    .select()
    .from(mdMentalLog)
    .where(eq(mdMentalLog.teamId, teamId))
    .orderBy(desc(mdMentalLog.entryDate))
    .limit(1)
  const mental = mentalRow
    ? {
        date: mentalRow.entryDate,
        mood: mentalRow.mood,
        focus: mentalRow.focus,
        anxiety: mentalRow.anxiety,
        confidence: mentalRow.confidence,
        motivation: mentalRow.motivation,
      }
    : null

  // Active injuries
  const injuryRows = await db
    .select()
    .from(mdInjuries)
    .where(and(eq(mdInjuries.teamId, teamId), inArray(mdInjuries.status, ['active', 'recovering', 'monitoring'])))
  const activeInjuries = injuryRows.map((i) => ({
    region: i.bodyRegion,
    type: i.injuryType,
    severity: i.severity,
    isConcussion: i.isConcussion,
    rtrStage: i.rtrStage,
    status: i.status,
  }))

  // Latest completed video analysis
  const [videoRow] = await db
    .select()
    .from(mdVideoAnalyses)
    .where(and(eq(mdVideoAnalyses.teamId, teamId), eq(mdVideoAnalyses.status, 'complete')))
    .orderBy(desc(mdVideoAnalyses.createdAt))
    .limit(1)
  const latestVideo =
    videoRow?.analysis != null
      ? {
          summary: videoRow.analysis.summary,
          overallScore: videoRow.analysis.overallScore,
          topImprovements: (videoRow.analysis.improvements ?? []).slice(0, 3),
        }
      : null

  return {
    discipline: disciplineObj.id,
    disciplineLabel: disciplineObj.label,
    disciplineProtocol,
    fleet,
    specSheets,
    recentSessions,
    nextEvent,
    upcomingEvents,
    finances: {
      seasonSpendDollars: Math.round(seasonSpend * 100) / 100,
      byCategory,
      last30Dollars: Math.round(last30 * 100) / 100,
    },
    sponsors: {
      totalCashDollars: totalCash,
      totalProductDollars: totalProduct,
      outstandingDeliverables: outstanding,
      active: activeSponsors,
    },
    readiness,
    nutritionToday,
    mental,
    activeInjuries,
    latestVideo,
  }
}
