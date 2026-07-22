import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { logAICall } from '@/lib/ai-cost-logger'

const FEATURE_CONTEXT: Record<string, string> = {
  fitness: 'You are a fitness and readiness coach. Help the user understand their HRV, sleep, energy, and recovery metrics. Give actionable advice on training load and rest days. Keep responses concise (2–3 sentences max).',
  mental: 'You are a sports psychologist and mental performance coach. Help the user manage race anxiety, build confidence, and maintain mental edge. Keep responses concise (2–3 sentences max).',
  coach: 'You are a racing coach. Answer questions about setup, strategy, riding technique, and race planning. Keep responses concise (2–3 sentences max).',
  session: 'You are a session data analyst. Help riders understand session logs, lap times, and how to improve. Keep responses concise (2–3 sentences max).',
  setup: 'You are a suspension and setup expert. Answer questions about suspension, geometry, and tuning. Keep responses concise (2–3 sentences max).',
  parts: 'You are a parts and maintenance specialist. Help with inventory, maintenance, and component selection. Keep responses concise (2–3 sentences max).',
  spec: 'You are an OEM data specialist. Answer questions about bike specs and tech comparisons. Keep responses concise (2–3 sentences max).',
  schedule: 'You are a race calendar expert. Help with season planning, scheduling, and logistics. Keep responses concise (2–3 sentences max).',
  finances: 'You are a motorsports business advisor. Help track budgets, sponsorship, and expenses. Keep responses concise (2–3 sentences max).',
}

export async function POST(req: NextRequest) {
  try {
    const { feature, messages } = await req.json()

    if (!feature || !FEATURE_CONTEXT[feature]) {
      return new Response(JSON.stringify({ error: 'Invalid feature' }), { status: 400 })
    }

    const systemPrompt = FEATURE_CONTEXT[feature]

    const FCHAT_MODEL = 'google/gemini-2.5-flash'
    const t0 = Date.now()
    const stream = await streamText({
      model: FCHAT_MODEL,
      system: systemPrompt,
      messages: messages.map((m: { role: string; text: string }) => ({
        role: m.role,
        content: m.text,
      })),
      maxOutputTokens: 80,
      onFinish: ({ usage, finishReason }) => {
        void logAICall({ route: 'md-feature-chat', model: FCHAT_MODEL, inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0, latencyMs: Date.now() - t0, finishReason })
      },
    })

    return stream.toTextStreamResponse()
  } catch (err) {
    console.error('[v0] Feature chat error:', err)
    return new Response(JSON.stringify({ error: 'Chat failed' }), { status: 500 })
  }
}
