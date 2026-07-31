import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { appBaseUrl, getSquareAuthorizeUrl } from '@/lib/md-square-connect'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSessionTeamId()
    if (!session.ok) {
      return NextResponse.redirect(new URL('/auth/sign-in?next=/data/team/sponsors', appBaseUrl()))
    }
    const url = getSquareAuthorizeUrl(session.teamId, session.userId)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('[v0] Square connect failed:', error)
    const message = error instanceof Error ? error.message : 'Unable to connect Square'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
