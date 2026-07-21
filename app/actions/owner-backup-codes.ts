'use server'

import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { mdOwnerBackupCodes } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireMdOwner } from '@/lib/md-owner-auth'
import {
  BACKUP_CODE_COUNT,
  generateBackupCodeBatch,
  hashBackupCode,
} from '@/lib/owner-backup-codes'

export type BackupCodesStatus = {
  total: number
  used: number
  remaining: number
  generatedAt: string | null
}

/**
 * Generates a fresh batch of 10 one-time backup codes for the signed-in owner.
 * Invalidates any previous batch. Returns the raw codes ONCE — they are only
 * ever stored as hashes, so this is the only chance to save them.
 */
export async function generateOwnerBackupCodes(): Promise<{ codes: string[] }> {
  const owner = await requireMdOwner()
  const ownerEmail = owner.email.toLowerCase()

  // Invalidate the previous batch — only one active set at a time.
  await db.delete(mdOwnerBackupCodes).where(eq(mdOwnerBackupCodes.ownerEmail, ownerEmail))

  const batchId = randomUUID()
  const rawCodes = generateBackupCodeBatch(BACKUP_CODE_COUNT)

  await db.insert(mdOwnerBackupCodes).values(
    rawCodes.map((code, i) => ({
      ownerEmail,
      label: i + 1,
      codeHash: hashBackupCode(code),
      batchId,
    })),
  )

  console.log('[v0] Generated new owner backup code batch for', ownerEmail)
  return { codes: rawCodes }
}

/**
 * Returns the current status/countdown of the owner's backup codes.
 */
export async function getOwnerBackupCodesStatus(): Promise<BackupCodesStatus> {
  const owner = await requireMdOwner()
  const ownerEmail = owner.email.toLowerCase()

  const rows = await db
    .select()
    .from(mdOwnerBackupCodes)
    .where(eq(mdOwnerBackupCodes.ownerEmail, ownerEmail))
    .orderBy(desc(mdOwnerBackupCodes.createdAt))

  const total = rows.length
  const used = rows.filter((r) => r.used).length
  const generatedAt = rows.length > 0 ? (rows[0].createdAt?.toISOString() ?? null) : null

  return { total, used, remaining: total - used, generatedAt }
}
