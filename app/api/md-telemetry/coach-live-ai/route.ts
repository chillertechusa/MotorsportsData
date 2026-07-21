import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { getSessionTeamId } from '@/lib/md-auth'
import { logAICall } from '@/lib/ai-cost-logger'

interface CoachLiveAIRequest {
  liveSessionId: string
  question: string
  recentTelemetry?: {
    speed: number
    throttle: number
    brakePressure: number
    tirePressFront: number
    tirePressRear: number
    engineTempC: number
    engineRpmK: number
    gLateral: number
    gLongitudinal: number
  }
  bestLapTime?: number
  riderSkillLevel?: 'rookie' | 'intermediate' | 'advanced'
  trackConditions?: string
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CoachLiveAIRequest = await req.json()

    if (!body.liveSessionId || !body.question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build context from live telemetry data
    const telemetryContext =
      body.recentTelemetry &&
      `Current Live Data:
- Speed: ${body.recentTelemetry.speed} mph
- Throttle: ${body.recentTelemetry.throttle}%
- Brake Pressure: ${body.recentTelemetry.brakePressure}%
- Tire Pressure: Front ${body.recentTelemetry.tirePressFront} PSI, Rear ${body.recentTelemetry.tirePressRear} PSI
- Engine Temp: ${body.recentTelemetry.engineTempC}°C
- Engine RPM: ${(body.recentTelemetry.engineRpmK * 1000).toLocaleString()}
- Lateral G: ${body.recentTelemetry.gLateral.toFixed(2)} Gs
- Longitudinal G: ${body.recentTelemetry.gLongitudinal.toFixed(2)} Gs
${body.bestLapTime ? `\nBest Lap Time This Session: ${body.bestLapTime.toFixed(2)} seconds` : ''}`

    const systemPrompt = `You are a real-time motocross race coach analyzing live telemetry during a race or practice session.

${telemetryContext || 'No current telemetry data available.'}

${body.riderSkillLevel ? `Rider Skill Level: ${body.riderSkillLevel}` : ''}
${body.trackConditions ? `Track Conditions: ${body.trackConditions}` : ''}

Your role is to provide immediate, actionable coaching feedback based on:
1. Current lap-by-lap telemetry (speed profiles, braking points, throttle application)
2. Setup feedback (tire temperatures, suspension loads, pressure trends)
3. Technique optimization (racing line, body position, trail braking)
4. Fatigue detection (lap times degrading, inconsistent inputs)
5. Performance deltas (this lap vs. best lap, performance vs. teammates)

Always:
- Reference specific telemetry values and lap numbers when giving feedback
- Provide actionable next-lap coaching ("next lap, brake 50ft later into turn 3")
- Cite the data point you're seeing ("throttle chart shows you're losing 0.3s in the exit here")
- Keep responses concise for between-lap usage
- Prioritize the most impactful coaching point first

Do NOT provide generic advice. Everything must be grounded in the rider's actual data.`

    const TELEM_COACH_MODEL = 'google/gemini-2.5-flash'
    const t0 = Date.now()
    const result = streamText({
      model: TELEM_COACH_MODEL,
      system: systemPrompt,
      messages: [{ role: 'user', content: body.question }],
      onFinish: ({ usage, finishReason }) => {
        void logAICall({ route: 'md-telemetry/coach-live-ai', model: TELEM_COACH_MODEL, inputTokens: usage.promptTokens, outputTokens: usage.completionTokens, latencyMs: Date.now() - t0, finishReason, teamId: auth.teamId })
      },
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[coach-live-ai] error:', err)
    return NextResponse.json({ error: 'AI coaching failed' }, { status: 500 })
  }
}
