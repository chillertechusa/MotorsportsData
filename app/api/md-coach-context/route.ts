import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { buildCoachContext } from '@/lib/md-coach-context'

/**
 * GET /api/md-coach-context
 * Returns a human-readable summary of what the AI coach has access to for this team.
 * Used to render the "what I know about you" brief before the chat.
 */
export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const ctx = await buildCoachContext(auth.teamId)

    // Summarize into friendly cards the UI can display
    const summary = {
      fleet: ctx.fleet.map(v => v.name),
      sessionCount: ctx.recentSessions.length,
      lastSessionTrack: ctx.recentSessions[0]?.track ?? null,
      nextEvent: ctx.nextEvent ? { title: ctx.nextEvent.title, date: ctx.nextEvent.date, type: ctx.nextEvent.type } : null,
      readiness: ctx.readiness ? {
        date: ctx.readiness.date,
        hrv: ctx.readiness.hrv,
        energy: ctx.readiness.energy,
        fatigue: ctx.readiness.fatigue,
      } : null,
      mental: ctx.mental ? {
        mood: ctx.mental.mood,
        confidence: ctx.mental.confidence,
        anxiety: ctx.mental.anxiety,
      } : null,
      seasonSpendDollars: ctx.finances.seasonSpendDollars,
      activeSponsors: ctx.sponsors.active.length,
      upcomingEventCount: ctx.upcomingEvents.length,
      hasNutrition: ctx.nutritionToday.calories > 0,
      injuryCount: ctx.activeInjuries.length,
    }

    return NextResponse.json({ success: true, summary })
  } catch (err) {
    console.error('[md-coach-context]', err)
    return NextResponse.json({ success: false, error: 'Failed to load context' }, { status: 500 })
  }
}
