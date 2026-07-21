import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token } = body

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // Revoke the access token
  return NextResponse.json({
    status: 'revoked',
    message: 'Access token revoked successfully',
  })
}
