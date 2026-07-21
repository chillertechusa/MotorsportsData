import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import {
  OWNER_BACKUP_EMAIL,
  hashBackupCode,
  normalizeBackupCode,
} from '@/lib/owner-backup-codes'

const OWNER_EMAIL = OWNER_BACKUP_EMAIL

/**
 * EMERGENCY OWNER ACCOUNT RECOVERY
 *
 * Resets the platform owner password when locked out — no email, no current password.
 *
 * Accepts ONE of:
 *   - `code`: a one-time 8-digit backup code (preferred). Redeemed and marked used.
 *   - `code`: the OWNER_EMERGENCY_CODE env value (fallback, reusable — for bootstrapping).
 *
 * Security: only works for the single owner email. Backup codes are single-use and
 * peppered-hashed. Attempts are logged. Returns the remaining backup-code count.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Accept `code` (new) or legacy `emergencyCode`/`backupCode` field names.
    const rawCode: string = body.code ?? body.backupCode ?? body.emergencyCode ?? ''
    const newPassword: string = body.newPassword ?? ''

    if (!newPassword || newPassword.length < 12) {
      return Response.json({ error: 'New password must be at least 12 characters' }, { status: 400 })
    }
    if (!rawCode) {
      return Response.json({ error: 'A recovery code is required' }, { status: 400 })
    }

    // Find the owner user
    const userResult = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${OWNER_EMAIL} LIMIT 1`,
    )
    if (!userResult.rows || userResult.rows.length === 0) {
      return Response.json({ error: 'Owner account not found — run setup first' }, { status: 404 })
    }
    const userId = (userResult.rows[0] as any).id

    // ── Verify the recovery code ────────────────────────────────────────────
    let codeAccepted = false
    let redeemedBackupCode = false

    // 1) Try one-time backup code
    const normalized = normalizeBackupCode(rawCode)
    if (normalized.length === 8) {
      const codeHash = hashBackupCode(normalized)
      // Atomically redeem: mark the first matching unused code as used.
      const redeem = await db.execute(
        sql`UPDATE md_owner_backup_codes
            SET used = true, used_at = NOW()
            WHERE id = (
              SELECT id FROM md_owner_backup_codes
              WHERE owner_email = ${OWNER_EMAIL.toLowerCase()}
                AND code_hash = ${codeHash}
                AND used = false
              LIMIT 1
            )
            RETURNING id`,
      )
      if (redeem.rows && redeem.rows.length > 0) {
        codeAccepted = true
        redeemedBackupCode = true
      }
    }

    // 2) Fallback: reusable env emergency code (bootstrap only)
    if (!codeAccepted) {
      const EMERGENCY_CODE = process.env.OWNER_EMERGENCY_CODE
      if (EMERGENCY_CODE && rawCode === EMERGENCY_CODE) {
        codeAccepted = true
      }
    }

    if (!codeAccepted) {
      console.warn('[v0] Owner recovery attempt with invalid code')
      return Response.json({ error: 'Invalid or already-used recovery code' }, { status: 401 })
    }

    // ── Reset the password ───────────────────────────────────────────────────
    const hashed = await hashPassword(newPassword)

    const updateResult = await db.execute(
      sql`UPDATE "account" SET password = ${hashed} WHERE "userId" = ${userId} AND "providerId" = 'credential'`,
    )

    if (!updateResult.rowCount || updateResult.rowCount === 0) {
      const accountId = crypto.randomUUID()
      await db.execute(
        sql`INSERT INTO "account" (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt")
            VALUES (${accountId}, ${userId}, 'credential', ${userId}, ${hashed}, NOW(), NOW())`,
      )
      console.log('[v0] Owner recovery: created missing credential row')
    }

    // Clear any pending email-reset tokens
    await db.execute(
      sql`UPDATE "user" SET "passwordResetToken" = NULL, "passwordResetTokenExpiresAt" = NULL WHERE id = ${userId}`,
    )

    // Count remaining unused backup codes for the countdown
    const remainingResult = await db.execute(
      sql`SELECT COUNT(*)::int AS remaining FROM md_owner_backup_codes
          WHERE owner_email = ${OWNER_EMAIL.toLowerCase()} AND used = false`,
    )
    const remaining = (remainingResult.rows?.[0] as any)?.remaining ?? 0

    console.log('[v0] Owner password reset succeeded via', redeemedBackupCode ? 'backup code' : 'emergency code')
    return Response.json({
      success: true,
      message: 'Owner password reset. Sign in at /data/owner/login.',
      usedBackupCode: redeemedBackupCode,
      remainingCodes: remaining,
    })
  } catch (error) {
    console.error('[v0] Owner recovery error:', error)
    return Response.json({ error: 'Recovery failed' }, { status: 500 })
  }
}
