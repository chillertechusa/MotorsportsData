'use server'

import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import {
  retailProducts,
  retailVariants,
  retailOrders,
  retailOrderItems,
} from '@/lib/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'

// ── Order types ───────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'paid'
  | 'pending_payment'
  | 'in_production'
  | 'quality_check'
  | 'ready'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type OrderRow = {
  id: number
  orderNumber: string
  customerName: string
  email: string
  phone: string | null
  shipAddress1: string
  shipAddress2: string | null
  shipCity: string
  shipState: string
  shipZip: string
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  status: string
  squarePaymentId: string | null
  trackingCarrier: string | null
  trackingNumber: string | null
  createdAt: Date
  items: {
    id: number
    productName: string
    color: string
    size: string
    unitPriceCents: number
    quantity: number
    image: string | null
  }[]
}

export type ProductRow = {
  id: number
  slug: string
  name: string
  category: string
  priceCents: number
  images: string[]
  featured: boolean
  active: boolean
  sortOrder: number
  variants: { id: number; color: string; size: string; sku: string; stock: number }[]
  totalStock: number
}

export type ShopStats = {
  totalOrders: number
  totalRevenueCents: number
  pendingOrders: number
  shippedOrders: number
  totalProducts: number
  activeProducts: number
  lowStockVariants: number
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getShopStats(): Promise<ShopStats> {
  await requireMdOwner()

  const orders = await db.select().from(retailOrders)
  const variants = await db.select().from(retailVariants)
  const products = await db.select().from(retailProducts)

  const paidOrders = orders.filter((o) => o.status !== 'pending_payment' && o.status !== 'cancelled')

  return {
    totalOrders: orders.length,
    totalRevenueCents: paidOrders.reduce((s, o) => s + o.totalCents, 0),
    pendingOrders: orders.filter((o) => o.status === 'paid' || o.status === 'in_production').length,
    shippedOrders: orders.filter((o) => o.status === 'shipped' || o.status === 'completed').length,
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.active).length,
    lowStockVariants: variants.filter((v) => v.stock > 0 && v.stock <= 5).length,
  }
}

export async function getShopOrders(): Promise<OrderRow[]> {
  await requireMdOwner()

  const orders = await db
    .select()
    .from(retailOrders)
    .orderBy(desc(retailOrders.createdAt))

  const allItems = await db.select().from(retailOrderItems)

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone ?? null,
    shipAddress1: o.shipAddress1,
    shipAddress2: o.shipAddress2 ?? null,
    shipCity: o.shipCity,
    shipState: o.shipState,
    shipZip: o.shipZip,
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    taxCents: o.taxCents,
    totalCents: o.totalCents,
    status: o.status,
    squarePaymentId: o.squarePaymentId ?? null,
    trackingCarrier: o.trackingCarrier ?? null,
    trackingNumber: o.trackingNumber ?? null,
    createdAt: o.createdAt,
    items: allItems
      .filter((i) => i.orderId === o.id)
      .map((i) => ({
        id: i.id,
        productName: i.productName,
        color: i.color,
        size: i.size,
        unitPriceCents: i.unitPriceCents,
        quantity: i.quantity,
        image: i.image ?? null,
      })),
  }))
}

export async function getShopProducts(): Promise<ProductRow[]> {
  await requireMdOwner()

  const products = await db
    .select()
    .from(retailProducts)
    .orderBy(asc(retailProducts.sortOrder))

  const variants = await db
    .select()
    .from(retailVariants)
    .orderBy(asc(retailVariants.size))

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

  return products.map((p) => {
    const pv = variants
      .filter((v) => v.productId === p.id)
      .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      images: (p.images as string[]) ?? [],
      featured: p.featured,
      active: p.active,
      sortOrder: p.sortOrder ?? 0,
      variants: pv.map((v) => ({ id: v.id, color: v.color, size: v.size, sku: v.sku, stock: v.stock })),
      totalStock: pv.reduce((s, v) => s + v.stock, 0),
    }
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export type UpdateOrderResult = { ok: true } | { ok: false; error: string }

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<UpdateOrderResult> {
  await requireMdOwner()
  try {
    await db
      .update(retailOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(retailOrders.id, orderId))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update order.' }
  }
}

export async function updateOrderTracking(
  orderId: number,
  trackingCarrier: string,
  trackingNumber: string,
): Promise<UpdateOrderResult> {
  await requireMdOwner()
  try {
    await db
      .update(retailOrders)
      .set({
        trackingCarrier: trackingCarrier || null,
        trackingNumber: trackingNumber || null,
        status: 'shipped',
        updatedAt: new Date(),
      })
      .where(eq(retailOrders.id, orderId))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save tracking.' }
  }
}

export async function toggleProductActive(
  productId: number,
  active: boolean,
): Promise<UpdateOrderResult> {
  await requireMdOwner()
  try {
    await db
      .update(retailProducts)
      .set({ active })
      .where(eq(retailProducts.id, productId))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update product.' }
  }
}

export async function updateVariantStock(
  variantId: number,
  stock: number,
): Promise<UpdateOrderResult> {
  await requireMdOwner()
  if (stock < 0) return { ok: false, error: 'Stock cannot be negative.' }
  try {
    await db
      .update(retailVariants)
      .set({ stock })
      .where(eq(retailVariants.id, variantId))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update stock.' }
  }
}
