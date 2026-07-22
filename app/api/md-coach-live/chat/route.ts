import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { generateText } from 'ai'
import { logAICall } from '@/lib/ai-cost-logger'

interface CoachChatRequest {
  liveSessionId: string
  question: string
  riderName: string
}

/** Real-time coach AI endpoint — Claude AI grounded in live telemetry context */
export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { liveSessionId, question, riderName }: CoachChatRequest = await req.json()

    // Fetch live session
    const session = await db
      .select()
      .from(mdLiveSessions)
      .where(eq(mdLiveSessions.id, liveSessionId))
      .then((r) => r[0])

    if (!session || session.teamId !== auth.teamId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch last 50 telemetry points as context
    const recentTelemetry = await db
      .select()
      .from(mdLiveTelemetry)
      .where(eq(mdLiveTelemetry.liveSessionId, liveSessionId))
      .orderBy(desc(mdLiveTelemetry.createdAt))
      .limit(50)

    // Build context from telemetry
    const latestPoint = recentTelemetry[0]
    const avgSpeed = recentTelemetry.reduce((sum, p) => sum + p.speed, 0) / recentTelemetry.length
    const avgThrottle =
      recentTelemetry.reduce((sum, p) => sum + (p.throttle || 0), 0) /
      recentTelemetry.length
    const maxEngineTemp = Math.max(...recentTelemetry.map((p) => p.engineTempC || 0))

    const telemetryContext = `
Current Lap: ${session.currentLap}
Rider: ${riderName}
Best Lap: ${session.bestLapSeconds?.toFixed(2) || 'N/A'}s
Current Speed: ${latestPoint?.speed || 0} mph
Average Speed: ${avgSpeed.toFixed(1)} mph
Throttle Position: ${(avgThrottle * 100).toFixed(0)}%
Engine Temp: ${latestPoint?.engineTempC || 0}°C (max recent: ${maxEngineTemp}°C)
Brake Pressure: ${latestPoint?.brakePressure || 0} psi
Tire Pressure F: ${latestPoint?.tirePressFront || 0} psi
Tire Pressure R: ${latestPoint?.tirePressRear || 0} psi
Recent Lap Count: ${recentTelemetry.length} points logged`

    const systemPrompt = `You are a professional motorsports coach AI. You have access to real-time telemetry data and you provide specific, actionable coaching advice based on the current session data.

Telemetry Context:
${telemetryContext}

You should:
1. Ask clarifying questions if needed
2. Reference specific telemetry values when making recommendations
3. Provide setup, driving technique, or strategy advice based on the data
4. Be concise and direct (1-2 sentences max)
5. Prioritize immediate safety and performance concerns`

    const MODEL = 'google/gemini-2.5-flash'
    const t0 = Date.now()
    const { text, usage, finishReason } = await generateText({
      model: MODEL,
      system: systemPrompt,
      prompt: question,
      temperature: 0.7,
      maxOutputTokens: 200,
    })
    void logAICall({ route: 'md-coach-live/chat', model: MODEL, inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0, latencyMs: Date.now() - t0, finishReason, teamId: auth.teamId })

    return NextResponse.json({
      ok: true,
      recommendation: text,
      sessionData: {
        currentLap: session.currentLap,
        bestLap: session.bestLapSeconds,
        currentSpeed: latestPoint?.speed,
        engineTemp: latestPoint?.engineTempC,
      },
    })
  } catch (error) {
    console.error('[Coach Live Chat] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate coaching response' },
      { status: 500 }
    )
  }
}
