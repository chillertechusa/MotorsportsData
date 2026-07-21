'use server'

import { db } from '@/lib/db'
import { retailProducts, retailVariants, retailOrders, retailOrderItems } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { getSquareClient, isSquareConfigured, squareLocationId } from '@/lib/square'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'

export type ProductWithVariants = {
  id: number
  slug: string
  name: string
  description: string | null
  category: string
  priceCents: number
  images: string[]
  featured: boolean
  variants: { id: number; color: string; size: string; sku: string; stock: number }[]
  totalStock: number
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

function sortVariants<T extends { size: string }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))
}

export async function getProducts(): Promise<ProductWithVariants[]> {
  const products = await db
    .select()
    .from(retailProducts)
    .where(eq(retailProducts.active, true))
    .orderBy(asc(retailProducts.sortOrder))

  const variants = await db.select().from(retailVariants)

  return products.map((p) => {
    const pv = sortVariants(variants.filter((v) => v.productId === p.id))
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      priceCents: p.priceCents,
      images: (p.images as string[]) ?? [],
      featured: p.featured,
      variants: pv.map((v) => ({ id: v.id, color: v.color, size: v.size, sku: v.sku, stock: v.stock })),
      totalStock: pv.reduce((s, v) => s + v.stock, 0),
    }
  })
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const [p] = await db.select().from(retailProducts).where(eq(retailProducts.slug, slug)).limit(1)
  if (!p) return null
  const pv = sortVariants(await db.select().from(retailVariants).where(eq(retailVariants.productId, p.id)))
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    priceCents: p.priceCents,
    images: (p.images as string[]) ?? [],
    featured: p.featured,
    variants: pv.map((v) => ({ id: v.id, color: v.color, size: v.size, sku: v.sku, stock: v.stock })),
    totalStock: pv.reduce((s, v) => s + v.stock, 0),
  }
}

export type CheckoutInput = {
  sourceId: string | null // Square card nonce; null for order-capture-only mode
  contact: {
    email: string
    name: string
    phone?: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
  }
  items: { variantId: number; quantity: number }[]
}

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string }

const SHIPPING_FLAT_CENTS = 800
const FREE_SHIP_THRESHOLD_CENTS = 10000
const TAX_RATE = 0.0725

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.items.length === 0) return { ok: false, error: 'Your cart is empty.' }

  // Attach user if signed in (guest checkout allowed).
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id ?? null

  // Re-fetch variants server-side — never trust client prices or stock.
  const variantIds = input.items.map((i) => i.variantId)
  const variants = await db.select().from(retailVariants).where(inArray(retailVariants.id, variantIds))
  const productRows = await db.select().from(retailProducts)

  let subtotalCents = 0
  const lineItems: {
    variantId: number
    productName: string
    color: string
    size: string
    unitPriceCents: number
    quantity: number
    image: string
  }[] = []

  for (const item of input.items) {
    const v = variants.find((x) => x.id === item.variantId)
    if (!v) return { ok: false, error: 'A product in your cart is no longer available.' }
    if (v.stock < item.quantity) {
      const p = productRows.find((x) => x.id === v.productId)
      return { ok: false, error: `Only ${v.stock} left of ${p?.name ?? 'an item'} (${v.size}).` }
    }
    const product = productRows.find((x) => x.id === v.productId)
    if (!product) return { ok: false, error: 'Product not found.' }
    subtotalCents += product.priceCents * item.quantity
    lineItems.push({
      variantId: v.id,
      productName: product.name,
      color: v.color,
      size: v.size,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
      image: ((product.images as string[]) ?? [])[0] ?? '',
    })
  }

  const shippingCents = subtotalCents >= FREE_SHIP_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + shippingCents + taxCents

  // Process payment through Square when configured and a card token was sent.
  let squarePaymentId: string | null = null
  if (input.sourceId) {
    if (!isSquareConfigured()) {
      return { ok: false, error: 'Payments are not configured yet. Please try again later.' }
    }
    try {
      const client = getSquareClient()
      const res = await client.payments.create({
        sourceId: input.sourceId,
        idempotencyKey: randomUUID(),
        amountMoney: { amount: BigInt(totalCents), currency: 'USD' },
        locationId: squareLocationId(),
        buyerEmailAddress: input.contact.email,
        note: `Moto D order — ${lineItems.length} item(s)`,
      })
      squarePaymentId = res.payment?.id ?? null
      if (!squarePaymentId) return { ok: false, error: 'Payment could not be completed.' }
    } catch (err) {
      return { ok: false, error: 'Card was declined or payment failed. Please try another card.' }
    }
  }

  // Create the order + line items, decrement stock.
  const orderNumber = `MD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`

  const [order] = await db
    .insert(retailOrders)
    .values({
      orderNumber,
      userId,
      email: input.contact.email,
      customerName: input.contact.name,
      phone: input.contact.phone ?? null,
      shipAddress1: input.contact.address1,
      shipAddress2: input.contact.address2 ?? null,
      shipCity: input.contact.city,
      shipState: input.contact.state,
      shipZip: input.contact.zip,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      status: squarePaymentId ? 'paid' : 'pending_payment',
      squarePaymentId,
    })
    .returning()

  await db.insert(retailOrderItems).values(
    lineItems.map((li) => ({
      orderId: order.id,
      variantId: li.variantId,
      productName: li.productName,
      color: li.color,
      size: li.size,
      unitPriceCents: li.unitPriceCents,
      quantity: li.quantity,
      image: li.image,
    })),
  )

  // Decrement stock per variant.
  for (const li of lineItems) {
    const v = variants.find((x) => x.id === li.variantId)!
    await db
      .update(retailVariants)
      .set({ stock: Math.max(0, v.stock - li.quantity) })
      .where(eq(retailVariants.id, li.variantId))
  }

  return { ok: true, orderNumber }
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db
    .select()
    .from(retailOrders)
    .where(eq(retailOrders.orderNumber, orderNumber))
    .limit(1)
  if (!order) return null
  const items = await db.select().from(retailOrderItems).where(eq(retailOrderItems.orderId, order.id))
  return { order, items }
}
