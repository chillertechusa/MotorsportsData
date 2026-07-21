'use server'

import { db } from '@/lib/db'
import { mdWorkOrders, mdWorkOrderParts, mdWorkOrderPhotos, mdPartVault, mdVehicles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'
import { del } from '@vercel/blob'

// ── Types ─────────────────────────────────────────────────────────────────────

export type WorkOrderStatus = 'open' | 'in_progress' | 'closed'

export type WorkOrderWithVehicle = {
  id: string
  teamId: string
  vehicleId: string
  vehicleName: string
  vehicleType: string
  assignedMechanicUserId: string | null
  title: string
  description: string | null
  status: WorkOrderStatus
  laborHours: number
  suspensionBefore: Record<string, string> | null
  suspensionAfter: Record<string, string> | null
  createdAt: string
  partsCount: number
  photosCount: number
}

export type WorkOrderPart = {
  id: string
  workOrderId: string
  partVaultId: string | null
  partName: string
  quantity: number
  unitCostCents: number
}

export type WorkOrderPhoto = {
  id: string
  workOrderId: string
  blobPathname: string
  caption: string | null
  createdAt: string
}

// ── List work orders for the current team ─────────────────────────────────────

export async function getWorkOrders(vehicleId?: string): Promise<WorkOrderWithVehicle[]> {
  const auth = await getSessionTeamId()
  if (!auth.ok) return []

  const rows = await db
    .select({
      id: mdWorkOrders.id,
      teamId: mdWorkOrders.teamId,
      vehicleId: mdWorkOrders.vehicleId,
      vehicleName: mdVehicles.name,
      vehicleType: mdVehicles.type,
      assignedMechanicUserId: mdWorkOrders.assignedMechanicUserId,
      title: mdWorkOrders.title,
      description: mdWorkOrders.description,
      status: mdWorkOrders.status,
      laborHours: mdWorkOrders.laborHours,
      suspensionBefore: mdWorkOrders.suspensionBefore,
      suspensionAfter: mdWorkOrders.suspensionAfter,
      createdAt: mdWorkOrders.createdAt,
    })
    .from(mdWorkOrders)
    .innerJoin(mdVehicles, eq(mdWorkOrders.vehicleId, mdVehicles.id))
    .where(
      vehicleId
        ? and(eq(mdWorkOrders.teamId, auth.teamId), eq(mdWorkOrders.vehicleId, vehicleId))
        : eq(mdWorkOrders.teamId, auth.teamId)
    )
    .orderBy(desc(mdWorkOrders.createdAt))

  // Count parts and photos per order
  const enriched = await Promise.all(
    rows.map(async (row) => {
      const [partsResult, photosResult] = await Promise.all([
        db.select({ id: mdWorkOrderParts.id }).from(mdWorkOrderParts).where(eq(mdWorkOrderParts.workOrderId, row.id)),
        db.select({ id: mdWorkOrderPhotos.id }).from(mdWorkOrderPhotos).where(eq(mdWorkOrderPhotos.workOrderId, row.id)),
      ])
      return {
        ...row,
        vehicleName: row.vehicleName ?? 'Unknown Vehicle',
        vehicleType: row.vehicleType ?? '',
        laborHours: row.laborHours ?? 0,
        suspensionBefore: row.suspensionBefore as Record<string, string> | null,
        suspensionAfter: row.suspensionAfter as Record<string, string> | null,
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
        status: (row.status ?? 'open') as WorkOrderStatus,
        partsCount: partsResult.length,
        photosCount: photosResult.length,
      }
    })
  )

  return enriched
}

// ── Get single work order with full parts + photos ────────────────────────────

export async function getWorkOrderDetail(workOrderId: string) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return null

  const [order] = await db
    .select()
    .from(mdWorkOrders)
    .where(and(eq(mdWorkOrders.id, workOrderId), eq(mdWorkOrders.teamId, auth.teamId)))
    .limit(1)

  if (!order) return null

  const [parts, photos, vehicle] = await Promise.all([
    db.select().from(mdWorkOrderParts).where(eq(mdWorkOrderParts.workOrderId, workOrderId)),
    db.select().from(mdWorkOrderPhotos).where(eq(mdWorkOrderPhotos.workOrderId, workOrderId)).orderBy(desc(mdWorkOrderPhotos.createdAt)),
    db.select({ name: mdVehicles.name, type: mdVehicles.type }).from(mdVehicles).where(eq(mdVehicles.id, order.vehicleId)).limit(1),
  ])

  return {
    ...order,
    vehicleName: vehicle[0]?.name ?? 'Unknown',
    vehicleType: vehicle[0]?.type ?? '',
    status: (order.status ?? 'open') as WorkOrderStatus,
    laborHours: order.laborHours ?? 0,
    suspensionBefore: order.suspensionBefore as Record<string, string> | null,
    suspensionAfter: order.suspensionAfter as Record<string, string> | null,
    createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
    parts: parts.map((p) => ({ ...p, unitCostCents: p.unitCostCents ?? 0, quantity: p.quantity ?? 1 })),
    photos: photos.map((p) => ({ ...p, createdAt: p.createdAt?.toISOString() ?? '' })),
  }
}

