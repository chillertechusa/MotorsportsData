import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  // Fetch the full session + vehicle, verify team ownership
  const [row] = await db
    .select({
      session: mdSessions,
      vehicle: { name: mdVehicles.name, type: mdVehicles.type, specKey: mdVehicles.specKey },
    })
    .from(mdSessions)
    .innerJoin(mdVehicles, eq(mdSessions.vehicleId, mdVehicles.id))
    .where(and(eq(mdSessions.id, sessionId), eq(mdVehicles.teamId, authResult.teamId)))
    .limit(1)

  if (!row) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const suspensionLogs = await db
    .select({ key: mdSetupLogs.parameterKey, value: mdSetupLogs.parameterValue })
    .from(mdSetupLogs)
    .where(eq(mdSetupLogs.sessionId, sessionId))

  const { session, vehicle } = row
  const s = session

  const sheetSummary = [
    `Bike: ${vehicle.name} (${vehicle.type})`,
    `Track: ${s.trackName}`,
    `Date: ${s.sessionDate ?? 'not recorded'}`,
    `Track surface: ${s.trackSurface ?? 'not recorded'}`,
    ``,
    `WEATHER`,
    `Temperature: ${s.ambientTempF != null ? `${s.ambientTempF}°F` : 'not recorded'}`,
    `Humidity: ${s.humidityPct != null ? `${s.humidityPct}%` : 'not recorded'}`,
    `Wind: ${s.windMph != null ? `${s.windMph} mph` : 'not recorded'}`,
    ``,
    `TIRES`,
    `Front: ${s.tireFront ?? 'not recorded'} @ ${s.tirePressureFront != null ? `${s.tirePressureFront} psi` : '? psi'}`,
    `Rear: ${s.tireRear ?? 'not recorded'} @ ${s.tirePressureRear != null ? `${s.tirePressureRear} psi` : '? psi'}`,
    ``,
    `ENGINE / JETTING`,
    `Fuel mix: ${s.fuelMix ?? 'not recorded'}`,
    `Jet needle: ${s.jetNeedle ?? 'not recorded'}`,
    `Air filter: ${s.airFilterCondition ?? 'not recorded'}`,
    `Engine map: ${s.engineMap ?? 'not recorded'}`,
    ``,
    `SUSPENSION`,
    suspensionLogs.length
      ? suspensionLogs.map((l) => `${l.key}: ${l.value}`).join('\n')
      : 'No suspension data logged',
    ``,
    `RIDER FEEDBACK`,
    s.riderFeedback ?? 'No feedback recorded',
  ].join('\n')

  const { text } = await generateText({
    model: 'google/gemini-2.5-pro',
    prompt: `You are a world-class motocross setup engineer and race coach. A rider has submitted a setup sheet from today's session. Analyze it and provide specific, actionable recommendations for their NEXT session at this track.

Temperature affects jetting significantly — hot weather (above 85°F) requires richer jetting; cold weather (below 55°F) requires leaner. High humidity also affects jetting. Always account for weather conditions in your analysis.

SETUP SHEET:
${sheetSummary}

Respond with a JSON object in this exact format:
{
  "summary": "2-3 sentence overview of the session setup quality",
  "weatherImpact": "How today's weather conditions affected performance and what it means for jetting/suspension",
  "suspensionRecommendations": ["specific actionable change 1", "specific actionable change 2", "..."],
  "jettigRecommendations": ["jetting change 1", "..."],
  "tireRecommendations": ["tire/pressure change 1", "..."],
  "priorityAction": "The single most important thing to change before next session",
  "confidenceScore": 85
}

Only return valid JSON. No markdown code fences.`,
  })

  try {
    const recommendation = JSON.parse(text)
    return NextResponse.json({ success: true, recommendation })
  } catch {
    return NextResponse.json({ success: true, recommendation: { summary: text } })
  }
}
