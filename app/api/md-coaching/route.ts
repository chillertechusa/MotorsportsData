import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { logAICall } from '@/lib/ai-cost-logger'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs } from '@/lib/db/schema'
import { getSessionTeamId, assertVehicleOwnership, assertRaceTeamOrAbove } from '@/lib/md-auth'
import { checkRateLimit } from '@/lib/rate-limit'

const COACHING_MODEL = 'google/gemini-2.5-pro'

type Coaching = {
  overallRating: number
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
}

// Extract the first JSON object from a model response (handles ```json fences).
function parseCoaching(raw: string): Coaching | null {
  try {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonText = fenced ? fenced[1] : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    const parsed = JSON.parse(jsonText)
    const clampRating = Math.max(0, Math.min(10, Number(parsed.overallRating) || 0))
    const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 5) : [])
    return {
      overallRating: clampRating,
      strengths: arr(parsed.strengths),
      improvements: arr(parsed.improvements),
      nextSteps: arr(parsed.nextSteps),
    }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  // Paywall — coaching AI is a Race Team+ feature.
  const allowed = await assertRaceTeamOrAbove(authResult.teamId)
  if (!allowed) {
    return NextResponse.json({ error: 'RACE_TEAM_TIER_REQUIRED' }, { status: 403 })
  }

  const rl = checkRateLimit(`md-coaching:${authResult.teamId}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  try {
    const body = await req.json()
    const { sessionId, vehicleId } = body as { sessionId?: string; vehicleId?: string }

    if (!sessionId || !vehicleId) {
      return NextResponse.json({ error: 'sessionId and vehicleId are required' }, { status: 400 })
    }

    // Ownership: the vehicle must belong to the team.
    const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
    if (!owned) {
      return NextResponse.json({ error: 'Vehicle does not belong to your team.' }, { status: 403 })
    }

    const [session] = await db.select().from(mdSessions).where(eq(mdSessions.id, sessionId)).limit(1)
    if (!session || session.vehicleId !== vehicleId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const setupLogs = await db
      .select({ parameterKey: mdSetupLogs.parameterKey, parameterValue: mdSetupLogs.parameterValue })
      .from(mdSetupLogs)
      .where(eq(mdSetupLogs.sessionId, sessionId))

    const setupSummary = setupLogs.map((s) => `${s.parameterKey}: ${s.parameterValue}`).join('\n')
    const lapLine =
      typeof session.bestLapSeconds === 'number' ? `\n- Best lap: ${session.bestLapSeconds.toFixed(1)}s` : ''

    const system = `You are an expert motocross/dirt bike coach. Analyze the rider's session and respond with ONLY a JSON object (no prose, no markdown fences) in exactly this shape:
{"overallRating": <number 0-10>, "strengths": [<2-5 strings>], "improvements": [<2-5 strings>], "nextSteps": [<2-5 strings>]}
Be encouraging but honest. Focus on actionable advice.`

    const prompt = `Session Data:
- Track: ${session.trackName}
- Conditions: ${session.trackConditions || 'Unknown'}
- Rider feedback: "${session.riderFeedback || 'No feedback provided'}"${lapLine}
- Setup used:
${setupSummary || 'No setup data recorded'}`

    const t0 = Date.now()
    const result = await generateText({ model: COACHING_MODEL, system, prompt })
    void logAICall({ route: 'md-coaching', model: COACHING_MODEL, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, latencyMs: Date.now() - t0, finishReason: result.finishReason, teamId: authResult.teamId })
    const coaching = parseCoaching(result.text)

    if (!coaching) {
      return NextResponse.json({ error: 'Could not generate coaching analysis. Please try again.' }, { status: 502 })
    }

    return NextResponse.json(coaching)
  } catch (e) {
    console.error('[md-coaching] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
