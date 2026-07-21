import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
// @ts-ignore - pdfkit lacks type definitions
import PDFDocument from 'pdfkit'

interface AnalyticsPDFData {
  teamName: string
  periodStart: string
  periodEnd: string
  summary: {
    totalSessions: number
    avgBestLap: number
    fastestLap: number
    fastestRider: string
    mostImproving: string
    avgReadiness: number
  }
  riders: Array<{
    name: string
    sessionsLogged: number
    bestLap: number
    improvement: number
    readiness: number
  }>
  setupChanges: number
  readinessAccuracy: number
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: AnalyticsPDFData = await req.json()

    // Create PDF document
    // @ts-ignore - pdfkit constructor
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    // Collect PDF data
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => {
      // PDF generation complete
    })

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Team Analytics Report', { align: 'center' })
    doc.fontSize(10).fillColor('#71717a').text('Motorsport Data Performance Analysis', { align: 'center' })
    doc.moveDown(0.5)

    // Team & Period Info
    doc
      .fontSize(11)
      .fillColor('#000000')
      .text(`Team: ${data.teamName}`)
      .text(`Period: ${data.periodStart} to ${data.periodEnd}`)
      .text(`Generated: ${new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`)
    doc.moveDown(1)

    // Key Metrics Summary
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Performance Summary')
    doc.fontSize(10).fillColor('#71717a')
    doc.moveDown(0.3)

    const metricsY = doc.y
    doc
      .text(`Total Sessions: ${data.summary.totalSessions}`, 50)
      .text(`Avg Best Lap: ${data.summary.avgBestLap.toFixed(2)}s`, 50)
      .text(`Fastest Lap: ${data.summary.fastestLap.toFixed(2)}s`, 50)

    doc.y = metricsY
    doc
      .text(`Fastest Rider: ${data.summary.fastestRider}`, 300)
      .text(`Most Improving: ${data.summary.mostImproving}`, 300)
      .text(`Avg Readiness: ${data.summary.avgReadiness.toFixed(0)}%`, 300)

    doc.moveDown(1.5)

    // Rider Performance Table
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Rider Performance')
    doc.fontSize(9).fillColor('#71717a').moveDown(0.5)

    // Table headers
    const tableX = 50
    const col1 = tableX
    const col2 = tableX + 100
    const col3 = tableX + 170
    const col4 = tableX + 240
    const col5 = tableX + 310

    doc.text('Rider', col1, doc.y, { width: 90 })
    doc.text('Sessions', col2, doc.y, { width: 60 })
    doc.text('Best Lap', col3, doc.y, { width: 60 })
    doc.text('Improve', col4, doc.y, { width: 60 })
    doc.text('Ready', col5, doc.y, { width: 50 })
    doc.moveDown(0.5)

    // Table rows
    doc.strokeColor('#d4d4d8').moveTo(col1, doc.y).lineTo(col5 + 50, doc.y).stroke()
    doc.moveDown(0.3)

    data.riders.forEach((rider) => {
      doc.fontSize(9).fillColor('#27272a')
      doc.text(rider.name, col1, doc.y, { width: 90 })
      doc.text(rider.sessionsLogged.toString(), col2, doc.y, { width: 60 })
      doc.text(`${rider.bestLap.toFixed(2)}s`, col3, doc.y, { width: 60 })
      doc.text(`${rider.improvement > 0 ? '+' : ''}${rider.improvement.toFixed(2)}s`, col4, doc.y, { width: 60 })
      doc.text(`${rider.readiness.toFixed(0)}%`, col5, doc.y, { width: 50 })
      doc.moveDown(0.4)
    })

    doc.moveDown(0.5)

    // Setup & Coaching Metrics
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Coaching Effectiveness')
    doc.fontSize(10).fillColor('#71717a').moveDown(0.5)

    doc.text(`Setup Changes This Period: ${data.setupChanges}`)
    doc.text(`Readiness Prediction Accuracy: ${data.readinessAccuracy.toFixed(1)}%`)
    doc.moveDown(1)

    // Footer
    doc.fontSize(8).fillColor('#a1a1aa').text('This report is confidential and intended for team use only.', { align: 'center' })
    doc.text('Motorsport Data — www.motorsportsdata.io', { align: 'center' })

    // Finalize PDF
    doc.end()

    // Wait for all data to be written
    await new Promise<void>((resolve) => {
      doc.on('finish', () => resolve())
    })

    const buffer = Buffer.concat(chunks)

    // Return PDF as file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[v0] Analytics PDF export error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
