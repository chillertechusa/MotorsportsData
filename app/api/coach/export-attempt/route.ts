import { NextRequest, NextResponse } from 'next/server'
import { logCoachExportAttempt } from '@/lib/coach-queries'

export async function POST(req: NextRequest) {
  try {
    const { riderEmail, coachEmail, reason } = await req.json()

    if (!riderEmail || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await logCoachExportAttempt(coachEmail || 'unknown', riderEmail, reason)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[coach/export-attempt] Error:', error)
    return NextResponse.json({ error: 'Failed to log export attempt' }, { status: 500 })
  }
}
