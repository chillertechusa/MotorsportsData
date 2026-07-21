import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdNutritionLog, mdHydrationLog } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const type = searchParams.get('type') // 'nutrition' | 'hydration'

  if (type === 'hydration') {
    const conditions = [eq(mdHydrationLog.teamId, auth.teamId)]
    if (date) conditions.push(eq(mdHydrationLog.logDate, date))
    if (from) conditions.push(gte(mdHydrationLog.logDate, from))
    if (to) conditions.push(lte(mdHydrationLog.logDate, to))
    const rows = await db.select().from(mdHydrationLog).where(and(...conditions)).orderBy(desc(mdHydrationLog.logDate)).limit(60)
    return NextResponse.json({ success: true, entries: rows })
  }

  const conditions = [eq(mdNutritionLog.teamId, auth.teamId)]
  if (date) conditions.push(eq(mdNutritionLog.logDate, date))
  if (from) conditions.push(gte(mdNutritionLog.logDate, from))
  if (to) conditions.push(lte(mdNutritionLog.logDate, to))

  const rows = await db.select().from(mdNutritionLog).where(and(...conditions)).orderBy(desc(mdNutritionLog.logDate)).limit(200)
  return NextResponse.json({ success: true, entries: rows })
}

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.type === 'hydration') {
    const { logDate, preRideWeightKg, postRideWeightKg, waterConsumedMl, notes } = body as Record<string, unknown>
    if (!logDate) return NextResponse.json({ error: 'logDate required' }, { status: 400 })
    const [row] = await db
      .insert(mdHydrationLog)
      .values({
        teamId: auth.teamId,
        logDate: String(logDate),
        preRideWeightKg: preRideWeightKg != null ? String(preRideWeightKg) : null,
        postRideWeightKg: postRideWeightKg != null ? String(postRideWeightKg) : null,
        waterConsumedMl: waterConsumedMl != null ? Number(waterConsumedMl) : 0,
        notes: notes ? String(notes) : null,
      })
      .onConflictDoUpdate({
        target: [mdHydrationLog.teamId, mdHydrationLog.logDate],
        set: {
          preRideWeightKg: preRideWeightKg != null ? String(preRideWeightKg) : null,
          postRideWeightKg: postRideWeightKg != null ? String(postRideWeightKg) : null,
          waterConsumedMl: waterConsumedMl != null ? Number(waterConsumedMl) : 0,
          notes: notes ? String(notes) : null,
        },
      })
      .returning()
    return NextResponse.json({ success: true, entry: row })
  }

  const { logDate, mealType, foodName, quantityGrams, calories, proteinG, carbsG, fatG, waterMl, fdcId } = body as Record<string, unknown>
  if (!logDate || !foodName) return NextResponse.json({ error: 'logDate and foodName required' }, { status: 400 })

  const [row] = await db
    .insert(mdNutritionLog)
    .values({
      teamId: auth.teamId,
      logDate: String(logDate),
      mealType: mealType ? String(mealType) : 'meal',
      foodName: String(foodName),
      quantityGrams: quantityGrams != null ? String(quantityGrams) : null,
      calories: calories != null ? String(calories) : null,
      proteinG: proteinG != null ? String(proteinG) : null,
      carbsG: carbsG != null ? String(carbsG) : null,
      fatG: fatG != null ? String(fatG) : null,
      waterMl: waterMl != null ? Number(waterMl) : null,
      fdcId: fdcId ? String(fdcId) : null,
    })
    .returning()

  return NextResponse.json({ success: true, entry: row })
}

export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (type === 'hydration') {
    await db.delete(mdHydrationLog).where(and(eq(mdHydrationLog.id, id), eq(mdHydrationLog.teamId, auth.teamId)))
  } else {
    await db.delete(mdNutritionLog).where(and(eq(mdNutritionLog.id, id), eq(mdNutritionLog.teamId, auth.teamId)))
  }

  return NextResponse.json({ success: true })
}
