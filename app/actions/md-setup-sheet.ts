'use server'

import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'
import { randomBytes } from 'crypto'

export type SetupSheetInput = {
  vehicleId: string
  trackName: string
  sessionDate?: string
  // Weather
  ambientTempF?: number
  humidityPct?: number
  windMph?: number
  trackSurface?: string
  // Tires
  tireFront?: string
  tireRear?: string
  tirePressureFront?: number
  tirePressureRear?: number
  // Engine / jetting
  fuelMix?: string
  jetNeedle?: string
  airFilterCondition?: string
  engineMap?: string
  // Suspension (key/value pairs stored in mdSetupLogs)
  suspensionSetup?: { key: string; value: string }[]
  // Rider notes
  riderFeedback?: string
  // Sharing
  isPublic?: boolean
}

export async function saveSetupSheet(input: SetupSheetInput) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return { success: false, error: 'Unauthorized' }

  const owned = await assertVehicleOwnership(input.vehicleId, authResult.teamId)
  if (!owned) return { success: false, error: 'Vehicle not found' }

  const shareToken = input.isPublic ? randomBytes(16).toString('hex') : null

  const [session] = await db
    .insert(mdSessions)
    .values({
      teamId: authResult.teamId,
      vehicleId: input.vehicleId,
      trackName: input.trackName.trim(),
      sessionDate: input.sessionDate ?? undefined,
      ambientTempF: input.ambientTempF ?? null,
      humidityPct: input.humidityPct ?? null,
      windMph: input.windMph ?? null,
      trackSurface: input.trackSurface ?? null,
      tireFront: input.tireFront ?? null,
      tireRear: input.tireRear ?? null,
      tirePressureFront: input.tirePressureFront ?? null,
      tirePressureRear: input.tirePressureRear ?? null,
      fuelMix: input.fuelMix ?? null,
      jetNeedle: input.jetNeedle ?? null,
      airFilterCondition: input.airFilterCondition ?? null,
      engineMap: input.engineMap ?? null,
      riderFeedback: input.riderFeedback ?? null,
      shareToken,
      isPublic: input.isPublic ?? false,
    })
    .returning({ id: mdSessions.id })

  if (input.suspensionSetup?.length) {
    await db.insert(mdSetupLogs).values(
      input.suspensionSetup.map((s) => ({
        teamId: authResult.teamId,
        sessionId: session.id,
        parameterKey: s.key,
        parameterValue: s.value,
      }))
    )
  }

  return { success: true, sessionId: session.id, shareToken }
}

export async function toggleSetupSheetPublic(sessionId: string, isPublic: boolean) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return { success: false, error: 'Unauthorized' }

  // Verify ownership via the vehicle → team chain
  const [row] = await db
    .select({ vehicleId: mdSessions.vehicleId, shareToken: mdSessions.shareToken })
    .from(mdSessions)
    .innerJoin(mdVehicles, eq(mdSessions.vehicleId, mdVehicles.id))
    .where(and(eq(mdSessions.id, sessionId), eq(mdVehicles.teamId, authResult.teamId)))
    .limit(1)

  if (!row) return { success: false, error: 'Session not found' }

  const shareToken = isPublic
    ? (row.shareToken ?? randomBytes(16).toString('hex'))
    : null

  await db
    .update(mdSessions)
    .set({ isPublic, shareToken })
    .where(eq(mdSessions.id, sessionId))

  return { success: true, shareToken }
}

export async function getTeamSetupSheets(vehicleId?: string) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return { success: false as const, error: 'Unauthorized', sheets: [] }

  // Resolve vehicle IDs for this team
  const vehicles = await db
    .select({ id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type })
    .from(mdVehicles)
    .where(eq(mdVehicles.teamId, authResult.teamId))

  const vehicleIds = vehicles.map((v) => v.id)
  if (vehicleIds.length === 0) return { success: true as const, sheets: [], vehicles: [] }

  const { inArray } = await import('drizzle-orm')

  const sessions = await db
    .select()
    .from(mdSessions)
    .where(
      vehicleId
        ? eq(mdSessions.vehicleId, vehicleId)
        : inArray(mdSessions.vehicleId, vehicleIds)
    )
    .orderBy(desc(mdSessions.sessionDate))
    .limit(50)

  return { success: true as const, sheets: sessions, vehicles }
}
