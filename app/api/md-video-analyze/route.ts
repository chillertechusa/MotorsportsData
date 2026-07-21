import { type NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { del } from '@vercel/blob'
import { getSessionTeamId, assertFactoryTier } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdVideoAnalyses } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const maxDuration = 120

const VIDEO_MODEL = 'google/gemini-2.5-flash'

const SYSTEM_PROMPT = `You are an elite motocross and supercross coach with 20+ years of experience coaching riders from amateur to pro level. You specialize in video analysis of riding technique, body position, cornering, jumping, braking, and racecraft.

Analyze the provided riding video and return a detailed coaching report as a JSON object with this exact structure:
{
  "summary": "2-3 sentence overall assessment of the rider",
  "coachingPoints": [
    {
      "timestamp": "0:00-0:15",
      "category": "Body Position | Cornering | Jumping | Braking | Acceleration | Racecraft | Bike Setup",
      "observation": "What you observed",
      "recommendation": "Specific actionable coaching cue"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overallScore": 75
}

Rules:
- Include 5-10 timestamped coaching points minimum
- Timestamps should reference actual visible moments in the video
- Categories must be one of the listed values
- overallScore is 0-100 based on overall technique for the apparent skill level
- Be specific and actionable — not generic. Reference actual moments you see.
- Focus on what will make the biggest performance difference
- Return ONLY the JSON object, no markdown fences`

export async function POST(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { teamId } = authResult
  const isFactory = await assertFactoryTier(teamId)
  if (!isFactory) {
    return NextResponse.json({ error: 'Factory Rig required for video analysis.' }, { status: 403 })
  }

  const body = await req.json()
  const { blobUrl, blobPathname, originalFilename, vehicleId, riderNotes } = body

  if (!blobUrl || !blobPathname) {
    return NextResponse.json({ error: 'Missing blobUrl or blobPathname' }, { status: 400 })
  }

  // Create the analysis record up front in 'processing' state.
  const [created] = await db
    .insert(mdVideoAnalyses)
    .values({
      teamId,
      blobUrl,
      blobPathname,
      originalFilename: originalFilename ?? null,
      vehicleId: vehicleId || null,
      riderNotes: riderNotes ?? null,
      status: 'processing',
    })
    .returning()
  const analysisId = created.id

  try {
    const prompt = riderNotes
      ? `Please analyze this motocross riding video. Rider notes: "${riderNotes}"`
      : 'Please analyze this motocross riding video and provide detailed coaching feedback.'

    const { text } = await generateText({
      model: VIDEO_MODEL,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: new URL(blobUrl),
              mediaType: 'video/mp4',
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()

    let parsed: {
      summary: string
      coachingPoints: { timestamp: string; category: string; observation: string; recommendation: string }[]
      strengths: string[]
      improvements: string[]
      overallScore: number
    } | null = null

    try {
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {
        summary: text.slice(0, 500),
        coachingPoints: [],
        strengths: [],
        improvements: [],
        overallScore: 0,
      }
    }

    const [updated] = await db
      .update(mdVideoAnalyses)
      .set({ analysis: parsed, status: 'complete' })
      .where(eq(mdVideoAnalyses.id, analysisId))
      .returning()

    return NextResponse.json({ success: true, analysis: updated })
  } catch (error) {
    console.error('[md-video-analyze] error:', error instanceof Error ? error.message : error)
    await db
      .update(mdVideoAnalyses)
      .set({ status: 'error' })
      .where(eq(mdVideoAnalyses.id, analysisId))
    return NextResponse.json({ error: 'Analysis failed.' }, { status: 500 })
  }
}

// GET — list analyses for the team
export async function GET(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const rows = await db
    .select()
    .from(mdVideoAnalyses)
    .where(eq(mdVideoAnalyses.teamId, teamId))
    .orderBy(mdVideoAnalyses.createdAt)

  return NextResponse.json(rows.reverse())
}

// DELETE — remove an analysis (team-scoped) and its blob
export async function DELETE(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const [row] = await db
    .delete(mdVideoAnalyses)
    .where(and(eq(mdVideoAnalyses.id, id), eq(mdVideoAnalyses.teamId, teamId)))
    .returning()

  if (row?.blobUrl) {
    try {
      await del(row.blobUrl)
    } catch {
      // Blob may already be gone — ignore.
    }
  }

  return NextResponse.json({ success: true })
}
