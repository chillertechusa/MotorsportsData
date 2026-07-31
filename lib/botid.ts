import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

export async function blockAutomatedRequest(): Promise<NextResponse | null> {
  const verification = await checkBotId()

  if (!verification.isBot) return null

  return NextResponse.json(
    { error: 'Automated requests are not allowed for this operation.' },
    { status: 403 },
  )
}

export async function assertHumanRequest(): Promise<void> {
  const verification = await checkBotId()
  if (verification.isBot) throw new Error('Automated requests are not allowed for this operation.')
}
