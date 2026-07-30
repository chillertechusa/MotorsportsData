import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { getSquareAuthorizeUrl } from '@/lib/md-square-connect'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSessionTeamId()
    if (!session) {
      return NextResponse.redirect(new URL('/data/sign-in?next=/data/team/sponsors', 'http://localhost'))
    }
    const url = getSquareAuthorizeUrl(session.teamId, session.userId)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('[v0] Square connect failed:', error)
    const message = error instanceof Error ? error.message : 'Unable to connect Square'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
