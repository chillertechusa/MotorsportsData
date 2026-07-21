import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { getMdOwner } from '@/lib/md-owner-auth'
import { buildCeoSnapshot, snapshotToPrompt } from '@/lib/ceo-doctor'

// Best-of-the-best reasoning model. Owner-only + low-volume, so the platform
// absorbs the premium cost. Zero-config on the Vercel AI Gateway.
const CEO_DOCTOR_MODEL = 'anthropic/claude-opus-4.8'

const SYSTEM_PREAMBLE = `You are the CEO Doctor for Motorsport Data — a sharp, plain-spoken chief-of-staff to the founder/CEO.

Your job: answer the CEO's questions about the health of the business using ONLY the live platform snapshot provided below. The snapshot aggregates real data from the financial engine, the four Advisor agents (Growth, Revenue, Retention, Data-Asset), and the Sentinel Squad (security/consent/access/IP monitoring).

Rules:
- Ground every number in the snapshot. NEVER invent metrics, dollar figures, or counts. If the snapshot doesn't contain something, say so and suggest how to get it.
- Financial figures reflect REAL collected revenue from active Square subscriptions only; seeded/test teams are excluded. Today this is effectively $0 pre-launch, and it grows on the first real checkout. Be honest that the platform is pre-revenue and frame guidance toward getting the first real paying customers.
- Be direct and decisive — the CEO wants a clear read and a recommended move, not hedging. Think like an operator: what matters most right now, what to do about it.
- Connect the dots across systems (e.g. a retention risk signal + a churned Factory Rig = a revenue problem worth chasing).
- Keep answers tight: lead with the answer, then 2-4 crisp supporting points. Use short paragraphs or bullets. No filler.
- The CEO's north star: get to the top of the motorsport data category and stay there. Frame advice toward durable category ownership (data moat, team/franchise model, on-site command centers) when relevant.`

export async function POST(req: NextRequest) {
  const owner = await getMdOwner()
  if (!owner) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
    }

    const snapshot = await buildCeoSnapshot()
    const system = `${SYSTEM_PREAMBLE}\n\n${snapshotToPrompt(snapshot)}`

    const result = streamText({
      model: CEO_DOCTOR_MODEL,
      system,
      messages: messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      })),
      maxOutputTokens: 1200,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[v0] CEO Doctor error:', err)
    return new Response(
      JSON.stringify({ error: 'CEO Doctor failed', detail: err instanceof Error ? err.message : String(err) }),
      { status: 500 },
    )
  }
}

// Expose the current snapshot (for the console header cards) without the LLM.
export async function GET() {
  const owner = await getMdOwner()
  if (!owner) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    const snapshot = await buildCeoSnapshot()
    return Response.json(snapshot)
  } catch (err) {
    console.error('[v0] CEO Doctor snapshot error:', err)
    return new Response(JSON.stringify({ error: 'Snapshot failed' }), { status: 500 })
  }
}
