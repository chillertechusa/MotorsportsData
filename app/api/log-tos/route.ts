import { NextRequest, NextResponse } from 'next/server'
import { logTosAgreement, CURRENT_TOS_VERSION } from '@/lib/log-tos'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const userId: string | null = body.userId ?? null
    const userAgent = req.headers.get('user-agent')

    await logTosAgreement(userId, userAgent)

    return NextResponse.json({ ok: true, version: CURRENT_TOS_VERSION })
  } catch (err) {
    console.error('[api/log-tos] error:', err)
    // Always return 200 — TOS logging must never block UI flow
    return NextResponse.json({ ok: false })
  }
}
