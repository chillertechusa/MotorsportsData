import 'server-only'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdPartVault, mdSessions, mdSetupLogs, mdTeams, mdVehicles } from '@/lib/db/schema'

// For the prototype we operate on the first (only) team. When auth-per-team is
// wired, resolve the team id from the signed-in user's membership instead.
export async function getActiveTeam() {
  const [team] = await db.select().from(mdTeams).orderBy(asc(mdTeams.createdAt)).limit(1)
  return team ?? null
}

export async function getFleet(teamId: string) {
  return db.select().from(mdVehicles).where(eq(mdVehicles.teamId, teamId)).orderBy(asc(mdVehicles.name))
}

export async function getVehicle(vehicleId: string) {
  const [v] = await db.select().from(mdVehicles).where(eq(mdVehicles.id, vehicleId)).limit(1)
  return v ?? null
}

export async function getParts(vehicleId: string) {
  return db.select().from(mdPartVault).where(eq(mdPartVault.vehicleId, vehicleId)).orderBy(asc(mdPartVault.partName))
}

export async function getSessions(vehicleId: string) {
  return db
    .select()
    .from(mdSessions)
    .where(eq(mdSessions.vehicleId, vehicleId))
    .orderBy(desc(mdSessions.sessionDate))
}

export async function getSetupLogs(sessionId: string) {
  return db.select().from(mdSetupLogs).where(eq(mdSetupLogs.sessionId, sessionId))
}

export async function getSessionWithSetup(sessionId: string) {
  const [s] = await db.select().from(mdSessions).where(eq(mdSessions.id, sessionId)).limit(1)
  if (!s) return null
  const logs = await getSetupLogs(sessionId)
  return { ...s, setup: logs }
}
