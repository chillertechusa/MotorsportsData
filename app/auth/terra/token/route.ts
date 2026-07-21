import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { code, state } = body

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }

  // Exchange authorization code for access token
  // In production, verify code and state, then return access_token
  
  return NextResponse.json({
    access_token: 'placeholder_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'placeholder_refresh_token',
  })
}
