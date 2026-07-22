import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { getSessionTeamId } from '@/lib/md-auth'
import { logAICall } from '@/lib/ai-cost-logger'
import { fetchContextBrief } from '@/lib/md-mechanic-context'

/**
 * POST /api/md-mechanic/setup-coach
 * Streams Claude Opus coaching on setup optimization for mechanics.
 * Uses context from suspension history, tire pressure changes, and performance deltas.
 * Focuses on: suspension tuning, tire pressure strategy, weight distribution optimization.
 */
export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { message, vehicleId } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Fetch mechanic context (setup history, performance data)
    const context = await fetchContextBrief(auth.teamId)

    // Build system prompt for mechanic setup coaching
    const systemPrompt = `You are an elite motocross setup coach assistant for mechanics. You provide expert guidance on:
- Suspension tuning (spring rates, damping adjustments, compression, rebound)
- Tire pressure optimization (pressure ranges per track conditions, performance correlation)
- Weight distribution and bike geometry (CG height, rake angle, wheelbase balance)
- Setup strategy based on rider feedback, telemetry, and lap-time deltas

Context you have access to:
- Recent setup changes this mechanic has made
- Vehicle performance trends before/after changes
- Rider performance metrics and readiness status

When responding:
1. Acknowledge the mechanic's current setup or question
2. Provide specific, actionable tuning recommendations
3. Explain the mechanical principle behind each change
4. Predict lap-time improvement potential based on changes
5. Ask clarifying questions about track conditions, rider feedback, or vehicle behavior

Never make up specific products or part numbers. Reference general categories (e.g., "softer compression spring" not "YSS Spring Model X").
Focus on correlating setup changes to measurable performance improvements (lap times, rider confidence, track feedback).

Setup history this session: ${JSON.stringify(context.recentSetups?.slice(0, 3))}
Vehicle performance baseline: ${JSON.stringify(context.metrics)}`

    // Stream the response using Claude Opus via AI Gateway
    const SETUP_COACH_MODEL = 'google/gemini-2.5-flash'
    const t0 = Date.now()
    const result = streamText({
      model: SETUP_COACH_MODEL,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      onFinish: ({ usage, finishReason }) => {
        void logAICall({ route: 'md-mechanic/setup-coach', model: SETUP_COACH_MODEL, inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0, latencyMs: Date.now() - t0, finishReason, teamId: auth.teamId })
      },
    })

    // Return the streamed response
    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[md-mechanic/setup-coach] error:', err)
    return NextResponse.json({ error: 'Setup coaching failed' }, { status: 500 })
  }
}
