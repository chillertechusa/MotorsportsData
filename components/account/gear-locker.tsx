'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart, formatCents } from '@/lib/cart-context'
import { Shirt, RotateCcw, Check, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

type LockerItem = {
  variantId: number
  productSlug: string
  productName: string
  color: string
  size: string
  priceCents: number
  image: string
  currentStock: number
  qtyOwned: number
  lastOrdered: Date | string
}

export default function GearLocker({ items }: { items: LockerItem[] }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <div className="bg-[#151515] border border-white/10 p-12 text-center">
        <Shirt className="w-10 h-10 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 mb-6">Your locker is empty. Gear you buy shows up here for easy reorders.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Browse Gear
        </Link>
      </div>
    )
  }

  function reorder(g: LockerItem) {
    addItem(
      {
        variantId: g.variantId,
        productSlug: g.productSlug,
        productName: g.productName,
        color: g.color,
        size: g.size,
        priceCents: g.priceCents,
        image: g.image,
        maxStock: g.currentStock,
      },
      1,
    )
    setAdded(g.variantId)
    setTimeout(() => setAdded((v) => (v === g.variantId ? null : v)), 1800)
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((g) => {
        const soldOut = g.currentStock <= 0
        const low = g.currentStock > 0 && g.currentStock <= 3
        const justAdded = added === g.variantId
        return (
          <div key={g.variantId} className="bg-[#151515] border border-white/10 flex flex-col">
            <div className="aspect-square bg-black/40 relative overflow-hidden">
              {g.image ? (
                <Image src={g.image || '/placeholder.svg'} alt={g.productName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shirt className="w-10 h-10 text-white/20" />
                </div>
              )}
              {soldOut && (
                <div className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold uppercase px-2 py-1 tracking-widest">
                  Sold Out
                </div>
              )}
              {low && (
                <div className="absolute top-2 right-2 bg-amber-500/90 text-black text-[10px] font-bold uppercase px-2 py-1 tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {g.currentStock} Left
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <p className="text-white text-sm font-medium leading-snug">{g.productName}</p>
              <p className="text-white/40 text-xs mt-1">
                {g.color} · {g.size}
              </p>
              <div className="flex items-center justify-between mt-2 mb-4">
                <span className="text-white/60 text-xs">Owned: {g.qtyOwned}</span>
                <span className="text-primary font-bold">{formatCents(g.priceCents)}</span>
              </div>

              <div className="mt-auto">
                {soldOut ? (
                  <button
                    disabled
                    className="w-full py-2.5 text-sm font-bold uppercase tracking-widest bg-white/5 text-white/30 cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    Out Of Stock
                  </button>
                ) : (
                  <button
                    onClick={() => reorder(g)}
                    className="w-full py-2.5 text-sm font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" /> Reorder
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
