import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdTelemetryImports, mdTelemetryDevices } from '@/lib/db/schema'
import { parseFile } from '@/lib/telemetry/parsers'
import { mapSessionData, inferDeviceType } from '@/lib/telemetry/data-mapper'
import { eq } from 'drizzle-orm'
import { FileFormat, DeviceType } from '@/lib/telemetry/device-registry'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

/**
 * POST /api/md-telemetry/import
 * 
 * Upload and parse telemetry data from external devices.
 * Supports CSV, XML, GPX, FIT, TCX, and more.
 * 
 * Body:
 * - file: File (required) — telemetry data file
 * - deviceId: UUID (optional) — link to specific device; if omitted, auto-detect
 * - format: FileFormat (optional) — explicit format hint; if omitted, detect from file extension
 */
async function handler(req: NextRequest) {
  try {
    const authResult = await getSessionTeamId()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    const { teamId } = authResult

    const formData = await req.formData()
    const file = formData.get('file') as File
    const deviceIdParam = formData.get('deviceId') as string | null
    const formatParam = (formData.get('format') as string | null) as FileFormat | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Detect format from file extension if not provided
    let format = formatParam
    if (!format) {
      const ext = file.name.split('.').pop()?.toUpperCase()
      if (ext === 'CSV' || ext === 'XML' || ext === 'GPX' || ext === 'FIT' || ext === 'TCX' || ext === 'TXT') {
        format = ext as FileFormat
      } else {
        return NextResponse.json({ error: 'Unknown file format. Supported: CSV, XML, GPX, FIT, TCX, TXT' }, { status: 400 })
      }
    }

    // Read file content
    const content = await file.text()

    // Parse the file
    let parsedData
    try {
      parsedData = await parseFile(content, format)
    } catch (error) {
      return NextResponse.json({ error: `Parse error: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 400 })
    }

    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json({ error: 'No data extracted from file' }, { status: 400 })
    }

    // Validate device exists if provided
    if (deviceIdParam) {
      const device = await db.query.mdTelemetryDevices.findFirst({
        where: eq(mdTelemetryDevices.id, deviceIdParam),
      })
      if (!device || device.teamId !== teamId) {
        return NextResponse.json({ error: 'Device not found or unauthorized' }, { status: 404 })
      }
    }

    // Auto-detect device type from field names (if no explicit device linked)
    const rawFields = parsedData.length > 0 ? Object.keys(parsedData[0]) : []
    const inferredDeviceType = inferDeviceType(rawFields)

    // Map to canonical schema (device-aware unit normalization + field aliases)
    const canonicalData = mapSessionData(parsedData, undefined, inferredDeviceType)

    // Store import record
    const importRecord = await db.insert(mdTelemetryImports).values({
      teamId,
      deviceId: deviceIdParam as string | undefined,
      sourceBlobPathname: `telemetry/${teamId}/${Date.now()}-${file.name}`,
      fileFormat: format,
      parsedData: canonicalData as any,
      status: 'success',
    } as any).returning()

    return NextResponse.json({
      success: true,
      importId: importRecord[0]?.id,
      recordCount: parsedData.length,
      format,
      detectedDeviceType: inferredDeviceType,
      message: `Imported ${parsedData.length} records from ${file.name}`,
    })
  } catch (error) {
    console.error('[v0] Telemetry import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}

export const POST = withErrorTrackedRoute(handler, 'md-telemetry/import')
