import { NextRequest, NextResponse } from 'next/server'
import { getRiderProfileForAgent } from '@/app/actions/agent-portal'
import { auth } from '@/lib/auth'
// @ts-ignore - pdfkit lacks type definitions
import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function fmtLap(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2)
  return m > 0 ? `${m}:${s.padStart(5, '0')}` : `${s}s`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params

    // Resolve the session from the request's OWN headers — `headers()` from
    // next/headers is unreliable inside route handlers (returns no cookie).
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Hard entitlement + consent gate (logs denials to the Access Sentinel).
    const result = await getRiderProfileForAgent(teamId, {
      userId: session.user.id,
      ipAddress: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    })
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 403 })
    }
    const { profile } = result
    const age = profile.riderBirthYear ? new Date().getFullYear() - profile.riderBirthYear : null

    // @ts-ignore - pdfkit constructor
    const doc = new PDFDocument({ size: 'A4', margin: 48 })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const LIME = '#65a30d'
    const DARK = '#18181b'
    const GRAY = '#71717a'

    // Header band
    doc.rect(0, 0, doc.page.width, 90).fill(DARK)
    doc.fillColor('#a3e635').fontSize(9).font('Helvetica-Bold')
      .text('MOTORSPORT DATA — RIDER PITCH SHEET', 48, 30, { characterSpacing: 2 })
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text(profile.riderName, 48, 46)
    doc.fillColor('#a1a1aa').fontSize(10).font('Helvetica')
      .text(
        [profile.riderClass, profile.discipline, age ? `Age ${age}` : null].filter(Boolean).join('  •  ') ||
          'Rider Profile',
        48,
        74,
      )

    doc.moveDown(4)
    let y = 120

    // Key stats row
    const stats = [
      { label: 'BEST LAP', value: fmtLap(profile.stats.bestLapSeconds) },
      { label: 'TRACKS', value: String(profile.stats.tracksRidden) },
      { label: 'SESSIONS', value: String(profile.stats.totalSessions) },
      { label: 'RIDE HOURS', value: String(profile.stats.totalSessionHours) },
    ]
    const colW = (doc.page.width - 96) / stats.length
    stats.forEach((s, i) => {
      const x = 48 + i * colW
      doc.fillColor(LIME).fontSize(20).font('Helvetica-Bold').text(s.value, x, y, { width: colW - 10 })
      doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold').text(s.label, x, y + 26, { width: colW - 10, characterSpacing: 1 })
    })
    y += 60

    doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor('#e4e4e7').stroke()
    y += 20

    // Equipment
    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('EQUIPMENT', 48, y, { characterSpacing: 1 })
    y += 20
    if (profile.vehicles.length === 0) {
      doc.fillColor(GRAY).fontSize(10).font('Helvetica').text('No vehicles on record.', 48, y)
      y += 18
    } else {
      profile.vehicles.forEach((v) => {
        doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(v.name, 48, y, { continued: true })
        doc.fillColor(GRAY).font('Helvetica').text(
          `   ${[v.type, v.discipline].filter(Boolean).join(' • ')}`,
        )
        y += 16
      })
    }
    y += 12

    // Recent sessions
    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold').text('RECENT SESSIONS', 48, y, { characterSpacing: 1 })
    y += 22

    const cols = [
      { key: 'track', label: 'TRACK', w: 180 },
      { key: 'date', label: 'DATE', w: 110 },
      { key: 'surface', label: 'SURFACE', w: 120 },
      { key: 'lap', label: 'BEST LAP', w: 90 },
    ]
    let cx = 48
    doc.fontSize(8).font('Helvetica-Bold').fillColor(GRAY)
    cols.forEach((c) => {
      doc.text(c.label, cx, y, { width: c.w, characterSpacing: 1 })
      cx += c.w
    })
    y += 14
    doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor('#e4e4e7').stroke()
    y += 8

    if (profile.recentSessions.length === 0) {
      doc.fillColor(GRAY).fontSize(10).font('Helvetica').text('No session history yet.', 48, y)
      y += 16
    } else {
      profile.recentSessions.forEach((s) => {
        cx = 48
        doc.fontSize(9).font('Helvetica').fillColor(DARK)
        doc.text(s.trackName || '—', cx, y, { width: cols[0].w })
        cx += cols[0].w
        doc.fillColor(GRAY).text(s.sessionDate || '—', cx, y, { width: cols[1].w })
        cx += cols[1].w
        doc.text([s.trackSurface, s.trackConditions].filter(Boolean).join(', ') || '—', cx, y, { width: cols[2].w })
        cx += cols[2].w
        doc.fillColor(LIME).font('Helvetica-Bold').text(fmtLap(s.bestLapSeconds), cx, y, { width: cols[3].w })
        y += 16
      })
    }

    // Footer
    const footY = doc.page.height - 60
    doc.moveTo(48, footY).lineTo(doc.page.width - 48, footY).strokeColor('#e4e4e7').stroke()
    doc.fillColor(GRAY).fontSize(7).font('Helvetica').text(
      `Generated by Motorsport Data on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. ` +
        'Shared with the rider\u2019s consent. Confidential \u2014 for authorized recipients only.',
      48,
      footY + 10,
      { width: doc.page.width - 96, align: 'center' },
    )

    doc.end()

    await new Promise<void>((resolve, reject) => {
      doc.on('end', resolve)
      doc.on('error', reject)
    })

    const pdf = Buffer.concat(chunks)
    const safeName = profile.riderName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pitch-${safeName}.pdf"`,
        'Content-Length': pdf.length.toString(),
      },
    })
  } catch (error) {
    console.error('[v0] Agent pitch PDF error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
