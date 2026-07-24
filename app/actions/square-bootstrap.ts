'use server'

import { bootstrapSquareCatalog } from '@/lib/square-catalog'
import { isSquareConfigured } from '@/lib/square'
import { getSessionTeamId } from '@/lib/md-auth'

/** Owner-only server action — bootstrap the Square subscription plan catalog. */
export async function bootstrapCatalogAction(reset?: boolean) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return { ok: false, error: 'Unauthorized — must be signed in' }
  }

  if (!isSquareConfigured()) {
    return { ok: false, error: 'Square credentials are not configured.' }
  }

  try {
    if (reset) {
      // Wipe local cache so all tiers are re-created in Square.
      const { db } = await import('@/lib/db')
      const { mdSquarePlanCatalog } = await import('@/lib/db/schema')
      await db.delete(mdSquarePlanCatalog)
    }

    const result = await bootstrapSquareCatalog()
    return { ok: true, ...result, reset: reset ?? false }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
