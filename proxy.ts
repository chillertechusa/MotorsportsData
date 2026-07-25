import { NextRequest, NextResponse } from 'next/server'

const EXCLUSION_COOKIE = 'vercel_analytics_excluded'
const EXCLUDED_IP = '174.52.211.247'

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  response.cookies.set(EXCLUSION_COOKIE, clientIp === EXCLUDED_IP ? '1' : '', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: clientIp === EXCLUDED_IP ? 60 * 60 * 24 : 0,
  })

  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
