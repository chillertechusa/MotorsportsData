'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { blanks, pricingSettings } from '@/lib/db/schema'
import { DEFAULT_RATES, type ShopRates } from '@/lib/pricing'
import { asc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getBlanks() {
  await getUserId()
  return db.select().from(blanks).orderBy(asc(blanks.category), asc(blanks.brand))
}

export async function createBlank(data: {
  styleNumber: string
  brand: string
  name: string
  category: string
  wholesaleCost: number
  colors?: string
}) {
  await getUserId()
  await db.insert(blanks).values({
    styleNumber: data.styleNumber,
    brand: data.brand,
    name: data.name,
    category: data.category,
    wholesaleCost: String(data.wholesaleCost),
    colors: data.colors,
  })
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/orders/new')
}

export async function deleteBlank(id: number) {
  await getUserId()
  await db.delete(blanks).where(eq(blanks.id, id))
  revalidatePath('/dashboard/settings')
}

export async function getRates(): Promise<ShopRates> {
  await getUserId()
  const [row] = await db.select().from(pricingSettings).limit(1)
  if (!row) return DEFAULT_RATES
  return {
    screenSetupFee: Number(row.screenSetupFee),
    colorChangeFee: Number(row.colorChangeFee),
    sizeTagFee: Number(row.sizeTagFee),
    defaultMarkup: Number(row.defaultMarkup),
  }
}

export async function updateRates(data: ShopRates) {
  await getUserId()
  const [row] = await db.select().from(pricingSettings).limit(1)
  const values = {
    screenSetupFee: String(data.screenSetupFee),
    colorChangeFee: String(data.colorChangeFee),
    sizeTagFee: String(data.sizeTagFee),
    defaultMarkup: String(data.defaultMarkup),
    updatedAt: new Date(),
  }
  if (row) {
    await db.update(pricingSettings).set(values).where(eq(pricingSettings.id, row.id))
  } else {
    await db.insert(pricingSettings).values(values)
  }
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/orders/new')
}
