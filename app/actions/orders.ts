'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import type { QuoteBreakdown } from '@/lib/pricing'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

type OrderStatus =
  | 'pending'
  | 'in_production'
  | 'quality_check'
  | 'ready'
  | 'shipped'
  | 'completed'
  | 'cancelled'

type PrintType = 'screen_print' | 'embroidery' | 'dtf' | 'sublimation'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getOrders() {
  await getUserId()
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function getOrderById(id: number) {
  await getUserId()
  const [order] = await db.select().from(orders).where(eq(orders.id, id))
  return order ?? null
}

export async function createOrder(data: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  productType: string
  printType: PrintType
  quantity: number
  sizes?: string
  colors?: string
  notes?: string
  blankId?: number
  numColors?: number
  printLocations?: number
  garmentCost?: number
  unitPrice?: number
  totalPrice?: number
  breakdown?: QuoteBreakdown
  dueDate?: string
}) {
  const userId = await getUserId()
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      productType: data.productType,
      printType: data.printType,
      quantity: data.quantity,
      sizes: data.sizes,
      colors: data.colors,
      notes: data.notes,
      blankId: data.blankId,
      numColors: data.numColors,
      printLocations: data.printLocations,
      garmentCost: data.garmentCost != null ? String(data.garmentCost) : null,
      unitPrice: data.unitPrice != null ? String(data.unitPrice) : null,
      totalPrice: data.totalPrice != null ? String(data.totalPrice) : null,
      breakdown: data.breakdown ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    })
    .returning()
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  return order
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  await getUserId()
  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${id}`)
}

export async function updateOrder(
  id: number,
  data: Partial<{
    assignedTo: string
    dueDate: Date
    unitPrice: string
    totalPrice: string
    notes: string
    status: OrderStatus
  }>,
) {
  await getUserId()
  await db
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(orders.id, id))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${id}`)
}

export async function deleteOrder(id: number) {
  await getUserId()
  await db.delete(orders).where(eq(orders.id, id))
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
}
