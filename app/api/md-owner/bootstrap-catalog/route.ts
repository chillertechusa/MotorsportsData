import { NextResponse } from 'next/server'
import { bootstrapSquareCatalog } from '@/lib/square-catalog'
import { isSquareConfigured } from '@/lib/square'
import { db } from '@/lib/db'
import { mdSquarePlanCatalog } from '@/lib/db/schema'

/**
 * Owner-only endpoint to pre-create the Square subscription catalog (plans +
 * annual/monthly variations) so the first real customer checkout doesn't pay
 * the bootstrap cost or risk a first-run failure. Idempotent — safe to re-run.
 *
 *   GET /api/md-owner/bootstrap-catalog?token=<MD_OWNER_SEED_PASSWORD>
 *
 * Pass &reset=1 to first DELETE all previously-created plans from Square and
 * wipe the local cache, then rebuild from scratch. Use this after a pricing
 * change. Safe only while no live subscriptions reference the old variations.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const reset = url.searchParams.get('reset') === '1'
  const expected = process.env.MD_OWNER_SEED_PASSWORD
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSquareConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Square is not configured (missing env vars).' },
      { status: 400 },
    )
  }

  try {
    let orphanedPlans: string[] = []
    if (reset) {
      // Square does NOT allow deleting subscription plans (it retains them for
      // billing history), so we can't remove the old mispriced ones. Instead we
      // wipe the local cache and rebuild fresh, correctly-priced plans. The old
      // plans stay in Square as harmless orphans — nothing references them since
      // no live subscription was ever created against them.
      const rows = await db
        .select({ planId: mdSquarePlanCatalog.squarePlanId })
        .from(mdSquarePlanCatalog)
      orphanedPlans = Array.from(new Set(rows.map((r) => r.planId)))
      await db.delete(mdSquarePlanCatalog)
    }

    const result = await bootstrapSquareCatalog()
    return NextResponse.json({ ok: true, reset, orphanedPlans, ...result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
