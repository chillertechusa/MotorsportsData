import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { appBaseUrl, exchangeSquareCode, saveSquareConnection, verifyOAuthState } from '@/lib/md-square-connect'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sponsorsUrl = new URL('/data/team/sponsors', appBaseUrl())
  try {
    const denied = request.nextUrl.searchParams.get('error')
    if (denied) {
      sponsorsUrl.searchParams.set('square', 'denied')
      return NextResponse.redirect(sponsorsUrl)
    }
    const code = request.nextUrl.searchParams.get('code')
    const stateValue = request.nextUrl.searchParams.get('state')
    if (!code || !stateValue) throw new Error('Square callback is missing code or state')

    const session = await getSessionTeamId()
    if (!session.ok) {
      return NextResponse.redirect(new URL('/auth/sign-in?next=/data/team/sponsors', appBaseUrl()))
    }
    const state = verifyOAuthState(stateValue)
    if (state.teamId !== session.teamId || state.userId !== session.userId) {
      throw new Error('Square connection does not match the signed-in household')
    }

    const token = await exchangeSquareCode(code)
    await saveSquareConnection(session.teamId, token)
    sponsorsUrl.searchParams.set('square', 'connected')
    return NextResponse.redirect(sponsorsUrl)
  } catch (error) {
    console.error('[v0] Square OAuth callback failed:', error)
    sponsorsUrl.searchParams.set('square', 'failed')
    return NextResponse.redirect(sponsorsUrl)
  }
}
