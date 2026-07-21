import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdChampionshipSeries, mdChampionshipStandings } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { eq, asc } from 'drizzle-orm'

// GET /api/md-standings?seriesId=... — fetch standings for a series
// GET /api/md-standings — fetch all series (+ standings) for the team
export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    const seriesId = req.nextUrl.searchParams.get('seriesId')

    if (seriesId) {
      // Verify series belongs to this team
      const [series] = await db
        .select()
        .from(mdChampionshipSeries)
        .where(eq(mdChampionshipSeries.id, seriesId))
        .limit(1)
      if (!series || series.teamId !== teamId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      const standings = await db
        .select()
        .from(mdChampionshipStandings)
        .where(eq(mdChampionshipStandings.seriesId, seriesId))
        .orderBy(asc(mdChampionshipStandings.rank))
      return NextResponse.json({ series, standings })
    }

    // Return all series for the team with their standings
    const allSeries = await db
      .select()
      .from(mdChampionshipSeries)
      .where(eq(mdChampionshipSeries.teamId, teamId))
      .orderBy(asc(mdChampionshipSeries.createdAt))

    const result = await Promise.all(
      allSeries.map(async (s) => {
        const standings = await db
          .select()
          .from(mdChampionshipStandings)
          .where(eq(mdChampionshipStandings.seriesId, s.id))
          .orderBy(asc(mdChampionshipStandings.rank))
        return { series: s, standings }
      })
    )

    return NextResponse.json({ series: result })
  } catch (err) {
    console.error('[md-standings] GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/md-standings — create or replace a full series + standings
export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    const body = await req.json()
    const { seriesId, seriesName, discipline, year, currentRound, totalRounds, standings } = body

    if (!standings || !Array.isArray(standings)) {
      return NextResponse.json({ error: 'standings[] required' }, { status: 400 })
    }
    // seriesName required only when creating a new series (no existing seriesId)
    if (!seriesId && !seriesName) {
      return NextResponse.json({ error: 'seriesName required for new series' }, { status: 400 })
    }

    let targetSeriesId = seriesId as string | undefined

    if (targetSeriesId) {
      // Update existing series metadata
      const [existing] = await db
        .select()
        .from(mdChampionshipSeries)
        .where(eq(mdChampionshipSeries.id, targetSeriesId))
        .limit(1)
      if (!existing || existing.teamId !== teamId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      await db
        .update(mdChampionshipSeries)
        .set({
          seriesName: seriesName ?? existing.seriesName,
          discipline: discipline ?? existing.discipline,
          year: year ?? existing.year,
          currentRound: currentRound ?? existing.currentRound,
          totalRounds: totalRounds ?? existing.totalRounds,
          updatedAt: new Date(),
        })
        .where(eq(mdChampionshipSeries.id, targetSeriesId))
      // Replace all standings
      await db.delete(mdChampionshipStandings).where(eq(mdChampionshipStandings.seriesId, targetSeriesId))
    } else {
      // Create new series
      const [newSeries] = await db
        .insert(mdChampionshipSeries)
        .values({ teamId, seriesName, discipline: discipline ?? 'supercross', year: year ?? new Date().getFullYear(), currentRound: currentRound ?? 1, totalRounds: totalRounds ?? 17 })
        .returning()
      targetSeriesId = newSeries.id
    }

    // Insert standings rows
    if (standings.length > 0) {
      await db.insert(mdChampionshipStandings).values(
        standings.map((s: { rank: number; riderName: string; riderNumber?: number; teamName?: string; points: number; lastResult?: string }) => ({
          seriesId: targetSeriesId!,
          rank: s.rank,
          riderName: s.riderName,
          riderNumber: s.riderNumber ?? null,
          teamName: s.teamName ?? null,
          points: s.points,
          lastResult: s.lastResult ?? null,
        }))
      )
    }

    return NextResponse.json({ success: true, seriesId: targetSeriesId })
  } catch (err) {
    console.error('[md-standings] POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/md-standings?seriesId=... — remove a series and all its standings
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    const seriesId = req.nextUrl.searchParams.get('seriesId')
    if (!seriesId) return NextResponse.json({ error: 'seriesId required' }, { status: 400 })

    const [existing] = await db
      .select()
      .from(mdChampionshipSeries)
      .where(eq(mdChampionshipSeries.id, seriesId))
      .limit(1)
    if (!existing || existing.teamId !== teamId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.delete(mdChampionshipSeries).where(eq(mdChampionshipSeries.id, seriesId))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[md-standings] DELETE error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
