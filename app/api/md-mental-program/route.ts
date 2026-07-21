import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { isFactoryTier } from '@/lib/md-tiers'
import { db } from '@/lib/db'
import { mdTeams, mdMentalLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  // Load team tier
  const team = await db.query.mdTeams.findFirst({
    where: eq(mdTeams.id, auth.teamId),
    columns: { subscriptionTier: true },
  })
  if (!isFactoryTier(team?.subscriptionTier ?? null)) {
    return NextResponse.json({ error: 'Factory Rig tier required' }, { status: 403 })
  }

  // Pull last 14 days of mental logs as context
  const logs = await db
    .select()
    .from(mdMentalLog)
    .where(eq(mdMentalLog.teamId, auth.teamId))
    .orderBy(desc(mdMentalLog.entryDate))
    .limit(14)

  const { focus_area } = await req.json() as { focus_area?: string }

  const avgMood = avg(logs.map(l => l.mood))
  const avgAnxiety = avg(logs.map(l => l.anxiety))
  const avgConfidence = avg(logs.map(l => l.confidence))
  const avgFocus = avg(logs.map(l => l.focus))
  const avgMotivation = avg(logs.map(l => l.motivation))

  const prompt = `You are a motorsports mental performance coach specialising in motocross and off-road racing.

Based on the rider's recent 14-day mental metrics:
- Mood avg: ${avgMood}/10
- Anxiety avg: ${avgAnxiety}/10 (lower is better)
- Confidence avg: ${avgConfidence}/10
- Focus avg: ${avgFocus}/10
- Motivation avg: ${avgMotivation}/10
${focus_area ? `\nRider-requested focus area: ${focus_area}` : ''}

Deliver a concise 7-day mental performance program. Structure it exactly as:

## Overview
2-3 sentences on the rider's current mental state and what this program targets.

## Daily Practices (7 days)
For each day list: Day N — [morning routine / technique / drill] (2-3 sentences max per day).

## Race Day Protocol
A tight 5-step pre-gate mental routine (gate drop to focus state).

## Key Technique
One primary mental skill to drill this week with a 2-sentence explanation.

Keep it practical and dirt-specific. No generic sports psychology fluff.`

  // Stream from Vercel AI Gateway using fetch (no SDK dependency)
  const gatewayRes = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VERCEL_OIDC_TOKEN ?? ''}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      max_tokens: 900,
    }),
  })

  if (!gatewayRes.ok) {
    const err = await gatewayRes.text()
    return NextResponse.json({ error: `AI Gateway error: ${err}` }, { status: 502 })
  }

  const data = await gatewayRes.json() as { choices: { message: { content: string } }[] }
  const content = data.choices?.[0]?.message?.content ?? ''

  return NextResponse.json({ program: content })
}

function avg(nums: (number | null | undefined)[]): string {
  const valid = nums.filter((n): n is number => n != null)
  if (!valid.length) return 'N/A'
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1)
}
