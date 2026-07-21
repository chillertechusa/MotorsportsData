'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { formatCents } from '@/lib/money'

export type CartItem = {
  variantId: number
  productSlug: string
  productName: string
  color: string
  size: string
  priceCents: number
  image: string
  quantity: number
  maxStock: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotalCents: number
  open: () => void
  close: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  updateQuantity: (variantId: number, qty: number) => void
  removeItem: (variantId: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'motod-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore malformed cart
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + qty, i.maxStock) }
            : i,
        )
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxStock) }]
    })
    setIsOpen(true)
  }, [])

  const updateQuantity = useCallback((variantId: number, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(Math.max(qty, 0), i.maxStock) } : i))
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)

  // Don't render children until hydrated from localStorage to avoid hydration mismatch
  if (!hydrated) {
    return (
      <CartContext.Provider
        value={{
          items: [],
          isOpen: false,
          itemCount: 0,
          subtotalCents: 0,
          open: () => {},
          close: () => {},
          addItem: () => {},
          updateQuantity: () => {},
          removeItem: () => {},
          clear: () => {},
        }}
      >
        {children}
      </CartContext.Provider>
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        subtotalCents,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export { formatCents }
