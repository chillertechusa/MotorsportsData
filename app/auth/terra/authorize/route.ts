import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 })
  }

  return NextResponse.json({
    status: 'authorized',
    code,
    state,
    message: 'User authorized. Exchange code for access token at /auth/terra/token',
  })
}
