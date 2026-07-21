'use server'

import { db } from '@/lib/db'
import {
  retailOrders,
  retailOrderItems,
  retailVariants,
  retailProducts,
  userProfiles,
} from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getMyOrders() {
  const userId = await getUserId()
  const orders = await db
    .select()
    .from(retailOrders)
    .where(eq(retailOrders.userId, userId))
    .orderBy(desc(retailOrders.createdAt))

  if (orders.length === 0) return []

  const orderIds = orders.map((o) => o.id)
  const items = await db
    .select()
    .from(retailOrderItems)
    .where(inArray(retailOrderItems.orderId, orderIds))

  return orders.map((order) => ({
    order,
    items: items.filter((i) => i.orderId === order.id),
  }))
}

/**
 * Gear Locker: every unique product/size the rider has ever bought, with the
 * variant's current live stock so we can offer a one-tap reorder + restock
 * status.
 */
export async function getGearLocker() {
  const userId = await getUserId()
  const orders = await db.select().from(retailOrders).where(eq(retailOrders.userId, userId))
  if (orders.length === 0) return []

  const orderIds = orders.map((o) => o.id)
  const items = await db
    .select()
    .from(retailOrderItems)
    .where(inArray(retailOrderItems.orderId, orderIds))

  const variantIds = [...new Set(items.map((i) => i.variantId).filter((v): v is number => v !== null))]
  const variants = variantIds.length
    ? await db.select().from(retailVariants).where(inArray(retailVariants.id, variantIds))
    : []
  const productIds = [...new Set(variants.map((v) => v.productId))]
  const products = productIds.length
    ? await db.select().from(retailProducts).where(inArray(retailProducts.id, productIds))
    : []

  // Collapse to unique variant, tracking total qty owned + last order date.
  const locker = new Map<
    number,
    {
      variantId: number
      productSlug: string
      productName: string
      color: string
      size: string
      priceCents: number
      image: string
      currentStock: number
      qtyOwned: number
      lastOrdered: Date
    }
  >()

  for (const item of items) {
    if (item.variantId === null) continue
    const variant = variants.find((v) => v.id === item.variantId)
    const product = variant ? products.find((p) => p.id === variant.productId) : undefined
    const order = orders.find((o) => o.id === item.orderId)
    const existing = locker.get(item.variantId)
    if (existing) {
      existing.qtyOwned += item.quantity
      if (order && order.createdAt > existing.lastOrdered) existing.lastOrdered = order.createdAt
    } else {
      locker.set(item.variantId, {
        variantId: item.variantId,
        productSlug: product?.slug ?? '',
        productName: item.productName,
        color: item.color,
        size: item.size,
        priceCents: item.unitPriceCents,
        image: item.image ?? ((product?.images as string[] | undefined)?.[0] ?? ''),
        currentStock: variant?.stock ?? 0,
        qtyOwned: item.quantity,
        lastOrdered: order?.createdAt ?? new Date(),
      })
    }
  }

  return [...locker.values()].sort((a, b) => b.lastOrdered.getTime() - a.lastOrdered.getTime())
}

export async function getMyProfile() {
  const userId = await getUserId()
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)
  return profile ?? null
}

export type ProfileInput = {
  teeSize?: string
  hoodieSize?: string
  raceNumber?: string
  riderClass?: string
  homeTrack?: string
  shipAddress1?: string
  shipAddress2?: string
  shipCity?: string
  shipState?: string
  shipZip?: string
  phone?: string
}

export async function saveMyProfile(input: ProfileInput) {
  const userId = await getUserId()
  const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)

  if (existing) {
    await db
      .update(userProfiles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
  } else {
    await db.insert(userProfiles).values({ userId, ...input })
  }
  revalidatePath('/account')
  revalidatePath('/account/profile')
  return { ok: true as const }
}

export async function getAccountSummary() {
  const userId = await getUserId()
  const orders = await db.select().from(retailOrders).where(eq(retailOrders.userId, userId))
  const totalSpentCents = orders.reduce((s, o) => s + o.totalCents, 0)
  const activeCount = orders.filter((o) => ['paid', 'pending_payment', 'processing', 'shipped'].includes(o.status)).length
  return {
    orderCount: orders.length,
    activeCount,
    totalSpentCents,
  }
}
