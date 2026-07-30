import { NextRequest, NextResponse } from 'next/server'
import { getRiderRacesForCoach } from '@/lib/coach-queries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const riderEmail = searchParams.get('rider')
    const coachEmail = searchParams.get('coach')

    if (!riderEmail || !coachEmail) {
      return NextResponse.json({ error: 'Missing rider or coach email' }, { status: 400 })
    }

    const races = await getRiderRacesForCoach(riderEmail, coachEmail)
    return NextResponse.json(races)
  } catch (error) {
    console.error('[coach/rider-races] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch races' }, { status: 500 })
  }
}
