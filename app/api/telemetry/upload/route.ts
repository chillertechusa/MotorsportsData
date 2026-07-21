import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTelemetryImports, mdTelemetryDevices, mdSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/telemetry/upload
 * Upload telemetry data from devices (MYLAPSTR2, RaceBox, Garmin, Apple Watch)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const sessionId = formData.get('sessionId') as string
    const deviceType = formData.get('deviceType') as string // 'mylapstr2', 'racebox', 'garmin', 'applewatch'

    if (!file || !sessionId || !deviceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Verify session belongs to team
    const sess = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, sessionId), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sess || sess.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Parse telemetry file based on device type
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
    let parsedData: any = {}

    switch (deviceType) {
      case 'mylapstr2':
        parsedData = parseMyLapSTR2(text)
        break
      case 'racebox':
        parsedData = parseRaceBox(text)
        break
      case 'garmin':
        parsedData = parseGarmin(text)
        break
      case 'applewatch':
        parsedData = parseAppleWatch(text)
        break
      default:
        return NextResponse.json({ error: 'Unknown device type' }, { status: 400 })
    }

    // Create or update telemetry device record
    const device = await db
      .insert(mdTelemetryDevices)
      .values({
        teamId,
        deviceType,
        friendlyName: file.name,
        lastSyncAt: new Date(),
      })
      .returning()

    // Store telemetry import
    const importRecord = await db
      .insert(mdTelemetryImports)
      .values({
        teamId,
        deviceId: device[0].id,
        fileFormat: deviceType.toUpperCase(),
        parsedData: {
          sessionId,
          filename: file.name,
          fileSize: file.size,
          dataPoints: parsedData.points || 0,
          avgSpeed: parsedData.avgSpeed || 0,
          maxSpeed: parsedData.maxSpeed || 0,
          avgLapTime: parsedData.avgLapTime || 0,
          bestLapTime: parsedData.bestLapTime || 0,
          totalLaps: parsedData.laps || 0,
        },
        linkedSessionIds: [sessionId],
        status: 'success',
      })
      .returning()

    return NextResponse.json({
      ok: true,
      import: importRecord[0],
      parsed: { points: parsedData.points, laps: parsedData.laps },
    })
  } catch (error) {
    console.error('[v0] Telemetry upload failed:', error)
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 })
  }
}

function parseMyLapSTR2(csv: string): any {
  const lines = csv.trim().split('\n')
  let points = 0,
    laps = 0,
    speeds = [],
    lapTimes = []

  for (let i = 1; i < lines.length; i++) {
    const [time, speed, lap, gForce] = lines[i].split(',')
    if (speed) speeds.push(parseFloat(speed))
    if (lap && lap !== '0') laps++
    if (lapTimes.length < parseFloat(lap || '0')) lapTimes.push(parseFloat(time))
    points++
  }

  return {
    points,
    laps,
    avgSpeed: speeds.length ? speeds.reduce((a, b) => a + b) / speeds.length : 0,
    maxSpeed: speeds.length ? Math.max(...speeds) : 0,
    avgLapTime: lapTimes.length ? lapTimes.reduce((a, b) => a + b) / lapTimes.length : 0,
    bestLapTime: lapTimes.length ? Math.min(...lapTimes) : 0,
  }
}

function parseRaceBox(csv: string): any {
  // RaceBox CSV parsing
  const lines = csv.trim().split('\n')
  let points = 0,
    laps = 0
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) points++
  }
  return { points, laps: Math.floor(points / 10) }
}

function parseGarmin(gpx: string): any {
  // Garmin GPX parsing
  const points = (gpx.match(/<trkpt/g) || []).length
  return { points, laps: 1 }
}

function parseAppleWatch(json: string): any {
  try {
    const data = JSON.parse(json)
    return {
      points: data.samples?.length || 0,
      laps: 1,
      avgSpeed: data.avgSpeed || 0,
      maxSpeed: data.maxSpeed || 0,
    }
  } catch {
    return { points: 0, laps: 0 }
  }
}
