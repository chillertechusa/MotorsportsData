import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { and, eq, desc, inArray } from 'drizzle-orm'
import { logAICall } from '@/lib/ai-cost-logger'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles } from '@/lib/db/schema'
import { getSessionTeamId, assertVehicleOwnership, assertRaceTeamOrAbove } from '@/lib/md-auth'
import { getSpecByKey, buildSpecGroundingText } from '@/lib/md-specs/index'
import { checkRateLimit } from '@/lib/rate-limit'

// Google models are zero-config through the Vercel AI Gateway (no API key needed).
const SETUP_AI_MODEL = 'google/gemini-2.5-pro'

export async function POST(req: Request) {
  // Auth — resolve team.
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  // Paywall — AI setup advisor is a Race Team+ feature.
  const allowed = await assertRaceTeamOrAbove(authResult.teamId)
  if (!allowed) {
    return NextResponse.json({ error: 'RACE_TEAM_TIER_REQUIRED' }, { status: 403 })
  }

  // Rate limit — Gemini 2.5 Pro is expensive.
  const rl = checkRateLimit(`md-setup-ai:${authResult.teamId}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending another message.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  try {
    const body = await req.json()
    const { vehicleId, message, conversationHistory } = body as {
      vehicleId?: string
      message?: string
      conversationHistory?: { role: string; content: string }[]
    }

    if (!vehicleId || !message?.trim()) {
      return NextResponse.json({ error: 'vehicleId and message are required' }, { status: 400 })
    }

    // Prevent cross-team data access.
    const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
    if (!owned) {
      return NextResponse.json({ error: 'Vehicle does not belong to your team.' }, { status: 403 })
    }

    // Pull recent sessions for this vehicle, then their setup logs in one query.
    const sessions = await db
      .select({ id: mdSessions.id })
      .from(mdSessions)
      .where(eq(mdSessions.vehicleId, vehicleId))
      .orderBy(desc(mdSessions.createdAt))
      .limit(25)

    const sessionIds = sessions.map((s) => s.id)
    let historicalSetups = ''
    if (sessionIds.length > 0) {
      const setupLogs = await db
        .select({ parameterKey: mdSetupLogs.parameterKey, parameterValue: mdSetupLogs.parameterValue })
        .from(mdSetupLogs)
        .where(inArray(mdSetupLogs.sessionId, sessionIds))

      const grouped = new Map<string, string[]>()
      for (const log of setupLogs) {
        if (!grouped.has(log.parameterKey)) grouped.set(log.parameterKey, [])
        grouped.get(log.parameterKey)!.push(log.parameterValue)
      }
      historicalSetups = Array.from(grouped.entries())
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('\n')
    }

    // OEM spec grounding from the vehicle's spec_key.
    let specGrounding = ''
    const [vehicle] = await db
      .select({ specKey: mdVehicles.specKey })
      .from(mdVehicles)
      .where(and(eq(mdVehicles.id, vehicleId), eq(mdVehicles.teamId, authResult.teamId)))
      .limit(1)
    if (vehicle?.specKey) {
      const spec = getSpecByKey(vehicle.specKey)
      if (spec) specGrounding = `\n\nOEM SPEC BOOK (authoritative baseline values):\n${buildSpecGroundingText(spec)}`
    }

    const system = `You are an expert motorcycle suspension tuning advisor for dirt bikes and motocross.

HISTORICAL SETUP DATA FOR THIS VEHICLE:
${historicalSetups || 'No historical setup data logged yet.'}${specGrounding}

Guidelines:
- Provide specific, actionable suspension setup recommendations.
- Consider track conditions (sand, clay, hard pack, mud).
- Reference standard components (forks, shocks, springs, clickers).
- Give adjustments in concrete terms (clicks, spring rates, PSI, sag mm).
- Be concise and practical. Never exceed 200 words per response.
- Prefer the OEM spec book values as the baseline when available.`

    const messages = [
      ...(conversationHistory ?? []).map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      })),
      { role: 'user' as const, content: message.trim() },
    ]

    const t0 = Date.now()
    const { text, usage, finishReason } = await generateText({ model: SETUP_AI_MODEL, system, messages })
    void logAICall({ route: 'md-setup-ai', model: SETUP_AI_MODEL, inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0, latencyMs: Date.now() - t0, finishReason, teamId: authResult.teamId })

    return NextResponse.json({ recommendation: text })
  } catch (e) {
    console.error('[md-setup-ai] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
