import { NextRequest, NextResponse } from 'next/server'
import { getRiderProfilesForCoach } from '@/lib/coach-queries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const riderEmail = searchParams.get('rider')
    const coachEmail = searchParams.get('coach')

    if (!riderEmail || !coachEmail) {
      return NextResponse.json({ error: 'Missing rider or coach email' }, { status: 400 })
    }

    const profiles = await getRiderProfilesForCoach(riderEmail, coachEmail)
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('[coach/rider-profiles] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}
