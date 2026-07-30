import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { disconnectSquare, getSquareConnectionStatus } from '@/lib/md-square-connect'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSessionTeamId()
  if (!session.ok) return NextResponse.json({ error: session.error }, { status: session.status })
  const connection = await getSquareConnectionStatus(session.teamId)
  return NextResponse.json({ connected: connection?.status === 'active', connection })
}

export async function DELETE() {
  const session = await getSessionTeamId()
  if (!session.ok) return NextResponse.json({ error: session.error }, { status: session.status })
  await disconnectSquare(session.teamId)
  return NextResponse.json({ connected: false })
}
