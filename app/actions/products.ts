'use server'

import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'

export async function getProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.available, true))
    .orderBy(asc(products.sortOrder))
}

export async function getAllProducts() {
  return db.select().from(products).orderBy(asc(products.sortOrder))
}
