import { NextResponse } from 'next/server'
import { getMdOwner } from '@/lib/md-owner-auth'

// Expose the raw send so we can hit it directly from this route.
// We duplicate the minimal logic here so we can surface the exact
// Resend status code + body back to the UI for debugging.
export async function POST(req: Request) {
  const owner = await getMdOwner()
  if (!owner) return NextResponse.json({ ok: false, error: 'Not authorized' }, { status: 403 })

  const apiKey = process.env.RESEND_API_KEY
  const from   = process.env.RESEND_FROM_EMAIL

  if (!apiKey) return NextResponse.json({ ok: false, error: 'RESEND_API_KEY is not set' }, { status: 500 })
  if (!from)   return NextResponse.json({ ok: false, error: 'RESEND_FROM_EMAIL is not set' }, { status: 500 })

  const to = owner.email
  const fromFormatted = from.includes('<') ? from : `Motorsports Dirt <${from}>`

  let resendStatus: number | null = null
  let resendBody = ''

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromFormatted,
        to:   [to],
        subject: 'Motorsports Dirt — Resend test',
        html: `<div style="background:#09090b;color:#a3e635;padding:32px;font-family:monospace;border-radius:12px;">
          <p style="font-size:18px;font-weight:700;">Resend is working.</p>
          <p style="color:#d4d4d8;font-size:14px;">This test was fired from the Motorsports Data owner console.<br/>
          API key: ${apiKey.slice(0,8)}… &nbsp; From: ${from}</p>
        </div>`,
        text: `Resend is working. API key: ${apiKey.slice(0,8)}… From: ${from}`,
      }),
    })
    resendStatus = res.status
    resendBody   = await res.text().catch(() => '')

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `Resend returned ${res.status}`,
        detail: resendBody.slice(0, 400),
        apiKeyPrefix: apiKey.slice(0, 8) + '…',
        from,
        to,
      }, { status: 200 }) // 200 so the client always reads the body
    }

    return NextResponse.json({
      ok: true,
      to,
      from,
      apiKeyPrefix: apiKey.slice(0, 8) + '…',
      resendId: JSON.parse(resendBody)?.id ?? null,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      apiKeyPrefix: apiKey.slice(0, 8) + '…',
      from,
      to,
    })
  }
}
