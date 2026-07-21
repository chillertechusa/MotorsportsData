import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdTeamAnalytics } from '@/lib/db/schema'
import { desc, eq, gte } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weeks = parseInt(searchParams.get('weeks') || '12')

    // Get team analytics for last N weeks
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - weeks * 7)

    const trends = await db
      .select()
      .from(mdTeamAnalytics)
      .where(
        eq(mdTeamAnalytics.teamId, auth.teamId) &&
        gte(mdTeamAnalytics.weekStart, eightWeeksAgo)
      )
      .orderBy(desc(mdTeamAnalytics.weekStart))

    return NextResponse.json({
      teamId: auth.teamId,
      weeksTrendedBack: weeks,
      data: trends.map(row => ({
        weekStart: row.weekStart?.toISOString(),
        sessionCount: row.sessionCount,
        avgBestLap: row.avgBestLap,
        fastestRider: row.fastestRider,
        fastestLapOverall: row.fastestLapOverall,
        mostImproving: row.mostImproving,
        avgReadiness: row.avgReadiness,
        setupChanges: row.setupChanges,
      })),
    })
  } catch (err) {
    console.error('[v0] Team trends error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch team trends' },
      { status: 500 }
    )
  }
}