// ── Create work order ─────────────────────────────────────────────────────────

export async function createWorkOrder(data: {
  vehicleId: string
  title: string
  description?: string
  assignedMechanicUserId?: string
}) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  const owns = await assertVehicleOwnership(data.vehicleId, auth.teamId)
  if (!owns) throw new Error('Vehicle not found')

  const [order] = await db
    .insert(mdWorkOrders)
    .values({
      teamId: auth.teamId,
      vehicleId: data.vehicleId,
      title: data.title,
      description: data.description ?? null,
      assignedMechanicUserId: data.assignedMechanicUserId ?? null,
      status: 'open',
    })
    .returning()

  return order
}

// ── Update work order ─────────────────────────────────────────────────────────

export async function updateWorkOrder(
  workOrderId: string,
  data: {
    title?: string
    description?: string
    status?: WorkOrderStatus
    laborHours?: number
    suspensionBefore?: Record<string, string>
    suspensionAfter?: Record<string, string>
    assignedMechanicUserId?: string
  }
) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  await db
    .update(mdWorkOrders)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.laborHours !== undefined && { laborHours: data.laborHours }),
      ...(data.suspensionBefore !== undefined && { suspensionBefore: data.suspensionBefore }),
      ...(data.suspensionAfter !== undefined && { suspensionAfter: data.suspensionAfter }),
      ...(data.assignedMechanicUserId !== undefined && { assignedMechanicUserId: data.assignedMechanicUserId }),
    })
    .where(and(eq(mdWorkOrders.id, workOrderId), eq(mdWorkOrders.teamId, auth.teamId)))
}

// ── Parts ─────────────────────────────────────────────────────────────────────

export async function addWorkOrderPart(workOrderId: string, data: {
  partName: string
  quantity: number
  unitCostCents: number
  partVaultId?: string
}) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  // Verify the work order belongs to this team
  const [order] = await db.select({ id: mdWorkOrders.id }).from(mdWorkOrders)
    .where(and(eq(mdWorkOrders.id, workOrderId), eq(mdWorkOrders.teamId, auth.teamId))).limit(1)
  if (!order) throw new Error('Work order not found')

  const [part] = await db.insert(mdWorkOrderParts).values({
    workOrderId,
    partName: data.partName,
    quantity: data.quantity,
    unitCostCents: data.unitCostCents,
    partVaultId: data.partVaultId ?? null,
  }).returning()

  return part
}

export async function removeWorkOrderPart(partId: string) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')
  await db.delete(mdWorkOrderParts).where(eq(mdWorkOrderParts.id, partId))
}

// ── Photos ────────────────────────────────────────────────────────────────────

export async function addWorkOrderPhoto(workOrderId: string, blobPathname: string, caption?: string) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  const [photo] = await db.insert(mdWorkOrderPhotos).values({
    workOrderId,
    blobPathname,
    caption: caption ?? null,
  }).returning()

  return photo
}

export async function deleteWorkOrderPhoto(photoId: string) {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  const [photo] = await db.select().from(mdWorkOrderPhotos).where(eq(mdWorkOrderPhotos.id, photoId)).limit(1)
  if (!photo) return

  // Delete from Blob storage
  try {
    await del(photo.blobPathname)
  } catch {
    // Blob already gone — continue with DB cleanup
  }

  await db.delete(mdWorkOrderPhotos).where(eq(mdWorkOrderPhotos.id, photoId))
}

/** Alias — deletes photo DB row and is named consistently with the detail component. */
export async function removeWorkOrderPhoto(photoId: string, _blobPathname?: string) {
  'use server'
  // Blob deletion would require the del() call — skipping for now since private
  // blobs expire on their own and we do not expose the URL to clients.
  return deleteWorkOrderPhoto(photoId)
}

/** Permanently deletes a work order and all its parts + photos (cascade via DB). */
export async function deleteWorkOrder(workOrderId: string) {
  'use server'
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error('Unauthorized')

  // Verify ownership — only delete if team owns this work order
  const [wo] = await db
    .select({ teamId: mdWorkOrders.teamId })
    .from(mdWorkOrders)
    .where(eq(mdWorkOrders.id, workOrderId))
    .limit(1)

  if (!wo || wo.teamId !== auth.teamId) throw new Error('Not found')

  await db.delete(mdWorkOrders).where(eq(mdWorkOrders.id, workOrderId))
}

// ── Get available parts from Part Vault for picker ────────────────────────────

export async function getTeamPartVault() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return []

  const parts = await db
    .select({
      id: mdPartVault.id,
      partName: mdPartVault.partName,
      vehicleId: mdPartVault.vehicleId,
      vehicleName: mdVehicles.name,
      stockInTruck: mdPartVault.stockInTruck,
    })
    .from(mdPartVault)
    .innerJoin(mdVehicles, eq(mdPartVault.vehicleId, mdVehicles.id))
    .where(eq(mdVehicles.teamId, auth.teamId))
    .orderBy(mdPartVault.partName)

  return parts
}
