'use client'

import { useCart, formatCents } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, subtotalCents, itemCount } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-card border-l border-border shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            className="text-foreground text-2xl font-black uppercase"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Your Cart {itemCount > 0 && <span className="text-primary">({itemCount})</span>}
          </h2>
          <button
            onClick={close}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted-foreground uppercase tracking-widest text-sm">Your cart is empty</p>
            <Link
              href="/shop"
              onClick={close}
              className="bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Shop Gear
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3 border-b border-border/50 pb-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white">
                      {item.image && (
                        <Image src={item.image} alt={item.productName} fill className="object-contain" sizes="80px" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p
                        className="text-foreground text-sm font-bold uppercase leading-tight"
                        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                      >
                        {item.productName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.color} · {item.size}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-primary text-sm font-black" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                          {formatCents(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground text-sm uppercase tracking-widest">Subtotal</span>
                <span
                  className="text-foreground text-xl font-black"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {formatCents(subtotalCents)}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Shipping & tax calculated at checkout. Free shipping over $100.
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full bg-primary py-4 text-center text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
